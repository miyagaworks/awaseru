// src/lib/errors/types.ts
export type ErrorCode =
  // 基本エラー
  | 'VALIDATION_ERROR'
  | 'API_ERROR'
  | 'UNKNOWN_ERROR'

  // 回答関連のエラー
  | 'RESPONSE.UPDATE_FAILED'
  | 'RESPONSE.INVALID_STATUS'
  | 'RESPONSE.NOT_FOUND'
  | 'RESPONSE.DUPLICATE'

  // イベント関連のエラー
  | 'EVENT.EXPIRED'
  | 'EVENT.NOT_FOUND'
  | 'EVENT.UPDATE_FAILED'

  // バリデーション関連のエラー
  | 'VALIDATION.DATE_RANGE'
  | 'VALIDATION.PARTICIPANT_MAX'

  // データベース関連のエラー
  | 'DATABASE.CONNECTION'
  | 'DATABASE.UPDATE'
  | 'DATABASE.NOT_FOUND'

  // システム関連のエラー
  | 'SYSTEM.UNEXPECTED'

  // 操作関連のエラー
  | 'OPERATION.TIMEOUT'
  | 'OPERATION.CONCURRENT';

export interface ErrorState {
  message: string;
  code: ErrorCode;
  field?: string;
  recovery?: string;
  details?: {
    timestamp: string;
    requestId?: string;
    context?: Record<string, unknown>;
  };
}

// エラーコンテキスト用の型
export interface ErrorContext {
  participant?: string;
  date?: string;
  status?: string;
  eventId?: string;
  operation?: string;
  additionalInfo?: Record<string, unknown>;
}

// エラー処理結果の型
export interface ErrorResult<T> {
  success: boolean;
  data?: T;
  error?: ErrorState;
}

// API エラーレスポンスの型
export interface ApiErrorResponse {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// データベースエラーの型
export interface DatabaseErrorDetails extends Record<string, unknown> {
  code: string;
  constraint?: string;
  table?: string;
  column?: string;
}