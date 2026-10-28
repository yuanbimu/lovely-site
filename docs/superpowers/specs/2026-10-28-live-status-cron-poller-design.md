# 直播状态快照化改造（Cron Poller）设计

- 日期：2026-10-28
- 状态：待评审
- 关联代码：`functions/api/routes/live.ts`、`functions/lib/db.ts`、`workers/live-poller/`（新增）

## 1. 背景

当前 `GET /api/live` 每次请求都实时查询 B 站 `room/v1/Room/getRoomInfoOld`（`functions/api/routes/live.ts:186`），并用 D1 `live_status` 表缓存粉丝数与兜底快照。这带来两个问题：

1. **请求量与访客量成正比**，且每个访客都要等一次 B 站往返（最长 4 秒超时）。
2. 多个边缘节点并发回源时没有合并，B 站侧看到的请求数不可控。

参考实现 `harei-backend`（`app/services/bili_captain_listener.py:258`）采用的是「进程内轮询 + 内存快照」：固定间隔抓取，接口只读快照。该模型在 Cloudflare Pages Functions 上不可直接照搬，因为 Pages 无常驻进程、模块级变量随 isolate 回收且各边缘节点互不可见。

## 2. 目标与非目标

**目标**

- 直播状态由定时任务抓取，站点请求不再触发 B 站回源（兜底除外）。
- 对外接口契约完全不变，前端 `LiveStatus.tsx`、`HeroBanner.astro` 零改动。
- 快照新鲜度可被外部观察（`stale` 字段语义不变）。
- 抓取失败时绝不写入"未开播"，只能用旧快照 + `stale` 表达。

**非目标**

- 不做开播通知/推送（邮件、WebPush 均不在本次范围）。
- 不引入 WebSocket 监听（B 站弹幕长连接）。
- 不改造 `dynamics`、`timeline` 等其它数据链路。
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

## 4. 架构

```
每分钟（Cron Trigger "* * * * *"）
  Worker: lovely-live-poller
    scheduled() → fetch B 站 → INSERT live_status → prune

访客请求
  Pages Function: GET /api/live
    SELECT 最新一行 → 计算 age → 输出 payload（必要时同步兜底回源一次）
```

两个部署单元之间**只通过 D1 的 `live_status` 表耦合**，没有直接调用。

## 5. 数据模型

新增一列，两个时间戳各司其职：

```sql
ALTER TABLE live_status ADD COLUMN fans_checked_at INTEGER;
```

| 列 | 含义 | 推进频率 |
|---|---|---|
| `checked_at` | 直播状态快照写入时间 | 每次成功抓状态（约 1 分钟） |
| `fans_checked_at` | 粉丝数最后成功抓取时间 | 30 分钟 |

兼容策略：历史行 `fans_checked_at` 为 `NULL`，`getLiveStatus()` 回退到 `checked_at`，无需回填。迁移脚本不可重复执行（D1 的 `ALTER TABLE ... ADD COLUMN` 无 `IF NOT EXISTS`），需在部署说明中写明"只跑一次"。

