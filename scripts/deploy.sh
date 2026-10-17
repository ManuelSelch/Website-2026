#!/usr/bin/env bash

npm ci
NODE_ENV=production npm run build
NODE_ENV=production PORT=3000 pm2 startOrRestart scripts/ecosystem.config.cjs --only "manuel-frontend"
pm2 save

