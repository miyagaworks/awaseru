// src/lib/hooks/useErrorHandler.ts
import { useState, useCallback } from 'react';
import type { ErrorState, ErrorCode } from '../errors/types';
import { errorMessages } from '../errors/errorMessages';

export const useErrorHandler = (initialError: ErrorState = { message: '', code: 'UNKNOWN_ERROR' }) => {
 const [error, setError] = useState<ErrorState>(initialError);

 const handleError = useCallback((error: unknown) => {
   console.error('Error caught:', error);

   // エラーコードが既に分かっている場合
   if (typeof error === 'object' && error !== null && 'code' in error) {
     const code = error.code as ErrorCode;
     if (errorMessages[code]) {
       setError({
         message: errorMessages[code].message,
         code: code,
         recovery: errorMessages[code].recovery
       });
       return;
     }
   }

   if (error instanceof Error) {
     // バリデーションエラーの処理
     if (error.message.includes('validation')) {
       setError({
         message: errorMessages['VALIDATION_ERROR'].message,
         code: 'VALIDATION_ERROR'
       });
       return;
     }

     // APIエラーの処理
     if (error.message.includes('fetch') || error.message.includes('network')) {
       const apiError = errorMessages['API_ERROR'];
       setError({
         message: apiError.message,
         code: 'API_ERROR',
         recovery: apiError.recovery
       });
       return;
     }

     // データベースエラーの処理
     if (error.message.includes('database') || error.message.includes('connection')) {
       const dbError = errorMessages['DATABASE.CONNECTION'];
       setError({
         message: dbError.message,
         code: 'DATABASE.CONNECTION',
         recovery: dbError.recovery
       });
       return;
     }

     // その他のエラー
     setError({
       message: errorMessages['UNKNOWN_ERROR'].message,
       code: 'UNKNOWN_ERROR'
     });
   } else {
     setError({
       message: errorMessages['SYSTEM.UNEXPECTED'].message,
       code: 'SYSTEM.UNEXPECTED',
       recovery: errorMessages['SYSTEM.UNEXPECTED'].recovery
     });
   }
 }, []);

 const clearError = useCallback(() => {
   setError({ message: '', code: 'UNKNOWN_ERROR' });
 }, []);

 return {
   error,
   setError,
   handleError,
   clearError,
   isError: error.message !== ''
 };
};