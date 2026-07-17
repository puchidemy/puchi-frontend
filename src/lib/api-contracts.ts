export type Default = { url: string; method: string; data: unknown; result: unknown };
export type TRequest<T extends Default> = { url: T['url']; method?: T['method']; data: T['data'] };
export type TResponse<T extends Default> = T['result'];

// Limen auth contracts (mounted at /auth)
export interface APILogin extends Default {
  url: '/auth/signin/credential';
  method: 'post';
  data: { credential: string; password: string; remember_me?: boolean };
  result: { user: { id: string; email: string } } | { message: string };
}

export interface APIRegister extends Default {
  url: '/auth/signup/credential';
  method: 'post';
  data: { email: string; password: string; username?: string; firstname?: string };
  result: { user: { id: string; email: string } } | { message: string };
}

export interface APIForgotPassword extends Default {
  url: '/auth/passwords/request-reset';
  method: 'post';
  data: { email: string };
  result: Record<string, unknown> | { message: string };
}

export interface APIResetPassword extends Default {
  url: '/auth/passwords/reset';
  method: 'post';
  data: { token: string; newPassword: string };
  result: Record<string, unknown> | { message: string };
}
