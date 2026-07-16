export type Default = { url: string; method: string; data: unknown; result: unknown };
export type TRequest<T extends Default> = { url: T['url']; method?: T['method']; data: T['data'] };
export type TResponse<T extends Default> = T['result'];

// Auth contracts
export interface APILogin extends Default {
  url: '/api/auth/login';
  method: 'post';
  data: { email: string; password: string; authRequestId?: string };
  result: { success: boolean; sessionId?: string; callbackUrl?: string } | { error: string };
}

export interface APIRegister extends Default {
  url: '/api/auth/register';
  method: 'post';
  data: { email: string; password: string; firstName?: string; lastName?: string };
  result: { success: boolean; userId?: string } | { error: string };
}

export interface APIForgotPassword extends Default {
  url: '/api/auth/forgot-password';
  method: 'post';
  data: { email: string };
  result: { success: boolean } | { error: string };
}

export interface APIResetPassword extends Default {
  url: '/api/auth/reset-password';
  method: 'post';
  data: { userId: string; code: string; password: string };
  result: { success: boolean } | { error: string };
}

export interface APISocialLogin extends Default {
  url: '/api/auth/social';
  method: 'post';
  data: { provider: string };
  result:
    | { idpId: string; name: string; authUrl: string; idpIntentId: string }
    | { error: string };
}
