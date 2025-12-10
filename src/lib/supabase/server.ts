import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database.types'

/**
 * 서버용 Supabase 클라이언트
 * Server Components, Route Handlers, Server Actions에서 사용
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options)
            }
          } catch (error) {
            // Intentionally ignored: 서버 컴포넌트에서 호출된 경우 무시
            // 미들웨어에서 세션을 갱신함
            // Error is expected and safe to ignore in server components
            console.debug('Cookie setting failed (expected in server components):', error)
          }
        },
      },
    }
  )
}
