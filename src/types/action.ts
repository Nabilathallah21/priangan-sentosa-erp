export type AppErrorCode =
  | "INSUFFICIENT_STOCK"
  | "FORBIDDEN"
  | "UNAUTHORIZED"
  | "VALIDATION_ERROR"
  | "INVALID_STATE"
  | "NOT_FOUND"
  | "DUPLICATE_CODE"
  | "IN_USE"
  | "INTERNAL_ERROR";

export type ActionResult<T> =
  | { ok: true; data: T }
  | {
      ok: false;
      error: {
        code: AppErrorCode;
        message: string;
        fieldErrors?: Record<string, string[]>;
      };
    };
