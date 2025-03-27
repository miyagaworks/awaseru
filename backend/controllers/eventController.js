const eventModel = require('../models/eventModel');
const responseModel = require('../models/responseModel');
const { formatResponses } = require('../utils/formatters');

/**
 * イベントコントローラー：イベント関連のリクエストを処理
 */
const eventController = {
    /**
     * イベントの存在確認
     * @param {Object} req リクエスト
     * @param {Object} res レスポンス
     * @param {Function} next 次のミドルウェア
     */
    async checkEventExists(req, res, next) {
        try {
            const { eventId } = req.params;
            const exists = await eventModel.checkEventExists(eventId);

            res.status(200).json({ exists });
        } catch (error) {
            next(error);
        }
    },

    /**
     * イベント取得
     * @param {Object} req リクエスト
     * @param {Object} res レスポンス
     * @param {Function} next 次のミドルウェア
     */
    async getEvent(req, res, next) {
        try {
            const { eventId } = req.params;
            const event = await eventModel.getEvent(eventId);

            res.status(200).json(event);
        } catch (error) {
            next(error);
        }
    },

    /**
     * イベントと回答データを一括取得
     * @param {Object} req リクエスト
     * @param {Object} res レスポンス
     * @param {Function} next 次のミドルウェア
     */
    async getEventWithResponses(req, res, next) {
        try {
            const { eventId } = req.params;

            // イベント情報の取得
            const event = await eventModel.getEvent(eventId);

            // レスポンスの取得
            const responses = await responseModel.getResponses(eventId);

            // フォーマット済みのレスポンスデータ
            const formattedResponses = formatResponses(responses);

            // 結果を返す
            res.status(200).json({
                event,
                eventData: {
                    dates: event.dates,
                    participants: event.participants,
                    responses: formattedResponses
                }
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * イベント作成
     * @param {Object} req リクエスト
     * @param {Object} res レスポンス
     * @param {Function} next 次のミドルウェア
     */
    async createEvent(req, res, next) {
        try {
            // リクエストボディからデータを取得
            const { title, description, dates, participants } = req.body;

            // イベントを作成
            const event = await eventModel.createEvent({
                title: title || '日程調整',
                description: description || null,
                dates,
                participants
            });

            // 初期レスポンスを作成
            await responseModel.createInitialResponses(
                event.id,
                participants,
                dates
            );

            res.status(201).json(event);
        } catch (error) {
            next(error);
        }
    },

    /**
     * イベント更新
     * @param {Object} req リクエスト
     * @param {Object} res レスポンス
     * @param {Function} next 次のミドルウェア
     */
    async updateEvent(req, res, next) {
        try {
            const { eventId } = req.params;
            const updateData = req.body;

            // 更新対象のイベントを取得
            const currentEvent = await eventModel.getEvent(eventId);

            // 参加者の更新がある場合のレスポンス処理
            if (updateData.participants) {
                const currentParticipants = new Set(currentEvent.participants);
                const newParticipants = new Set(updateData.participants);

                // 削除された参加者を特定
                const removedParticipants = [...currentParticipants].filter(
                    p => !newParticipants.has(p)
                );

                // 追加された参加者を特定
                const addedParticipants = [...newParticipants].filter(
                    p => !currentParticipants.has(p)
                );

                // 削除された参加者のレスポンスを削除
                for (const participant of removedParticipants) {
                    await responseModel.deleteParticipantResponses(eventId, participant);
                }

                // 追加された参加者の初期レスポンスを作成
                if (addedParticipants.length > 0) {
                    await responseModel.createInitialResponses(
                        eventId,
                        addedParticipants,
                        currentEvent.dates
                    );
                }
            }

            // 日程の更新がある場合のレスポンス処理
            if (updateData.dates) {
                const currentDates = new Set(currentEvent.dates.map(d => d.toString()));
                const newDates = new Set(updateData.dates.map(d => d.toString()));

                // 追加された日程を特定
                const addedDates = [...newDates].filter(
                    d => !currentDates.has(d)
                );

                // 追加された日程に対して初期レスポンスを作成
                if (addedDates.length > 0) {
                    await responseModel.createInitialResponses(
                        eventId,
                        currentEvent.participants,
                        addedDates
                    );
                }
            }

            // イベントを更新
            const updatedEvent = await eventModel.updateEvent(eventId, updateData);

            res.status(200).json(updatedEvent);
        } catch (error) {
            next(error);
        }
    },

    /**
     * イベント削除
     * @param {Object} req リクエスト
     * @param {Object} res レスポンス
     * @param {Function} next 次のミドルウェア
     */
    async deleteEvent(req, res, next) {
        try {
            const { eventId } = req.params;

            await eventModel.deleteEvent(eventId);

            res.status(200).json({ success: true, message: 'イベントが削除されました' });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = eventController;