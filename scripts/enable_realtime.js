/**
 * Supabase Realtime 활성화 스크립트
 */

const PROJECT_ID = 'julomhqvaasuxtbhgeqx';
const ACCESS_TOKEN = 'sbp_f40b15f794e727f0aa9161de38c497174fcac2ee';

// 테이블별로 개별 쿼리 실행
const tables = ['notifications', 'orders', 'rider_locations', 'chat_messages', 'chat_rooms'];

async function enableRealtime() {
    console.log('🔄 Supabase Realtime 활성화 시작...\n');

    for (const table of tables) {
        const sql = `
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_publication_tables 
          WHERE pubname = 'supabase_realtime' AND tablename = '${table}'
        ) THEN
          ALTER PUBLICATION supabase_realtime ADD TABLE ${table};
        END IF;
      END $$;
    `;

        console.log(`📌 ${table} 테이블 처리 중...`);

        try {
            const response = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_ID}/database/query`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${ACCESS_TOKEN}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query: sql }),
            });

            const result = await response.text();

            if (response.ok) {
                console.log(`   ✅ ${table} - 성공`);
            } else {
                console.log(`   ⚠️ ${table} - ${result}`);
            }
        } catch (error) {
            console.log(`   ❌ ${table} - 오류: ${error.message}`);
        }
    }

    console.log('\n🎉 Realtime 활성화 완료!');
}

enableRealtime();
