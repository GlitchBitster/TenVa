import { auth } from "@/lib/auth";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { nextUrl } = req;
  const isAuthPage = nextUrl.pathname.startsWith("/signin") || nextUrl.pathname.startsWith("/signup");
  const isProtectedPage = nextUrl.pathname.startsWith("/account") || 
                          nextUrl.pathname.startsWith("/wishlist") || 
                          nextUrl.pathname.startsWith("/orders") ||
                          nextUrl.pathname.startsWith("/admin");
  const isAdminPage = nextUrl.pathname.startsWith("/admin");

  if (isAuthPage && isLoggedIn) {
    return Response.redirect(new URL("/account", nextUrl));
  }

  if (isProtectedPage && !isLoggedIn) {
    return Response.redirect(new URL(`/signin?callbackUrl=${encodeURIComponent(nextUrl.pathname)}`, nextUrl));
  }

  if (isAdminPage && isLoggedIn && req.auth?.user?.role !== "admin") {
    return Response.redirect(new URL("/", nextUrl));
  }
});

export const config = {
  matcher: [
    "/account/:path*",
    "/wishlist/:path*",
    "/orders/:path*",
    "/admin/:path*",
    "/signin",
    "/signup"
  ]
};
