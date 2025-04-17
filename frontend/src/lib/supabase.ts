// frontend/src/lib/supabase.ts
import { createClient } from "@supabase/supabase-js";
import type {
  Database,
  FormattedResponses,
  ResponseStatus,
} from "@/types/database";

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error("Missing env.NEXT_PUBLIC_SUPABASE_URL");
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error("Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: { persistSession: false },
  }
);

export const eventOperations = {
  // イベントの存在確認
  async checkEventExists(eventId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from("events")
        .select("id")
        .eq("id", eventId)
        .maybeSingle();

      if (error) throw error;
      return !!data;
    } catch (error) {
      console.error("Error in checkEventExists:", error);
      throw error;
    }
  },

  // イベントの取得
  async getEvent(eventId: string) {
    try {
      const { data: event, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", eventId)
        .single();

      if (error) throw error;
      return event;
    } catch (error) {
      console.error("Error in getEvent:", error);
      throw error;
    }
  },

  // イベントの作成
  async createEvent(data: {
    title?: string;
    description: string | null;
    dates: string[];
    participants: string[];
  }) {
    try {
      console.log('Supabase createEvent called with data:', data);
      console.log('Using Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
      
      const { data: event, error } = await supabase
        .from("events")
        .insert({
          title: data.title || "日程調整",
          description: data.description,
          dates: data.dates,
          participants: data.participants,
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      if (!event) {
        console.error('No event returned from Supabase');
        throw new Error("イベントの作成に失敗しました");
      }

      console.log('Event created successfully:', event);
      return event;
    } catch (error) {
      console.error("Error in createEvent:", error);
      throw error;
    }
  },

  // イベントの更新
  async updateEvent(
    id: string,
    data: Partial<{
      description: string | null;
      dates: string[];
      participants: string[];
    }>
  ) {
    const { error } = await supabase.from("events").update(data).eq("id", id);

    if (error) {
      console.error("Error updating event:", error);
      throw error;
    }
  },

  // レスポンス更新
  async updateResponse(data: {
    event_id: string;
    participant_name: string;
    date: string;
    status: ResponseStatus;
  }) {
    try {
      const { data: response, error } = await supabase
        .from("responses")
        .upsert({
          event_id: data.event_id,
          participant_name: data.participant_name,
          date: data.date,
          status: data.status,
        })
        .select()
        .single();

      if (error) {
        console.error("Error updating response:", error);
        throw error;
      }

      return response;
    } catch (error) {
      console.error("Error in updateResponse:", error);
      throw error;
    }
  },

  // 複数レスポンス更新
  async updateResponses(
    eventId: string,
    responses: Array<{
      event_id: string;
      participant_name: string;
      date: string;
      status: ResponseStatus;
    }>
  ) {
    const { data, error } = await supabase
      .from("responses")
      .upsert(responses)
      .select();

    if (error) {
      throw error;
    }
    return data;
  },

  // レスポンス取得
  async getResponses(eventId: string) {
    const { data, error } = await supabase
      .from("responses")
      .select("*")
      .eq("event_id", eventId);

    if (error) {
      console.error("Error fetching responses:", error);
      throw error;
    }
    return data || [];
  },

  // レスポンスのフォーマット
  formatResponses(
    responses: Array<{
      participant_name: string;
      date: string;
      status: ResponseStatus;
    }>
  ): FormattedResponses {
    const formatted: FormattedResponses = {};

    responses.forEach((response) => {
      // 参加者ごとのオブジェクトがなければ作成
      if (!formatted[response.participant_name]) {
        formatted[response.participant_name] = {};
      }

      // 日付ごとのステータスを設定
      formatted[response.participant_name][response.date] = response.status;
    });

    return formatted;
  },

  // 初期レスポンスの生成
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
        status: "未回答",
      }))
    );
  },

  // イベントと回答の一括取得
  async getEventWithResponses(eventId: string) {
    try {
      const [eventResult, responsesResult] = await Promise.all([
        supabase.from("events").select("*").eq("id", eventId).single(),
        supabase.from("responses").select("*").eq("event_id", eventId),
      ]);

      if (eventResult.error) throw eventResult.error;
      if (responsesResult.error) throw responsesResult.error;

      const event = eventResult.data;
      const responses = this.formatResponses(responsesResult.data || []);

      return {
        event,
        responses,
      };
    } catch (error) {
      console.error("Error in getEventWithResponses:", error);
      throw error;
    }
  },
};

export type { ResponseStatus, FormattedResponses };