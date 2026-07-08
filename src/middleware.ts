import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  if (pathname === "/admin/login") {
    if (user) {
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();

      if (profile?.role === "admin") {
        const adminUrl = new URL("/admin/products", request.url);
        return NextResponse.redirect(adminUrl);
      }
    }

    return response;
  }

  if (pathname.startsWith("/admin")) {
    if (!user) {
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();

    if (!profile || profile.role !== "admin") {
      const deniedUrl = new URL("/", request.url);
      deniedUrl.searchParams.set("message", "Acceso denegado");
      return NextResponse.redirect(deniedUrl);
    }
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
