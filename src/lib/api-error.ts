/**
 * Normalized API error from Go services / Limen.
 *
 * Prefer reading `status` + `reason`/`code` over string-matching `message`.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly reason: string;
  readonly code: string;
  readonly body: unknown;

  constructor(opts: {
    status: number;
    message: string;
    reason?: string;
    code?: string;
    body?: unknown;
  }) {
    super(opts.message);
    this.name = "ApiError";
    this.status = opts.status;
    this.reason = opts.reason || "";
    this.code = opts.code || "";
    this.body = opts.body;
  }

  get isUnauthorized(): boolean {
    return this.status === 401;
  }

  get isNotFound(): boolean {
    return this.status === 404;
  }
}

/** Parse JSON error bodies from Kratos/gRPC-gateway, pkg/apierr, Limen. */
export function apiErrorFromResponse(status: number, body: unknown): ApiError {
  const b = (body && typeof body === "object" ? body : {}) as Record<
    string,
    unknown
  >;
  const message = String(
    b.message || b.error || b.msg || `Request failed with status ${status}`,
  );
  const reason = String(b.reason || b.code || "");
  const code = String(b.code || b.reason || "");
  return new ApiError({ status, message, reason, code, body });
}

export function isApiError(err: unknown): err is ApiError {
  return err instanceof ApiError;
}
