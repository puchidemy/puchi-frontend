export const protectedRoute: string[] = [
  "/in",
  "/learn",
  "/settings",
  "/user-search",
  "/lesson",
];

export const localizedProtectedRoute = protectedRoute.map(
  (route) => `/:locale${route}(.*)`,
);
