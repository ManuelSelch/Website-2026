#!/usr/bin/env bash

npm ci
NODE_ENV=production npm run build
NODE_ENV=production PORT=3000 pm2 startOrRestart scripts/ecosystem.config.cjs --only "manuel-frontend"
pm2 start scripts/ecosystem.config.cjs --name manuel-frontend --restart-delay 20000
pm2 save

