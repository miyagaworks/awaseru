// frontend/src/lib/api.ts

import axios from 'axios';
import type { ResponseStatus, FormattedResponses } from '../types/database';

// API基本設定
const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

interface EventResponse {
    id: string;
    [key: string]: any;
}

interface EventCreateParams {
    title: string;
    description: string | null;
    dates: string[];
    participants: string[];
}

interface ResponseParams {
    event_id: string;
    participant_name: string;
    date: string;
    status: ResponseStatus;
}

interface ResponseBatchParams {
    event_id: string;
    participant_name: string;
    date: string;
    status: ResponseStatus;
}

// APIオペレーション
export const eventOperations = {
    // イベント作成
    async createEvent(data: EventCreateParams): Promise<EventResponse> {
        const response = await api.post('/events', data);
        return response.data;
    },

    // イベント取得
    async getEvent(eventId: string): Promise<EventResponse> {
        const response = await api.get(`/events/${eventId}`);
        return response.data;
    },

    // レスポンス取得
    async getResponses(eventId: string): Promise<FormattedResponses> {
        const response = await api.get(`/responses/${eventId}`);
        return response.data;
    },

    // レスポンス更新 (単一)
    async updateResponse(data: ResponseParams): Promise<any> {
        const response = await api.patch(`/responses/${data.event_id}`, data);
        return response.data;
    },

    // 複数レスポンス更新 (一括)
    async updateResponses(eventId: string, responses: ResponseBatchParams[]): Promise<any> {
        const response = await api.post(`/responses/${eventId}`, responses);
        return response.data;
    },

    // イベント存在確認
    async checkEventExists(eventId: string): Promise<boolean> {
        try {
            const response = await api.get(`/events/check?eventId=${eventId}`);
            return response.data.exists;
        } catch (error) {
            return false;
        }
    },

    // 初期レスポンスの生成
    generateInitialResponses(
        eventId: string,
        participants: string[],
        dates: string[]
    ): ResponseBatchParams[] {
        return dates.flatMap(date =>
            participants.map(participant_name => ({
                event_id: eventId,
                participant_name,
                date,
                status: '未回答' as ResponseStatus
            }))
        );
    }
};