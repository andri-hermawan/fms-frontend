module.exports = {
  apps: [
    {
      name: 'fms-frontend',
      cwd: __dirname,
      script: 'npm.cmd',
      args: 'run start:prod -- --host 0.0.0.0 --port 8881',
      interpreter: 'none',
      env: {
        NODE_ENV: 'production',
      },
      time: true,
      autorestart: true,
      restart_delay: 3000,
      max_restarts: 10,
      max_memory_restart: '512M',
    },
  ],
}
