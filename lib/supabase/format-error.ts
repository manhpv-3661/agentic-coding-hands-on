export function formatSupabaseError(error: unknown) {
  if (!error || typeof error !== "object") {
    return error;
  }

  const candidate = error as {
    code?: unknown;
    message?: unknown;
    details?: unknown;
    hint?: unknown;
    status?: unknown;
    statusText?: unknown;
  };

  return {
    code: candidate.code,
    message: candidate.message,
    details: candidate.details,
    hint: candidate.hint,
    status: candidate.status,
    statusText: candidate.statusText,
  };
}
