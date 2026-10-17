import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, mkdir, writeFile, chmod, readFile, rm, copyFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { spawnSync } from 'node:child_process'

test('deployment builds before PM2 restart and does not restart on build failure', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'portfolio-deploy-'))
  try {
    await mkdir(path.join(root, 'scripts'))
    await mkdir(path.join(root, 'bin'))
    await copyFile(
      new URL('../scripts/deploy.sh', import.meta.url),
      path.join(root, 'scripts/deploy.sh'),
    )
    await writeFile(path.join(root, 'package-lock.json'), '{}')
    for (const command of ['npm', 'pm2']) {
      const file = path.join(root, 'bin', command)
      await writeFile(
        file,
        `#!/bin/bash\necho '${command}' "$@" >> "$DEPLOY_LOG"\nif [[ '${command}' == npm && "$1" == run && "$FAIL_BUILD" == yes ]]; then exit 1; fi\n`,
      )
      await chmod(file, 0o755)
    }
    const log = path.join(root, 'commands.log')
    const env = { ...process.env, PATH: `${root}/bin:${process.env.PATH}`, DEPLOY_LOG: log }
    let result = spawnSync('bash', [path.join(root, 'scripts/deploy.sh')], {
      cwd: tmpdir(),
      env,
      encoding: 'utf8',
    })
    assert.equal(result.status, 0, result.stderr)
    let commands = await readFile(log, 'utf8')
    assert.ok(commands.indexOf('npm ci') < commands.indexOf('npm run build'))
    assert.ok(commands.indexOf('npm run build') < commands.indexOf('pm2 startOrRestart'))
    assert.match(commands, /pm2 save/)
    await writeFile(log, '')
    result = spawnSync('bash', [path.join(root, 'scripts/deploy.sh')], {
      env: { ...env, FAIL_BUILD: 'yes' },
      encoding: 'utf8',
    })
    assert.notEqual(result.status, 0)
    commands = await readFile(log, 'utf8')
    assert.doesNotMatch(commands, /startOrRestart|pm2 save/)
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})
