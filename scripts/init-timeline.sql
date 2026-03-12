-- =====================================================
-- Timeline Events 初始化数据
-- =====================================================
-- 导入东爱璃早期重要事件
-- 执行方式：wrangler d1 execute lovely-site-db --file=scripts/init-timeline.sql

INSERT OR REPLACE INTO timeline_events 
(id, date, title, content, color, icon, sort_order, created_at, updated_at)
VALUES 
(
  'event_20200426',
  '2020-04-26',
  '在 B 站发表第一条动态',
  '',
  'blue',
  '⭐',
  1,
  strftime('%s', 'now'),
  strftime('%s', 'now')
),
(
  'event_20200428',
  '2020-04-28',
  '投稿第一个视频，展示了自己的立绘',
  '',
  'blue',
  '▶️',
  2,
  strftime('%s', 'now'),
  strftime('%s', 'now')
),
(
  'event_20200429_1',
  '2020-04-29',
  '投稿自我介绍视频',
  '在视频末尾，误认已经切断直播而用本音发出「早知道这样我还不如回老家种地呢」的名言。种田系偶像的起源。',
  'green',
  '🎤',
  3,
  strftime('%s', 'now'),
  strftime('%s', 'now')
),
(
  'event_20200501',
  '2020-05-01',
  '首次直播',
  '进行了首次正式直播，与观众互动。',
  'purple',
  '🎬',
  4,
  strftime('%s', 'now'),
  strftime('%s', 'now')
);
