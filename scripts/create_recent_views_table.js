/**
 * Supabase recent_views 테이블 생성 스크립트
 * Direct API call - no dependencies
 */

const PROJECT_ID = 'julomhqvaasuxtbhgeqx';
const ACCESS_TOKEN = 'sbp_f40b15f794e727f0aa9161de38c497174fcac2ee';

const sql = `
CREATE TABLE IF NOT EXISTS recent_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ DEFAULT NOW(),
  view_count INTEGER DEFAULT 1,
  UNIQUE(user_id, restaurant_id)
);

CREATE INDEX IF NOT EXISTS idx_recent_views_user_time
  ON recent_views(user_id, viewed_at DESC);

CREATE INDEX IF NOT EXISTS idx_recent_views_viewed_at
  ON recent_views(viewed_at);

ALTER TABLE recent_views ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'recent_views' AND policyname = 'Users can view own recent views'
  ) THEN
    CREATE POLICY "Users can view own recent views" ON recent_views
      FOR SELECT USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'recent_views' AND policyname = 'Users can insert own recent views'
  ) THEN
    CREATE POLICY "Users can insert own recent views" ON recent_views
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'recent_views' AND policyname = 'Users can delete own recent views'
  ) THEN
    CREATE POLICY "Users can delete own recent views" ON recent_views
      FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;
`;

async function createTable() {
  console.log('🚀 Supabase Management API를 통해 recent_views 테이블 생성 중...');
  console.log('📦 Project ID:', PROJECT_ID);

  const url = `https://api.supabase.com/v1/projects/${PROJECT_ID}/database/query`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: sql }),
    });

    const responseText = await response.text();

    if (!response.ok) {
      console.error(`❌ API 오류 (${response.status}):`, responseText);
      process.exit(1);
    }

    console.log('✅ recent_views 테이블이 성공적으로 생성되었습니다!');
    console.log('📋 결과:', responseText);
  } catch (error) {
    console.error('❌ 요청 실패:', error.message);
    process.exit(1);
  }
}

createTable();
