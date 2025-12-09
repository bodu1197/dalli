import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // 세션 갱신 (중요: 항상 호출해야 함)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 보호된 라우트 체크
  const protectedRoutes = ['/my', '/owner', '/rider', '/admin', '/checkout', '/orders']
  const isProtectedRoute = protectedRoutes.some(route =>
    request.nextUrl.pathname.startsWith(route)
  )

  // 인증 필요 페이지에 미인증 접근 시 로그인으로 리다이렉트
  if (isProtectedRoute && !user) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirectTo', request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // 이미 로그인한 사용자가 로그인/회원가입 페이지 접근 시 홈으로 리다이렉트
  const authRoutes = ['/login', '/signup']
  const isAuthRoute = authRoutes.some(route =>
    request.nextUrl.pathname.startsWith(route)
  )

  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // 역할 기반 접근 제어
  if (user) {
    const userRole = user.user_metadata?.role || 'customer'

    // 점주 전용 페이지
    if (request.nextUrl.pathname.startsWith('/owner') && userRole !== 'owner') {
      return NextResponse.redirect(new URL('/', request.url))
    }

    // 라이더 전용 페이지
    if (request.nextUrl.pathname.startsWith('/rider') && userRole !== 'rider') {
      return NextResponse.redirect(new URL('/', request.url))
    }

    // 관리자 전용 페이지
    if (request.nextUrl.pathname.startsWith('/admin') && userRole !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * 다음 경로 제외:
     * - _next/static (정적 파일)
     * - _next/image (이미지 최적화)
     * - favicon.ico (파비콘)
     * - public 폴더 파일들
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
