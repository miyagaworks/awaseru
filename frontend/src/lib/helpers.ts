// frontend/src/lib/helpers.ts
// クライアントサイドでも使用できるヘルパー関数
import type { FormattedResponses, ResponseStatus } from "@/types/database";

export function formatResponses(
  responses: Array<{
    participant_name: string;
    date: string;
    status: ResponseStatus;
  }>
): FormattedResponses {
  const formatted: FormattedResponses = {};
  responses.forEach((response) => {
    if (!formatted[response.participant_name]) {
      formatted[response.participant_name] = {};
    }
    formatted[response.participant_name][response.date] = response.status;
  });
  return formatted;
}

export function generateInitialResponses(
  eventId: string,
  participants: string[],
  dates: string[]
): Array<{
  event_id: string;
  participant_name: string;
  date: string;
  status: ResponseStatus;
}> {
  return dates.flatMap((date) =>
    participants.map((participant) => ({
      event_id: eventId,
      participant_name: participant,
      date: date,
      status: "未回答" as ResponseStatus,
    }))
  );
}
