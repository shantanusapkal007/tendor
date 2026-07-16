import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
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
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
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

  // This will refresh session if expired - required for Server Components
  // https://supabase.com/docs/guides/auth/server-side/nextjs
  const { data: { user } } = await supabase.auth.getUser()

  // Define public routes
  const isPublicRoute = request.nextUrl.pathname.startsWith('/login') || 
                        request.nextUrl.pathname.startsWith('/auth/callback') ||
                        request.nextUrl.pathname.startsWith('/unauthorized')

  // If user is not signed in and the current path is not a public route
  // redirect the user to the /login page
  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // If user IS signed in, check if they exist in the AppUser table
  if (user) {
    const { data: appUser } = await supabase
      .from('AppUser')
      .select('role')
      .eq('email', user.email)
      .maybeSingle()

    const isUnauthorizedRoute = request.nextUrl.pathname.startsWith('/unauthorized')
    const isLoginRoute = request.nextUrl.pathname.startsWith('/login')
    const isCallbackRoute = request.nextUrl.pathname.startsWith('/auth/callback')

    if (!appUser) {
      // User logged in via Google but is not in our AppUser table
      if (!isUnauthorizedRoute && !isCallbackRoute) {
        const url = request.nextUrl.clone()
        url.pathname = '/unauthorized'
        return NextResponse.redirect(url)
      }
    } else {
      // User is authorized
      // If trying to access login or unauthorized, redirect to dashboard
      if (isLoginRoute || isUnauthorizedRoute) {
        const url = request.nextUrl.clone()
        url.pathname = '/'
        return NextResponse.redirect(url)
      }

      // If they are trying to access /users or /products but are not an admin, redirect to home
      if ((request.nextUrl.pathname.startsWith('/users') || request.nextUrl.pathname.startsWith('/products')) && appUser.role !== 'admin') {
        const url = request.nextUrl.clone()
        url.pathname = '/'
        return NextResponse.redirect(url)
      }
    }
  }

  return supabaseResponse
}
