/**
 * Formats a `Date` into the same literal display shape already used by
 * every mock `KudosPost.timestamp` in `kudos-data.ts` (`"HH:mm -
 * MM/DD/YYYY"`, zero-padded) — no date library, matching this repo's
 * existing "timestamp is a pre-formatted string" convention (F006,
 * `kudos-types.ts`). Used by the compose form (F007) to stamp a
 * newly-submitted `KudosPost` with the current time.
 */
export function formatKudosTimestamp(date: Date): string {
  const hours = pad2(date.getHours());
  const minutes = pad2(date.getMinutes());
  const month = pad2(date.getMonth() + 1);
  const day = pad2(date.getDate());
  const year = date.getFullYear();

  return `${hours}:${minutes} - ${month}/${day}/${year}`;
}

function pad2(value: number): string {
  return value.toString().padStart(2, "0");
}
