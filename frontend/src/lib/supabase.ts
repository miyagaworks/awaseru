// frontend/src/lib/supabase.ts
// Neon用に書き換え
import { neon } from "@neondatabase/serverless";
import type {
  Event,
  Response,
  FormattedResponses,
  ResponseStatus,
} from "@/types/database";

if (!process.env.DATABASE_URL) {
  throw new Error("Missing env.DATABASE_URL");
}

const sql = neon(process.env.DATABASE_URL);

// SQL実行用のエクスポート
export { sql };

export const eventOperations = {
  async checkEventExists(eventId: string): Promise<boolean> {
    try {
      const result = await sql`SELECT id FROM events WHERE id = ${eventId}`;
      return result.length > 0;
    } catch (error) {
      console.error("Error in checkEventExists:", error);
      throw error;
    }
  },

  async getEvent(eventId: string): Promise<Event> {
    try {
      const result = await sql`SELECT * FROM events WHERE id = ${eventId}`;
      if (result.length === 0) {
        throw new Error("Event not found");
      }
      return result[0] as Event;
    } catch (error) {
      console.error("Error in getEvent:", error);
      throw error;
    }
  },

  async createEvent(data: {
    title?: string;
    description: string | null;
    dates: string[];
    participants: string[];
  }): Promise<Event> {
    try {
      const title = data.title || "日程調整";
      const result = await sql`
        INSERT INTO events (title, description, dates, participants)
        VALUES (${title}, ${data.description}, ${data.dates}, ${data.participants})
        RETURNING *
      `;
      if (!result[0]) {
        throw new Error("イベントの作成に失敗しました");
      }
      return result[0] as Event;
    } catch (error) {
      console.error("Error in createEvent:", error);
      throw error;
    }
  },

  async updateEvent(
    id: string,
    data: Partial<{
      description: string | null;
      dates: string[];
      participants: string[];
    }>
  ): Promise<void> {
    try {
      if (data.description !== undefined) {
        await sql`UPDATE events SET description = ${data.description} WHERE id = ${id}`;
      }
      if (data.dates !== undefined) {
        await sql`UPDATE events SET dates = ${data.dates} WHERE id = ${id}`;
      }
      if (data.participants !== undefined) {
        await sql`UPDATE events SET participants = ${data.participants} WHERE id = ${id}`;
      }
    } catch (error) {
      console.error("Error updating event:", error);
      throw error;
    }
  },

  async updateResponse(data: {
    event_id: string;
    participant_name: string;
    date: string;
    status: ResponseStatus;
  }): Promise<Response> {
    try {
      const result = await sql`
        INSERT INTO responses (event_id, participant_name, date, status)
        VALUES (${data.event_id}, ${data.participant_name}, ${data.date}, ${data.status})
        ON CONFLICT (event_id, participant_name, date)
        DO UPDATE SET status = EXCLUDED.status
        RETURNING *
      `;
      return result[0] as Response;
    } catch (error) {
      console.error("Error in updateResponse:", error);
      throw error;
    }
  },

  async updateResponses(
    _eventId: string,
    responses: Array<{
      event_id: string;
      participant_name: string;
      date: string;
      status: ResponseStatus;
    }>
  ): Promise<Response[]> {
    try {
      const results: Response[] = [];
      for (const r of responses) {
        const result = await sql`
          INSERT INTO responses (event_id, participant_name, date, status)
          VALUES (${r.event_id}, ${r.participant_name}, ${r.date}, ${r.status})
          ON CONFLICT (event_id, participant_name, date)
          DO UPDATE SET status = EXCLUDED.status
          RETURNING *
        `;
        if (result[0]) {
          results.push(result[0] as Response);
        }
      }
      return results;
    } catch (error) {
      console.error("Error in updateResponses:", error);
      throw error;
    }
  },

  async getResponses(eventId: string): Promise<Response[]> {
    try {
      const result = await sql`
        SELECT * FROM responses WHERE event_id = ${eventId}
      `;
      return result as Response[];
    } catch (error) {
      console.error("Error fetching responses:", error);
      throw error;
    }
  },

  formatResponses(
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
  },

  generateInitialResponses(
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
  },

  async getEventWithResponses(eventId: string) {
    try {
      const [eventResult, responsesResult] = await Promise.all([
        sql`SELECT * FROM events WHERE id = ${eventId}`,
        sql`SELECT * FROM responses WHERE event_id = ${eventId}`,
      ]);

      if (eventResult.length === 0) {
        throw new Error("Event not found");
      }

      const event = eventResult[0] as Event;
      const responses = this.formatResponses(responsesResult as Response[]);

      return { event, responses };
    } catch (error) {
      console.error("Error in getEventWithResponses:", error);
      throw error;
    }
  },

  async insertResponses(
    responses: Array<{
      event_id: string;
      participant_name: string;
      date: string;
      status: ResponseStatus;
    }>
  ): Promise<void> {
    try {
      for (const r of responses) {
        await sql`
          INSERT INTO responses (event_id, participant_name, date, status)
          VALUES (${r.event_id}, ${r.participant_name}, ${r.date}, ${r.status})
          ON CONFLICT (event_id, participant_name, date) DO NOTHING
        `;
      }
    } catch (error) {
      console.error("Error in insertResponses:", error);
      throw error;
    }
  },
};

export type { ResponseStatus, FormattedResponses };
