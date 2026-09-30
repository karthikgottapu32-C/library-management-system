module.exports = {
  apps: [
    {
      name: 'library-api',
      script: 'src/server.js',
      cwd: './backend',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        PORT: 8000,
        DB_USER: 'c##library_user',
        DB_PASSWORD: 'library_password',
        DB_CONNECTION_STRING: 'localhost:1521/FREE'
      },
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    }
  ]
};