保留行数由 20 调整为 120（约 2 小时历史，便于排查上下播时点）。

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
  "fansUpdatedAt": "2026-10-28T15:10:00.000Z",
  "stale": false
}
```

状态机（`age = now - checked_at`）：

| 条件 | 行为 | `stale` |
|---|---|---|
| `age <= 90s` | 直接返回快照 | `false` |
| `90s < age <= 10min` | 返回旧快照 | `true` |
| `age > 10min` 或无快照 | 同步回源一次；成功则写库并返回新值 | 成功 `false` / 失败 `true` |
| 回源失败且无任何快照 | 沿用现有 503 结构 | `true` |

`lastChecked` 取 `checked_at`（快照时间），不是请求时间；这一点与现状不同，是本次改造的核心语义变化，必须写进文档。

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

1. 读上一行（继承 `fans` 与 `fansCheckedAt`）。
2. 请求 `getRoomInfoOld?mid=3821157`，4s 超时，带 UA/Referer。
3. 任一失败条件（超时、非 200、`code !== 0`、`data` 缺失）→ 记日志、**不写行**、返回，等待下一分钟。
4. `now - fansCheckedAt > 30min` 才请求 `x/web-interface/card`；失败则沿用旧 `fans` 且 `fans_checked_at` 不前移。
5. 写一行 + `pruneLiveStatus(120)`。

## 8. 错误处理矩阵

| 场景 | 表现 | 可观测性 |
|---|---|---|
| B 站超时 / 非 200 / `-352` 限流 | 不写行，`checked_at` 停滞 | Workers Logs |
| 连续失败 > 90s | `/api/live` 返回 `stale: true` | 前端文案 |
| 连续失败 > 10min | `/api/live` 同步兜底一次 | 路由日志 |
| 粉丝接口失败 | 状态照常写入，粉丝数保持旧值 | 日志 |
| D1 写入失败 | 抛出，不吞错 | Cron Events / Workers Logs |
| 迁移未执行 | `saveLiveStatus` 插入新列时报错 | 部署即暴露 |

## 9. 部署与回滚

部署顺序（顺序不可颠倒，否则 worker 先跑会写不进去）：

1. `npm run db:migrate:fans`（本地）/ `npm run db:migrate:fans:prod`（线上）
2. `npm run deploy:poller`
3. 合并含新 `/api/live` 的站点代码（Pages 自动构建）

回滚：`/api/live` 的新旧实现都只依赖 `live_status` 现有列，回滚站点代码不会丢数据；`fans_checked_at` 列保留即可，无需回滚迁移。停用 poller：`wrangler delete` 或清空 `triggers.crons`。

## 10. 验收标准

1. 本地 `wrangler dev --test-scheduled` 触发一次后，`live_status` 新增一行且字段完整。
2. 连续触发两次，第二次在 30 分钟内不重复请求粉丝接口（`fans_checked_at` 不变）。
3. 模拟 B 站失败（关闭网络或改错 UID），确认**没有**新增行。
4. `/api/live` 在快照 91 秒后返回 `stale: true`。
5. `/api/live` 在快照超过 10 分钟后触发一次同步回源并写回新行。
6. 无 D1 绑定时 `/api/live` 仍能返回 503 或兜底数据，不抛 500。
7. `npm run build` 通过。

## 11. 变更文件清单

| 文件 | 变更 |
|---|---|
| `workers/live-poller/wrangler.toml` | 新增：Worker 配置与 cron |
| `workers/live-poller/src/index.ts` | 新增：`scheduled` 抓取逻辑 |
| `scripts/migrations/001-live-status-fans-checked-at.sql` | 新增：加列迁移 |
| `functions/lib/db.ts` | `saveLiveStatus` 支持 `fans_checked_at`；`getLiveStatus` 返回 `fansCheckedAt` |
| `functions/api/routes/live.ts` | 改为快照读 + 兜底回源 |
| `package.json` | 新增 `db:migrate:fans`、`db:migrate:fans:prod`、`deploy:poller` |
| `AGENTS.md` | 数据流与时效约定改写 |
| `docs/database-schema.md` | 第 6 节字段与写入策略改写 |
| `.github/workflows/sync-live.yml` | 顶部注释改为「手工兜底」定位 |
| `src/pages/api/live.ts` | 仅保持字段契约一致，不改抓取逻辑（开发期副本） |

## 12. 风险

- **Cron Trigger 变更最久 15 分钟才全网生效**：首次部署后不要立刻用"没数据"判定失败。
- **单点依赖**：poller 停摆时只能靠 10 分钟兜底，最坏 10 分钟状态陈旧；这是换取请求量下降的代价。
- **B 站风控**：1440 次/天的 room 接口请求，量级远低于参考实现（每 3 秒一次），风险可接受；粉丝接口限制在 48 次/天。
- **文档漂移**：`AGENTS.md` 现有"每次请求实时查询，不做缓存"的描述必须同步修改，否则后续维护者会按旧约定改回去。
