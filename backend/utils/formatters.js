/**
 * レスポンスデータをフロントエンド向けにフォーマット
 * @param {Array} responses DBから取得したレスポンスデータの配列
 * @returns {Object} 整形されたレスポンスデータ
 */
const formatResponses = (responses) => {
    const formatted = {};

    responses.forEach(response => {
        // 参加者名をキーとするオブジェクトがなければ作成
        if (!formatted[response.participant_name]) {
            formatted[response.participant_name] = {};
        }

        // 日付ごとのステータスを設定
        formatted[response.participant_name][response.date] = response.status;
    });

    return formatted;
};

/**
 * 日付文字列をYYYY-MM-DD形式に正規化
 * @param {string} dateStr 日付文字列
 * @returns {string} 正規化された日付文字列
 */
const normalizeDateString = (dateStr) => {
    const date = new Date(dateStr);
    return date.toISOString().split('T')[0];
};

/**
 * 参加者名の正規化（特殊文字の除去など）
 * @param {string|string[]} participant 参加者名
 * @returns {string} 正規化された参加者名
 */
const normalizeParticipantName = (participant) => {
    if (Array.isArray(participant)) {
        return participant[0].replace(/[\[\]\"]/g, '');
    }
    return (participant || '').toString().replace(/[\[\]\"]/g, '');
};

/**
 * レスポンスステータスの正規化
 * @param {string} status ステータス
 * @returns {string} 正規化されたステータス
 */
const normalizeStatus = (status) => {
    // 有効なステータス値
    const validStatuses = ['未回答', '◯', '×', '△'];
    return validStatuses.includes(status) ? status : '未回答';
};

module.exports = {
    formatResponses,
    normalizeDateString,
    normalizeParticipantName,
    normalizeStatus
};