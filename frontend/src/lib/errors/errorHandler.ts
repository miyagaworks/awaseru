// src/lib/errors/errorHandler.ts
import { errorMessages } from './errorMessages';
import type {
  ErrorCode,
  ErrorState,
  ErrorContext,
  ErrorResult,
  ApiErrorResponse,
  DatabaseErrorDetails
} from './types';
interface DatabaseError {
  code: string;
  message: string;
  details?: string;
  hint?: string;
}

export class ErrorHandler {
  private static logError(level: 'error' | 'info', message: string, data: unknown) {
    // テスト環境ではログ出力を抑制
    if (process.env.NODE_ENV === 'test') {
      return;
    }

    if (level === 'error') {
      console.error(message, data);
    } else {
      console.info(message, data);
    }
  }

  private static generateErrorDetails(context?: ErrorContext) {
    const details: {
      timestamp: string;
      requestId: string;
      context?: Record<string, unknown>;
    } = {
      timestamp: new Date().toISOString(),
      requestId: crypto.randomUUID(),
      context: context as Record<string, unknown>
    };
    return details;
  }

  static createError(
    code: ErrorCode,
    field?: string,
    context?: ErrorContext
  ): ErrorState {
    const { message, recovery } = errorMessages[code];
    return {
      message,
      code,
      field,
      recovery,
      details: this.generateErrorDetails(context)
    };
  }

  static handleDatabaseError(
    error: DatabaseError,
    context?: ErrorContext
  ): ErrorState {
    // PostgreSQLのエラーコードに基づく処理
    const databaseErrorMap: Record<string, ErrorCode> = {
      '23505': 'RESPONSE.DUPLICATE',    // 一意性制約違反
      '23503': 'DATABASE.NOT_FOUND',    // 外部キー制約違反
      '42P01': 'DATABASE.CONNECTION',   // テーブルが存在しない
      '28P01': 'DATABASE.CONNECTION',   // 認証エラー
      '40001': 'OPERATION.CONCURRENT',  // シリアライズ失敗
      '57014': 'OPERATION.TIMEOUT'      // クエリがキャンセルされた
    };

    const errorCode = databaseErrorMap[error.code] || 'DATABASE.UPDATE';
    const details: DatabaseErrorDetails = {
      code: error.code,
      constraint: error.details,
      table: this.extractTableName(error.message),
      column: this.extractColumnName(error.message)
    };

    const errorState = this.createError(errorCode, undefined, {
      ...context,
      additionalInfo: details
    });

    this.logError('info', 'Database error:', {
      error: error,
      errorState: errorState,
      details: details
    });

    return errorState;
  }

  static handleResponseError(
    error: Error,
    context?: ErrorContext
  ): ErrorState {
    // 回答更新関連のエラー処理
    if (error.message.includes('status')) {
      return this.createError('RESPONSE.INVALID_STATUS', 'status', context);
    }

    if (error.message.includes('not found')) {
      return this.createError('RESPONSE.NOT_FOUND', undefined, context);
    }

    if (error.message.includes('expired')) {
      return this.createError('EVENT.EXPIRED', undefined, context);
    }

    return this.createError('RESPONSE.UPDATE_FAILED', undefined, context);
  }

  static handleValidationError(
    error: Error,
    context?: ErrorContext
  ): ErrorState {
    // バリデーションエラーの詳細な処理
    if (error.message.includes('日付')) {
      return this.createError('VALIDATION.DATE_RANGE', 'date', context);
    }

    if (error.message.includes('参加者')) {
      if (error.message.includes('10名')) {
        return this.createError('VALIDATION.PARTICIPANT_MAX', 'participants', context);
      }
      return this.createError('VALIDATION_ERROR', 'participants', context);
    }

    return this.createError('VALIDATION_ERROR', undefined, context);
  }

  static handleApiError(
    error: ApiErrorResponse,
    context?: ErrorContext
  ): ErrorState {
    // API エラーの処理
    const apiErrorMap: Record<string, ErrorCode> = {
      'AUTH_ERROR': 'DATABASE.CONNECTION',
      'RATE_LIMIT': 'OPERATION.TIMEOUT',
      'INVALID_REQUEST': 'VALIDATION_ERROR'
    };

    const errorCode = apiErrorMap[error.code] || 'API_ERROR';
    return this.createError(errorCode, undefined, {
      ...context,
      additionalInfo: error.details
    });
  }

  static handle(
    error: unknown,
    context?: ErrorContext
  ): ErrorState {
    try {
      // PostgrestError（Supabaseのエラー）の処理
      if (this.isPostgrestError(error)) {
        return this.handleDatabaseError(error, context);
      }

      // APIエラーレスポンスの処理
      if (this.isApiErrorResponse(error)) {
        return this.handleApiError(error, context);
      }

      // 一般的なErrorオブジェクトの処理
      if (error instanceof Error) {
        // ネットワークエラー
        if (error.message.includes('fetch') || error.message.includes('network')) {
          return this.createError('API_ERROR', undefined, context);
        }

        // 回答更新エラー
        if (error.message.includes('response') || error.message.includes('status')) {
          return this.handleResponseError(error, context);
        }

        // バリデーションエラー
        if (error.message.includes('validation')) {
          return this.handleValidationError(error, context);
        }

        // その他の一般エラー
        this.logError('info', 'Unhandled error:', error);
        return this.createError('UNKNOWN_ERROR', undefined, context);
      }

      // 予期せぬエラー
      this.logError('info', 'Unexpected error:', error);
      return this.createError('SYSTEM.UNEXPECTED', undefined, {
        ...context,
        additionalInfo: { originalError: error }
      });
    } catch (handlingError) {
      // エラーハンドリング自体のエラーを処理
      this.logError('error', 'Error in error handling:', handlingError);
      return this.createError('SYSTEM.UNEXPECTED', undefined, context);
    }
  }

  // 型ガード関数
  private static isPostgrestError(error: unknown): error is DatabaseError {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      'message' in error
    );
  }

  // Error オブジェクトの型ガード
  private static isError(error: unknown): error is Error {
    return error instanceof Error;
  }

  private static isApiErrorResponse(error: unknown): error is ApiErrorResponse {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      'message' in error
    );
  }

  // ユーティリティ関数
  private static extractTableName(message: string): string | undefined {
    const match = message.match(/table "([^"]+)"/);
    return match ? match[1] : undefined;
  }

  private static extractColumnName(message: string): string | undefined {
    const match = message.match(/column "([^"]+)"/);
    return match ? match[1] : undefined;
  }

  // 結果をラップするユーティリティメソッド
  static async wrapAsync<T>(
    promise: Promise<T>,
    context?: ErrorContext
  ): Promise<ErrorResult<T>> {
    try {
      const data = await promise;
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: this.handle(error, context)
      };
    }
  }
}