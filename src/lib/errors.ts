import { BackendError } from "./backend";

const ERROR_MAP: Record<string, string> = {
  "USER_NOT_FOUND": "errors.profile.notFound",
  "USERNAME_TAKEN": "errors.validation.usernameTaken",
  "UNAUTHORIZED": "errors.auth.unauthorized",
  "INVALID_INPUT": "errors.validation.invalidInput",
  "INTERNAL_ERROR": "errors.server.internalError",
  "NETWORK_TIMEOUT": "errors.network.timeout",
  "NETWORK_ERROR": "errors.network.connectionError",
};

export function getErrorI18nKey(err: unknown): string {
  if (err instanceof BackendError) {
    return ERROR_MAP[err.code] || "errors.server.internalError";
  }
  return "errors.server.internalError";
}
