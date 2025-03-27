const { body, param, validationResult } = require('express-validator');

// バリデーション結果を確認して、エラーがあれば次のミドルウェアにエラーを渡す
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('入力内容を確認してください');
        error.statusCode = 400;
        error.validationErrors = errors.array();
        return next(error);
    }
    next();
};

// イベント作成のバリデーションルール
const createEventRules = [
    body('title').optional().trim().isLength({ max: 100 })
    .withMessage('タイトルは100文字以内で入力してください'),

    body('description').optional().trim().isLength({ max: 500 })
    .withMessage('説明は500文字以内で入力してください'),

    body('dates').isArray({ min: 1 }).withMessage('少なくとも1つの日程を設定してください')
    .custom(dates => {
        // 日付フォーマットと有効性のチェック
        const now = new Date();
        const threeMonthsLater = new Date();
        threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);

        for (const date of dates) {
            const dateObj = new Date(date);
            if (isNaN(dateObj.getTime())) {
                throw new Error('不正な日付形式です');
            }
            if (dateObj < now || dateObj > threeMonthsLater) {
                throw new Error('日付は現在から3ヶ月以内である必要があります');
            }
        }

        // 重複チェック
        const uniqueDates = new Set(dates);
        if (uniqueDates.size !== dates.length) {
            throw new Error('重複する日程があります');
        }

        return true;
    }),

    body('participants').isArray({ min: 1, max: 20 })
    .withMessage('参加者は1名以上20名以下で設定してください')
    .custom(participants => {
        // 参加者名の長さと重複チェック
        const uniqueParticipants = new Set();

        for (const participant of participants) {
            if (typeof participant !== 'string' || participant.trim().length === 0) {
                throw new Error('参加者名を入力してください');
            }

            if (participant.length > 20) {
                throw new Error('参加者名は20文字以内である必要があります');
            }

            if (uniqueParticipants.has(participant)) {
                throw new Error('重複する参加者名があります');
            }

            uniqueParticipants.add(participant);
        }

        return true;
    }),

    validate
];

// イベント更新のバリデーションルール
const updateEventRules = [
    param('eventId').isUUID().withMessage('有効なイベントIDを指定してください'),

    body('description').optional().trim().isLength({ max: 500 })
    .withMessage('説明は500文字以内で入力してください'),

    body('dates').optional().isArray({ min: 1 })
    .withMessage('少なくとも1つの日程を設定してください')
    .custom(dates => {
        if (!dates || dates.length === 0) return true;

        // 日付フォーマットと有効性のチェック
        const now = new Date();
        const threeMonthsLater = new Date();
        threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);

        for (const date of dates) {
            const dateObj = new Date(date);
            if (isNaN(dateObj.getTime())) {
                throw new Error('不正な日付形式です');
            }
            if (dateObj < now || dateObj > threeMonthsLater) {
                throw new Error('日付は現在から3ヶ月以内である必要があります');
            }
        }

        // 重複チェック
        const uniqueDates = new Set(dates);
        if (uniqueDates.size !== dates.length) {
            throw new Error('重複する日程があります');
        }

        return true;
    }),

    body('participants').optional().isArray({ min: 1, max: 20 })
    .withMessage('参加者は1名以上20名以下で設定してください')
    .custom(participants => {
        if (!participants || participants.length === 0) return true;

        // 参加者名の長さと重複チェック
        const uniqueParticipants = new Set();

        for (const participant of participants) {
            if (typeof participant !== 'string' || participant.trim().length === 0) {
                throw new Error('参加者名を入力してください');
            }

            if (participant.length > 20) {
                throw new Error('参加者名は20文字以内である必要があります');
            }

            if (uniqueParticipants.has(participant)) {
                throw new Error('重複する参加者名があります');
            }

            uniqueParticipants.add(participant);
        }

        return true;
    }),

    validate
];

// レスポンス更新のバリデーションルール
const updateResponseRules = [
    param('eventId').isUUID().withMessage('有効なイベントIDを指定してください'),

    body('participant_name').notEmpty().withMessage('参加者名は必須です')
    .isLength({ max: 20 }).withMessage('参加者名は20文字以内である必要があります'),

    body('date').notEmpty().withMessage('日付は必須です')
    .custom(date => {
        const dateObj = new Date(date);
        if (isNaN(dateObj.getTime())) {
            throw new Error('不正な日付形式です');
        }
        return true;
    }),

    body('status').isIn(['未回答', '◯', '×', '△']).withMessage('有効な回答ステータスではありません'),

    validate
];

// イベント存在確認のバリデーションルール
const checkEventRules = [
    param('eventId').isUUID().withMessage('有効なイベントIDを指定してください'),
    validate
];

module.exports = {
    createEventRules,
    updateEventRules,
    updateResponseRules,
    checkEventRules
};