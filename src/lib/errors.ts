import { AppErrorCode, ActionResult } from "@/types/action";

export class AppError extends Error {
  constructor(
    public readonly code: AppErrorCode,
    message: string,
    public readonly fieldErrors?: Record<string, string[]>
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function toActionError<T>(err: unknown): ActionResult<T> {
  if (err instanceof AppError) {
    return {
      ok: false,
      error: {
        code: err.code,
        message: err.message,
        fieldErrors: err.fieldErrors,
      },
    };
  }
  return {
    ok: false,
    error: {
      code: "INTERNAL_ERROR",
      message: err instanceof Error ? err.message : "Terjadi kesalahan pada server.",
    },
  };
}
