// Called only by CLI entry points, never on import or by tests.
import { loadEnvFile } from 'node:process'
export function loadLocalEnv(load = loadEnvFile) {
  try {
    load('.env.local')
  } catch (error) {
    if (error.code !== 'ENOENT') throw new Error('Unable to load .env.local.')
  }
}
