require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

// ルートの読み込み
const eventRoutes = require('./routes/eventRoutes');
const responseRoutes = require('./routes/responseRoutes');

// エラーハンドラーの読み込み
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 4000;

// セキュリティ対策
app.use(helmet());

// レート制限 (1分間に最大100リクエスト)
const limiter = rateLimit({
    windowMs: 60 * 1000, // 1分
    max: 100, // 上限数
    standardHeaders: true,
    legacyHeaders: false,
    message: 'リクエスト数が多すぎます。しばらく経ってからお試しください。'
});
app.use(limiter);

// CORS設定
app.use(cors({
    origin: process.env.NODE_ENV === 'production' ? ['https://awaseru.net', 'https://www.awaseru.net'] : '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// ミドルウェア
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ロギング
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ルート
app.use('/api/events', eventRoutes);
app.use('/api/responses', responseRoutes);

// ヘルスチェック
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

// エラーハンドリング
app.use(errorHandler);

// 404ハンドリング
app.use((req, res) => {
    res.status(404).json({ error: 'Not Found' });
});

// サーバー起動
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app; // テスト用