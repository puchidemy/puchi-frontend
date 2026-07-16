export const protectedRoute: string[] = ["/in"];

export const localizedProtectedRoute = protectedRoute.map(
  (route) => `/:locale${route}(.*)`
);
