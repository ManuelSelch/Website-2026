const path = require('node:path')
const root = path.resolve(__dirname, '..')

module.exports = {
  apps: [
    {
      name: process.env.PM2_APP_NAME || 'manuel-portfolio',
      cwd: root,
      script: path.join(root, 'node_modules/next/dist/bin/next'),
      args: [
        'start',
        '--hostname',
        process.env.HOSTNAME || '127.0.0.1',
        '--port',
        process.env.PORT || '3000',
      ],
      interpreter: process.execPath,
      instances: 1,
      exec_mode: 'fork',
      restart_delay: 3000,
      env: { NODE_ENV: 'production', NEXT_DIST_DIR: '.next-production' },
    },
  ],
}
