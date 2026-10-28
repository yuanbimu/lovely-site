# 直播状态快照化改造（Cron Poller）设计

- 日期：2026-10-28
- 状态：待评审（v2，合并粉丝数抓取）
- 关联代码：`functions/api/routes/live.ts`、`workers/live-poller/`（新增）

## 1. 背景

当前 `GET /api/live` 每次请求都实时查询 B 站 `room/v1/Room/getRoomInfoOld`（`functions/api/routes/live.ts:186`），并用 D1 `live_status` 表缓存粉丝数与兜底快照。这带来两个问题：

1. **请求量与访客量成正比**，且每个访客都要等一次 B 站往返（最长 4 秒超时）。
2. 多个边缘节点并发回源时没有合并，B 站侧看到的请求数不可控。

参考实现 `harei-backend`（`app/services/bili_captain_listener.py:258`）采用「进程内轮询 + 内存快照」：固定间隔抓取，接口只读快照。该模型在 Cloudflare Pages Functions 上不可直接照搬，因为 Pages 无常驻进程、模块级变量随 isolate 回收且各边缘节点互不可见。

## 2. 目标与非目标

**目标**

- 直播状态与粉丝数由定时任务一次抓取，站点请求不再触发 B 站回源（兜底除外）。
- 对外接口契约完全不变，前端 `LiveStatus.tsx`、`HeroBanner.astro` 零改动。
- 快照新鲜度可被外部观察（`stale` 字段语义不变）。
- 抓取失败时绝不写入"未开播"，只能用旧快照 + `stale` 表达。

**非目标**

- 不做开播通知/推送（邮件、WebPush 均不在本次范围）。
- 不引入 WebSocket 监听（B 站弹幕长连接）。
- 不改造 `dynamics`、`timeline` 等其它数据链路。
- **不改动 D1 表结构**（v1 方案中的 `fans_checked_at` 列已取消）。
- 不重建 `scripts/init-db.sql`（该文件当前缺失，属既有问题，另行处理）。

## 3. 方案选择

| 方案 | 结论 | 理由 |
|---|---|---|
| A. D1 + 请求时惰性刷新 | 否决 | 仍需请求触发，无法保证"没访客也在更新"，且并发下会重复回源 |
| B. Cache API 60s | 否决 | 每个边缘节点独立刷新，跨区域状态不一致，无法做统一新鲜度判定 |
| **C. 独立 Cron Worker 直写 D1** | **采用** | 与访问量解耦；复用同一 D1；不需要公开端点与鉴权 |
| D. 模块级内存变量 | 否决 | isolate 随时回收，多节点各自一份，不能作为唯一状态源 |
| E. GitHub Actions 定时 | 否决 | cron 最小 5 分钟且被节流（`sync-live.yml` 注释已记录），达不到 60s |

C 的两种形态中，选择 **Worker 直写 D1** 而不是「Worker 回调 Pages 内部端点」：少一跳网络、少一个需要鉴权的公开端点、少一个失败点。

## 4. 抓取节奏：状态与粉丝数合并

v1 曾把两者拆成 1 分钟 / 30 分钟两条节奏，并为粉丝数单独记录时间戳。该设计已取消。

理由：粉丝数的 30 分钟缓存是「每次请求都抓」时代的产物，用于压低请求量；抓取移交给 cron 后请求量与访客量已解耦，拆分只会平白增加一列、一次迁移和一套回退逻辑。

因此**每分钟一次抓取，同时取回状态与粉丝数，写入一行**。代价是粉丝接口从 48 次/天升到 1440 次/天；失败路径为"沿用上一行粉丝数"，不影响直播状态写入，风控 `-352` 最坏只导致粉丝数字停滞。

## 5. 数据模型

**无变更。** 复用现有 `live_status`：

| 列 | 含义 | 推进频率 |
|---|---|---|
| `is_live` / `title` / `room_id` / `url` | 直播状态快照 | 每分钟 |
| `fans` | 粉丝数，抓取失败时沿用上一行 | 每分钟 |
| `checked_at` | 本行写入时间，即"最后成功抓取时间" | 每分钟 |

保留行数由 20 调整为 120（约 2 小时历史，便于排查上下播时点）。`pruneLiveStatus()` 本身不改，只改调用处常量。

`functions/lib/db.ts` **无需修改**：`saveLiveStatus` 已接受 `fans`，`getLiveStatus` 已返回 `fans` 与 `checkedAt`。

## 6. 接口契约

`GET /api/live` 响应字段保持不变：

```json
{
  "isLive": true,
  "title": "直播标题",
  "url": "https://live.bilibili.com/123456",
  "roomId": "123456",
  "fans": 12345,
  "lastChecked": "2026-10-28T15:36:54.000Z",
  "fansUpdatedAt": "2026-10-28T15:36:54.000Z",
  "stale": false
}
```

`lastChecked` 改为取快照的 `checked_at`，**不再是请求时间**——这是本次改造的核心语义变化。`fansUpdatedAt` 与 `lastChecked` 同值（该字段前端未消费，保留仅为契约兼容）。

