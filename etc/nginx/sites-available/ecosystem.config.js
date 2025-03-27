// /var/www/awaseru/ecosystem.config.js
module.exports = {
    apps: [{
            name: "awaseru-frontend",
            script: "npm",
            args: "start",
            cwd: "/var/www/awaseru/frontend",
            env: {
                NODE_ENV: "production",
                PORT: 3000
            },
            instances: 1,
            exec_mode: "fork",
            watch: false,
            autorestart: true,
            max_memory_restart: "300M",
            log_date_format: "YYYY-MM-DD HH:mm:ss",
            merge_logs: true,
            error_file: "/var/log/pm2/awaseru-frontend-error.log",
            out_file: "/var/log/pm2/awaseru-frontend-out.log"
        },
        {
            name: "awaseru-backend",
            script: "server.js",
            cwd: "/var/www/awaseru/backend",
            env: {
                NODE_ENV: "production",
                PORT: 4000
            },
            instances: "max", // クラスターモードでCPUコア数だけ起動
            exec_mode: "cluster",
            watch: false,
            autorestart: true,
            max_memory_restart: "300M",
            log_date_format: "YYYY-MM-DD HH:mm:ss",
            merge_logs: true,
            error_file: "/var/log/pm2/awaseru-backend-error.log",
            out_file: "/var/log/pm2/awaseru-backend-out.log"
        }
    ]
};