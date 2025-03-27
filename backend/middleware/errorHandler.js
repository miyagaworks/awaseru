/**
 * グローバルエラーハンドラーミドルウェア
 */
const errorHandler = (err, req, res, next) => {
    // エラー情報をログに出力
    console.error('Error:', err.message);

    // PostgreSQLの特定のエラーを処理
    if (err.code) {
        switch (err.code) {
            // 一意性制約違反
            case '23505':
                return res.status(409).json({
                    error: '重複するデータが存在します',
                    details: err.constraint
                });

                // 外部キー制約違反
            case '23503':
                return res.status(400).json({
                    error: '参照整合性エラー',
                    details: err.constraint
                });

                // チェック制約違反
            case '23514':
                return res.status(400).json({
                    error: '入力値が制約に違反しています',
                    details: err.constraint
                });

                // 不正な日付/時間
            case '22007':
                return res.status(400).json({
                    error: '不正な日付または時間フォーマットです'
                });
        }
    }

    // カスタムステータスコードがある場合はそれを使用
    const statusCode = err.statusCode || 500;

    // エラーレスポンスの構築
    const errorResponse = {
        error: err.message || 'サーバーエラーが発生しました',
    };

    // 開発環境の場合はスタックトレースを含める
    if (process.env.NODE_ENV !== 'production' && err.stack) {
        errorResponse.stack = err.stack;
    }

    res.status(statusCode).json(errorResponse);
};

module.exports = errorHandler;