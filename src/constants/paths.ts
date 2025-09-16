export const protectedRoute: string[] = ["/profile"];

export const localizedProtectedRoute = protectedRoute.map(
  (route) => `/:locale${route}(.*)`
);
