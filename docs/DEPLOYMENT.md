# Homelab deployment with PM2

This deploys the **Next.js frontend**, not Cockpit. It is an alternative to Vercel.
Run as a normal deployment user on the host with a supported Node.js version, npm and PM2 installed (`npm install -g pm2`). The test suite currently requires a Node version supporting `--experimental-strip-types`.

## First deployment

1. Clone the repository onto the host.
2. Create an untracked `.env.production.local` in its root:
   ```dotenv
   COCKPIT_URL=https://cms.example.com
   ```
   Use your real Cockpit address, reachable by this host **and visitors' browsers** (project images load from it). Never place the Cockpit write API key on the frontend host. Next.js loads this file during build and runtime. An existing `.env.local` takes precedence: avoid stale local URLs there.
3. Run:
   ```sh
   ./scripts/deploy.sh
   ```
4. Configure your HTTPS reverse proxy to forward to `127.0.0.1:3000`. Do not expose the Node port publicly by default.
5. Configure reboot persistence once: run `pm2 startup`, follow the command it prints for your system/user, then `pm2 save`.

Optional settings:
```sh
PORT=3010 BIND_HOST=127.0.0.1 PM2_APP_NAME=manuel-portfolio ./scripts/deploy.sh
```

## Updates

Update the checkout yourself, then rerun `./scripts/deploy.sh`. It resolves the repository from its own location, stops only the named app if present, runs `npm ci --include=dev`, builds into `.next-production`, starts/restarts through PM2, and saves the process list. It does not pull Git, install system software, configure TLS, or run sudo.

**Updates have downtime.** A failed install/build leaves the app stopped; fix the cause and rerun. This is a simple in-place deployment, not an atomic or zero-downtime release system. PM2 starting successfully is not an HTTP health check. Verify the homepage, projects, image loading, and `pm2 logs manuel-portfolio` after deployment. PM2 saves its full process list, so other apps already managed by that user are also included in reboot persistence. Do not run under a shell containing unrelated secrets: PM2 may retain inherited environment variables.

Useful commands:
```sh
pm2 status
pm2 logs manuel-portfolio
pm2 restart manuel-portfolio
```

Before public launch, secure Cockpit's public read permissions (especially drafts), back up Cockpit storage/configuration, and preserve the existing `/2023/` website route when switching domains.
