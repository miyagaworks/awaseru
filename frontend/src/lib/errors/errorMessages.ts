// src/lib/errors/errorMessages.ts
import type { ErrorCode } from './types';
export const errorMessages: Record<ErrorCode, { message: string; recovery?: string }> = {
  // 既存のエラーメッセージ
  'VALIDATION_ERROR': {
    message: '入力内容を確認してください'
  },
  'API_ERROR': {
    message: '通信に失敗しました。もう一度お試しください',
    recovery: 'しばらく待ってから再度お試しください'
  },
  'UNKNOWN_ERROR': {
    message: 'エラーが発生しました。もう一度お試しください'
  },

  // 回答関連の新しいエラーメッセージ
  'RESPONSE.UPDATE_FAILED': {
    message: '回答の更新に失敗しました',
    recovery: '再度回答を選択してください'
  },
  'RESPONSE.INVALID_STATUS': {
    message: '無効な回答ステータスです',
    recovery: '有効な回答（◯、×、△、未回答）を選択してください'
  },
  'RESPONSE.NOT_FOUND': {
    message: '対象の回答が見つかりません',
    recovery: 'ページを再読み込みしてください'
  },
  'RESPONSE.DUPLICATE': {
    message: '同じ回答が既に存在します',
    recovery: '最新の状態を確認してください'
  },

  // イベント関連の新しいエラーメッセージ
  'EVENT.EXPIRED': {
    message: 'イベントの有効期限が切れています',
    recovery: '新しいイベントを作成してください'
  },
  'EVENT.NOT_FOUND': {
    message: 'イベントが見つかりません',
    recovery: 'URLを確認するか、新しいイベントを作成してください'
  },
  'EVENT.UPDATE_FAILED': {
    message: 'イベントの更新に失敗しました',
    recovery: '再度操作をお試しください'
  },

  // 既存のエラーメッセージ
  'VALIDATION.DATE_RANGE': {
    message: '日付は現在から3ヶ月以内である必要があります',
    recovery: '有効な日付範囲を選択してください'
  },
  'VALIDATION.PARTICIPANT_MAX': {
    message: '参加者は最大10名までです',
    recovery: '参加者数を10名以下に調整してください'
  },
  'DATABASE.CONNECTION': {
    message: 'データベースとの接続に問題が発生しました',
    recovery: 'しばらく待ってから再度お試しください'
  },
  'DATABASE.UPDATE': {
    message: 'データの更新に失敗しました',
    recovery: '再度保存をお試しください'
  },
  'DATABASE.NOT_FOUND': {
    message: '指定されたデータが見つかりませんでした',
    recovery: 'ページを再読み込みするか、トップページからやり直してください'
  },
  'SYSTEM.UNEXPECTED': {
    message: '予期せぬエラーが発生しました',
    recovery: 'しばらく待ってから再度お試しください'
  },

  // 操作関連の新しいエラーメッセージ
  'OPERATION.TIMEOUT': {
    message: '操作がタイムアウトしました',
    recovery: '再度操作を行ってください'
  },
  'OPERATION.CONCURRENT': {
    message: '他のユーザーが同時に更新を行っています',
    recovery: 'ページを再読み込みして最新の状態を確認してください'
  }
};