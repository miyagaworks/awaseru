const mysql = require('mysql2/promise');

// MySQLプール設定
const pool = mysql.createPool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 3306,
    ssl: process.env.DB_SSL === 'true' ? {
        rejectUnauthorized: false
    } : undefined,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// 接続確認
pool.on('connection', () => {
    console.log('Connected to MySQL');
});

// 汎用クエリ関数
const query = async(text, params) => {
    try {
        const start = Date.now();
        const [rows, fields] = await pool.execute(text, params);
        const duration = Date.now() - start;

        if (process.env.NODE_ENV !== 'production') {
            console.log('Debug info:', someData);
        }

        return { rows, fields };
    } catch (error) {
        console.error('Query error:', error.message);
        throw error;
    }
};

module.exports = {
    query,
    pool
};