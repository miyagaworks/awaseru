const { query } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

/**
 * イベントモデル：データベースとのやり取りを管理
 */
const eventModel = {
    /**
     * イベントの存在確認
     * @param {string} eventId イベントID
     * @returns {Promise<boolean>} イベントが存在するかどうか
     */
    async checkEventExists(eventId) {
        const result = await query(
            'SELECT EXISTS(SELECT 1 FROM events WHERE id = ?) as `exists`', [eventId]
        );
        return result.rows[0].exists === 1;
    },

    /**
     * イベント取得
     * @param {string} eventId イベントID
     * @returns {Promise<Object>} イベント情報
     */
    async getEvent(eventId) {
        const result = await query(
            'SELECT * FROM events WHERE id = ?', [eventId]
        );

        if (result.rows.length === 0) {
            const error = new Error('イベントが見つかりません');
            error.statusCode = 404;
            throw error;
        }

        return result.rows[0];
    },

    /**
     * イベント作成
     * @param {Object} eventData イベントデータ
     * @returns {Promise<Object>} 作成されたイベント情報
     */
    async createEvent(eventData) {
        const { title, description, dates, participants } = eventData;
        const id = uuidv4();

        // MySQLではJSON配列として保存
        const datesJson = JSON.stringify(dates);
        const participantsJson = JSON.stringify(participants);

        const result = await query(
            `INSERT INTO events (id, title, description, dates, participants)
       VALUES (?, ?, ?, ?, ?)`, [id, title, description, datesJson, participantsJson]
        );

        // 作成したレコードを取得
        const getResult = await query('SELECT * FROM events WHERE id = ?', [id]);
        return getResult.rows[0];
    },

    /**
     * イベント更新
     * @param {string} eventId イベントID
     * @param {Object} updateData 更新データ
     * @returns {Promise<Object>} 更新されたイベント情報
     */
    async updateEvent(eventId, updateData) {
        // 更新するフィールドとパラメータを動的に構築
        const fields = [];
        const values = [];

        // 各フィールドを確認して更新が必要なものを追加
        if (updateData.title !== undefined) {
            fields.push(`title = ?`);
            values.push(updateData.title);
        }

        if (updateData.description !== undefined) {
            fields.push(`description = ?`);
            values.push(updateData.description);
        }

        if (updateData.dates !== undefined) {
            fields.push(`dates = ?`);
            values.push(JSON.stringify(updateData.dates));
        }

        if (updateData.participants !== undefined) {
            fields.push(`participants = ?`);
            values.push(JSON.stringify(updateData.participants));
        }

        // 更新するフィールドがない場合はエラー
        if (fields.length === 0) {
            const error = new Error('更新するフィールドがありません');
            error.statusCode = 400;
            throw error;
        }

        // 最後にイベントIDを追加
        values.push(eventId);

        // 更新クエリの実行
        await query(
            `UPDATE events
       SET ${fields.join(', ')}
       WHERE id = ?`,
            values
        );

        // 更新したレコードを取得
        const result = await query('SELECT * FROM events WHERE id = ?', [eventId]);

        if (result.rows.length === 0) {
            const error = new Error('イベントが見つかりません');
            error.statusCode = 404;
            throw error;
        }

        return result.rows[0];
    },

    /**
     * イベント削除
     * @param {string} eventId イベントID
     * @returns {Promise<boolean>} 削除成功かどうか
     */
    async deleteEvent(eventId) {
        // 関連するレスポンスを先に削除
        await query(
            'DELETE FROM responses WHERE event_id = ?', [eventId]
        );

        // イベントを削除
        const result = await query(
            'DELETE FROM events WHERE id = ?', [eventId]
        );

        if (result.rows.affectedRows === 0) {
            const error = new Error('イベントが見つかりません');
            error.statusCode = 404;
            throw error;
        }

        return true;
    }
};

module.exports = eventModel;