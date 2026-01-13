import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value
                },
                set(name: string, value: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                },
                remove(name: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                },
            },
        }
    )

    const { data: { user } } = await supabase.auth.getUser()

    // 2. Route Protection
    const url = request.nextUrl.clone()

    // Protected Routes: Studio & Admin
    if (request.nextUrl.pathname.startsWith('/studio') || request.nextUrl.pathname.startsWith('/admin')) {
        if (!user) {
            url.pathname = '/auth/login'
            url.searchParams.set('next', request.nextUrl.pathname) // Friendly redirect
            return NextResponse.redirect(url)
        }
    }

    // Auth Routes: Redirect to dashboard if already logged in (Optional but good UX)
    if (request.nextUrl.pathname.startsWith('/auth/login') || request.nextUrl.pathname.startsWith('/auth/register')) {
        if (user) {
            // Default to studio dashboard
            url.pathname = '/studio'
            return NextResponse.redirect(url)
        }
    }

    return response
}
