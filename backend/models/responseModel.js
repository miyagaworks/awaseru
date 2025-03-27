const { query } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

/**
 * レスポンスモデル：データベースとのやり取りを管理
 */
const responseModel = {
    /**
     * イベントの全レスポンスを取得
     * @param {string} eventId イベントID
     * @returns {Promise<Array>} レスポンス一覧
     */
    async getResponses(eventId) {
        const result = await query(
            'SELECT * FROM responses WHERE event_id = ? ORDER BY participant_name, date', [eventId]
        );

        return result.rows;
    },

    /**
     * 初期レスポンスの作成（イベント作成時）
     * @param {string} eventId イベントID
     * @param {Array<string>} participants 参加者一覧
     * @param {Array<string>} dates 日程一覧
     * @returns {Promise<boolean>} 作成成功かどうか
     */
    async createInitialResponses(eventId, participants, dates) {
        // MySQLでは複数値のINSERTを別の方法で行う
        if (participants.length === 0 || dates.length === 0) {
            return true; // 作成するレスポンスがない場合は成功とみなす
        }

        // 複数のINSERT文に対応
        const valueStrings = [];
        const valueParams = [];

        participants.forEach(participant => {
            dates.forEach(date => {
                valueStrings.push('(?, ?, ?, ?, ?)');
                valueParams.push(uuidv4(), eventId, participant, date, '未回答');
            });
        });

        // 一括インサート
        await query(
            `INSERT INTO responses (id, event_id, participant_name, date, status)
       VALUES ${valueStrings.join(', ')}`,
            valueParams
        );

        return true;
    },

    /**
     * 単一レスポンスの更新
     * @param {string} eventId イベントID
     * @param {string} participantName 参加者名
     * @param {string} date 日程
     * @param {string} status ステータス
     * @returns {Promise<Object>} 更新されたレスポンス
     */
    async updateResponse(eventId, participantName, date, status) {
        // 既存のレスポンスを確認
        const existingResult = await query(
            `SELECT * FROM responses 
       WHERE event_id = ? AND participant_name = ? AND date = ?`, [eventId, participantName, date]
        );

        // レスポンスが存在する場合は更新、存在しない場合は作成
        if (existingResult.rows.length > 0) {
            // 更新
            await query(
                `UPDATE responses
         SET status = ?
         WHERE event_id = ? AND participant_name = ? AND date = ?`, [status, eventId, participantName, date]
            );

            // 更新したレコードを取得
            const result = await query(
                `SELECT * FROM responses 
         WHERE event_id = ? AND participant_name = ? AND date = ?`, [eventId, participantName, date]
            );

            return result.rows[0];
        } else {
            // 新規作成
            const id = uuidv4();
            await query(
                `INSERT INTO responses (id, event_id, participant_name, date, status)
         VALUES (?, ?, ?, ?, ?)`, [id, eventId, participantName, date, status]
            );

            // 作成したレコードを取得
            const result = await query(
                `SELECT * FROM responses WHERE id = ?`, [id]
            );

            return result.rows[0];
        }
    },

    /**
     * 複数レスポンスの一括更新
     * @param {string} eventId イベントID
     * @param {Array<Object>} responses 更新するレスポンス一覧
     * @returns {Promise<boolean>} 更新成功かどうか
     */
    async updateResponses(eventId, responses) {
        // トランザクション開始
        await query('START TRANSACTION');

        try {
            for (const response of responses) {
                await this.updateResponse(
                    eventId,
                    response.participant_name,
                    response.date,
                    response.status
                );
            }

            // コミット
            await query('COMMIT');
            return true;
        } catch (error) {
            // ロールバック
            await query('ROLLBACK');
            throw error;
        }
    },

    /**
     * 参加者のレスポンスをすべて削除
     * @param {string} eventId イベントID
     * @param {string} participantName 参加者名
     * @returns {Promise<boolean>} 削除成功かどうか
     */
    async deleteParticipantResponses(eventId, participantName) {
        await query(
            'DELETE FROM responses WHERE event_id = ? AND participant_name = ?', [eventId, participantName]
        );

        return true;
    }
};

module.exports = responseModel;