状态机（`age = now - checked_at`）：

| 条件 | 行为 | `stale` |
|---|---|---|
| `age <= 90s` | 直接返回快照 | `false` |
| `90s < age <= 10min` | 返回旧快照，不刷新 | `true` |
| `age > 10min` 或无快照 | 同步回源一次；成功则写库并返回新值 | 成功 `false` / 失败 `true` |
| 回源失败且无任何快照 | 沿用现有 503 结构 | `true` |

## 7. Worker 实现要点

文件：

```
workers/live-poller/
├── wrangler.toml
└── src/index.ts
```

- `name = "lovely-live-poller"`，`workers_dev = false`（不暴露公开地址）。
- 绑定与 Pages 相同的 D1：`database_id = "ed2f83e9-07b8-4d2f-b0e7-788c4cfee4a0"`。
- `[[triggers]] crons = ["* * * * *"]`。
- 复用 `../../../functions/lib/db.ts` 的 `saveLiveStatus` / `getLiveStatus` / `pruneLiveStatus`，不自拼 SQL。
- `scheduled` 内必须 `ctx.waitUntil(...)`，否则 handler 提前返回导致任务被回收。

抓取流程：

1. 读上一行（仅用于粉丝数失败时继承旧值）。
2. 并行请求 `getRoomInfoOld?mid=3821157` 与 `x/web-interface/card?mid=3821157`，各自 4s 超时，带 UA/Referer。
3. 房间接口任一失败条件（超时、非 200、`code !== 0`、`data` 缺失）→ 记日志、**不写行**、返回，等待下一分钟。
4. 粉丝接口失败（或返回 0）→ `fans` 取上一行值；**不阻塞**状态写入。
5. 写一行 + `pruneLiveStatus(120)`。

## 8. 错误处理矩阵

| 场景 | 表现 | 可观测性 |
|---|---|---|
| B 站房间接口超时 / 非 200 / `-352` | 不写行，`checked_at` 停滞 | Workers Logs |
| 连续失败 > 90s | `/api/live` 返回 `stale: true` | 前端文案 |
| 连续失败 > 10min | `/api/live` 同步兜底一次 | 路由日志 |
| 粉丝接口失败 | 状态照常写入，粉丝数保持旧值 | 日志 |
| D1 写入失败 | 抛出，不吞错 | Cron Events / Workers Logs |

## 9. 部署与回滚

部署顺序：

1. `npm run deploy:poller`
2. 合并含新 `/api/live` 的站点代码（Pages 自动构建）

无需数据库迁移，部署顺序没有强依赖：poller 先跑起来只是提前开始写快照。

回滚：`/api/live` 新旧实现都只依赖 `live_status` 现有列，回滚站点代码不丢数据。停用 poller：`wrangler delete` 或清空 `triggers.crons`。

## 10. 验收标准

1. 本地 `wrangler dev --test-scheduled` 触发一次后，`live_status` 新增一行，`fans > 0` 且字段完整。
2. 连续触发两次，产生两行，`checked_at` 递增。
3. 模拟房间接口失败（断网或改错 UID），确认**没有**新增行。
4. 模拟粉丝接口失败，确认状态仍然写入、`fans` 沿用上一行值。
5. `/api/live` 在快照 91 秒后返回 `stale: true`。
6. `/api/live` 在快照超过 10 分钟后触发一次同步回源并写回新行。
7. 无 D1 绑定时 `/api/live` 仍能返回 503，不抛 500。
8. `npm run build` 通过。

## 11. 变更文件清单

| 文件 | 变更 |
|---|---|
| `workers/live-poller/wrangler.toml` | 新增：Worker 配置与 cron |
| `workers/live-poller/src/index.ts` | 新增：`scheduled` 抓取逻辑 |
| `functions/api/routes/live.ts` | 改为快照读 + 兜底回源 |
| `package.json` | 新增 `deploy:poller`（`wrangler deploy -c workers/live-poller/wrangler.toml`） |
| `AGENTS.md` | 数据流与时效约定改写 |
| `docs/database-schema.md` | 第 6 节写入策略改写 |
| `.github/workflows/sync-live.yml` | 顶部注释改为「手工兜底」定位 |
| `src/pages/api/live.ts` | 仅保持字段契约一致，不改抓取逻辑（开发期副本） |

`functions/lib/db.ts` 不在变更清单内。

## 12. 风险

- **Cron Trigger 变更最久 15 分钟才全网生效**：首次部署后不要立刻用"没数据"判定失败。
- **单点依赖**：poller 停摆时只能靠 10 分钟兜底，最坏 10 分钟状态陈旧；这是换取请求量下降的代价。
- **粉丝接口频率上升**：1440 次/天可能带来 `-352`，表现为粉丝数不更新；可回退为"每 N 分钟才附带抓一次粉丝数"，但需要重新引入时间戳列，本次不做。
- **文档漂移**：`AGENTS.md` 现有"每次请求实时查询，不做缓存"与"粉丝数 30 分钟内不重复抓取"的描述必须同步修改，否则后续维护者会按旧约定改回去。
