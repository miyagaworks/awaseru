module.exports = {
    apps: [{
        name: "awaseru",
        script: "server.js",
        cwd: "/var/www/awaseru/current/.next/standalone",
        env: {
            "NODE_ENV": "production",
            "PORT": "3000",
            "NEXT_PUBLIC_API_URL": "/api"
        },
        instances: 1,
        exec_mode: "fork",
        max_memory_restart: "500M"
    }]
};