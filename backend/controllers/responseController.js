const responseModel = require('../models/responseModel');
const eventModel = require('../models/eventModel');
const { formatResponses, normalizeStatus } = require('../utils/formatters');

/**
 * レスポンスコントローラー：レスポンス関連のリクエストを処理
 */
const responseController = {
    /**
     * イベントの全レスポンスを取得
     * @param {Object} req リクエスト
     * @param {Object} res レスポンス
     * @param {Function} next 次のミドルウェア
     */
    async getResponses(req, res, next) {
        try {
            const { eventId } = req.params;

            // イベントの存在確認
            const exists = await eventModel.checkEventExists(eventId);
            if (!exists) {
                const error = new Error('イベントが見つかりません');
                error.statusCode = 404;
                throw error;
            }

            // レスポンスを取得
            const responses = await responseModel.getResponses(eventId);

            // フォーマット済みのレスポンスデータ
            const formattedResponses = formatResponses(responses);

            res.status(200).json(formattedResponses);
        } catch (error) {
            next(error);
        }
    },

    /**
     * レスポンス更新
     * @param {Object} req リクエスト
     * @param {Object} res レスポンス
     * @param {Function} next 次のミドルウェア
     */
    async updateResponse(req, res, next) {
        try {
            const { eventId } = req.params;
            const { participant_name, date, status } = req.body;

            // イベントの存在確認
            const exists = await eventModel.checkEventExists(eventId);
            if (!exists) {
                const error = new Error('イベントが見つかりません');
                error.statusCode = 404;
                throw error;
            }

            // ステータスの正規化
            const normalizedStatus = normalizeStatus(status);

            // レスポンスを更新
            const response = await responseModel.updateResponse(
                eventId,
                participant_name,
                date,
                normalizedStatus
            );

            res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    },

    /**
     * 複数レスポンスの一括更新
     * @param {Object} req リクエスト
     * @param {Object} res レスポンス
     * @param {Function} next 次のミドルウェア
     */
    async updateResponses(req, res, next) {
        try {
            const { eventId } = req.params;
            const responses = req.body;

            // イベントの存在確認
            const exists = await eventModel.checkEventExists(eventId);
            if (!exists) {
                const error = new Error('イベントが見つかりません');
                error.statusCode = 404;
                throw error;
            }

            // レスポンスの配列でない場合はエラー
            if (!Array.isArray(responses)) {
                const error = new Error('レスポンスデータは配列である必要があります');
                error.statusCode = 400;
                throw error;
            }

            // レスポンスを一括更新
            await responseModel.updateResponses(eventId, responses);

            // 更新後のレスポンスを取得
            const updatedResponses = await responseModel.getResponses(eventId);
            const formattedResponses = formatResponses(updatedResponses);

            res.status(200).json(formattedResponses);
        } catch (error) {
            next(error);
        }
    }
};

module.exports = responseController;