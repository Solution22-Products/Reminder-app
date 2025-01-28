import { logout } from "@/app/(signin-setup)/logout/action";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set(name, value, options);
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set(name, "", { ...options, maxAge: -1 });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userId = user?.id;

  const publicRoutes = ["/sign-in", "/forget-password"];

  if(user && user?.user_metadata.status !==  "Active") {
    console.log("User is not active");
    logout();
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  if (
    (user && request.nextUrl.pathname === "/sign-in")
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (!user && !publicRoutes.includes(request.nextUrl.pathname)) {
    // console.log(publicRoutes, "routes");
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  if (!user && !publicRoutes.includes(request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL('/forget-password', request.url));
  }

  if (!user && !publicRoutes.includes(request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return response;
}
