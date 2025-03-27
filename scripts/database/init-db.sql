-- データベース作成
CREATE DATABASE awaseru;

-- データベースに接続
\c awaseru

-- UUID拡張機能を有効化
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- テーブル作成
CREATE TABLE events (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT,
  description TEXT,
  dates DATE[] NOT NULL,
  participants TEXT[] NOT NULL CHECK (array_length(participants, 1) <= 20),
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '3 months')
);

CREATE TABLE responses (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  participant_name TEXT NOT NULL,
  date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('未回答', '◯', '×', '△')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- インデックス作成
CREATE INDEX idx_responses_event_id ON responses(event_id);
CREATE INDEX idx_responses_participant ON responses(participant_name);
CREATE INDEX idx_responses_date ON responses(date);
CREATE INDEX idx_events_expires_at ON events(expires_at);

-- 古いイベントの自動削除のためのファンクション
CREATE OR REPLACE FUNCTION cleanup_expired_events()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM events WHERE expires_at < NOW();
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 毎日実行するトリガーの作成
CREATE EXTENSION IF NOT EXISTS pg_cron;
SELECT cron.schedule('0 0 * * *', 'SELECT cleanup_expired_events()');

-- データベース権限設定
-- 注: 本番環境では適切なユーザー名とパスワードに置き換えてください
CREATE USER awaseru_app WITH PASSWORD 'secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE awaseru TO awaseru_app;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO awaseru_app;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO awaseru_app;
