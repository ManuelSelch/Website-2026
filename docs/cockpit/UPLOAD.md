# Install the asset-upload endpoint

This is a **server-side Cockpit extension**, not a Next.js route. You install it; the assistant uses only its API afterwards.

## 1. Copy the endpoint

Copy [`api/portfolio/upload.post.php`](api/portfolio/upload.post.php) into the **active Cockpit installation's** configuration directory:

```text
<Cockpit config directory>/api/portfolio/upload.post.php
```

Use your normal file manager, SSH/SFTP or deployment process. If Cockpit's config directory is mounted from a host folder, copy into that host configuration folder. Do not modify Cockpit core files. No key is embedded in the PHP file.

This should expose `POST <COCKPIT_URL>/api/portfolio/upload`. PHP needs Fileinfo and image inspection support, normally available in Cockpit. Set PHP/web-server upload limits to at least 10 MiB (`post_max_size` must exceed `upload_max_filesize`).

## 2. Configure Cockpit

- In Assets, ensure there is exactly one **root folder named `projects`**. The endpoint resolves its native folder ID; `/projects` is not a folder ID.
- Grant the dedicated API key's role **Assets → Upload** (`assets/upload`). Do not grant this to the public role.
- Keep the key in the frontend project's gitignored `.env.local`. Use HTTPS for remote servers.

## 3. Upload from the frontend project root

```sh
npm run cockpit -- upload /path/to/pi-chat-home.png content/projects/pi-chat-home.asset.json
```

The output file must not already exist. The CLI uploads one image and stores the **complete native Cockpit asset object**, including `_id`, `path`, and `folder`. Native Cockpit assets may have `title`/`altText` instead of `name`; the CLI adds a filename for the project editor. Byte-identical files already present in the projects folder are reused (best-effort deduplication, not a concurrency guarantee). It never displays the key. The endpoint only accepts a single PNG/JPEG/WebP image, up to 10 MiB and 20 megapixels, into the fixed `projects` folder. It does not accept arbitrary folders, remote URLs, executable uploads, replacement or deletion.

Use the returned asset object in the project's `cover` or `gallery` field. Preserve its native metadata; add descriptive `alt`/`caption` as appropriate. Then publish the existing project:

```sh
npm run cockpit -- save content/projects/pi-chat.json --update --publish
TEST_BASE_URL=http://127.0.0.1:3016 npm run verify:project -- pi-chat
```

## Updating the initial endpoint

The initial endpoint incorrectly required Cockpit's uploaded asset to have `name`. Cockpit may omit that field, causing HTTP 500 **after storing the image**, without adding a system-log entry. Replace your installed file with the current [`upload.post.php`](api/portfolio/upload.post.php) before retrying. It now validates `_id` and `path`, and reuses an existing same-hash asset in projects to avoid another duplicate. Previously created duplicate files are not deleted automatically.

## Troubleshooting and acceptance checks

- **404:** endpoint file is not in the active config directory, or this Cockpit version does not support method-specific file endpoints.
- **401/412:** missing/invalid key; query/body key overrides and the public token are refused.
- **403:** the authenticated role lacks `assets/upload`.
- **409:** root `projects` folder is missing or ambiguous.
- **413/415:** image size/resolution/type rejected.
- **500 or timeout:** check Assets before retrying; a file might already have been uploaded.

Before using in production, verify that a request with no key or insufficient permissions cannot upload anything, a valid image appears in Assets → projects, and malformed/non-image files are rejected. No request body or internal exception details are returned in errors.

The endpoint is prepared from Cockpit's public file-routing and Assets module interfaces. It has **not been installed or tested against your Cockpit server yet**. No Docker access is needed or permitted. Tell the assistant when installation is complete to perform API checks and upload the five Pi-Chat screenshots.

Sources: [file-based API routes](https://getcockpit.com/documentation/guides/creating-file-based-api-endpoints), [Cockpit Assets module](https://github.com/Cockpit-HQ/Cockpit/blob/master/modules/Assets/bootstrap.php).
