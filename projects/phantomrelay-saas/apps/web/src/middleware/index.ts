import { defineMiddleware } from "astro:middleware";

const PROTECTED_PREFIXES = ["/dashboard", "/onboarding"];
const AUTH_PAGES = ["/login", "/signup", "/es/login", "/es/signup"];
const TOKEN_COOKIE = "auth-token";

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;
  const token = context.cookies.get(TOKEN_COOKIE)?.value;

  // Protected routes: redirect to login if no token
  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (isProtected && !token) {
    const loginUrl = new URL("/login", context.url.origin);
    loginUrl.searchParams.set("next", pathname);
    return context.redirect(loginUrl.toString());
  }

  // Auth pages: redirect to dashboard if already authenticated
  const isAuthPage = AUTH_PAGES.some(
    (page) => pathname === page || pathname === `${page}/`
  );

  if (isAuthPage && token) {
    return context.redirect("/dashboard");
  }

  return next();
});
