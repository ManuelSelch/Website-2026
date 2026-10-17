#!/usr/bin/env bash

npm ci
npm run build
pm2 start scripts/run.sh --name "manuel-frontend" --restart-delay 20000
pm2 save

