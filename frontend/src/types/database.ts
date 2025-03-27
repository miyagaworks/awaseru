// src/types/database.ts
export type Event = {
  id: string;
  title?: string;          // titleをオプショナルに変更
  description: string | null;
  dates: string[];
  participants: string[];
  created_at: string;
  expires_at: string;
}

export type Response = {
  id: string;
  event_id: string;
  participant_name: string;
  date: string;          // date型だが、文字列として扱う
  status: '未回答' | '◯' | '×' | '△';
  created_at: string;
}

export type Database = {
  public: {
    Tables: {
      events: {
        Row: Event;
        Insert: Omit<Event, 'id' | 'created_at' | 'expires_at'>;
        Update: Partial<Omit<Event, 'id'>>;
      };
      responses: {
        Row: Response;
        Insert: Omit<Response, 'id' | 'created_at'>;
        Update: Partial<Omit<Response, 'id'>>;
      };
    };
  };
}

export type ResponseStatus = '未回答' | '◯' | '×' | '△';
export type FormattedResponses = Record<string, Record<string, ResponseStatus>>;
export interface EventData {
  dates: string[];
  participants: string[];
  responses: FormattedResponses;
}