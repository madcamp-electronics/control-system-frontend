import { spawn } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'

function loadDotEnv(filepath) {
  const contents = readFileSync(filepath, 'utf8')

  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.trim()

    if (!line || line.startsWith('#')) {
      continue
    }

    const separatorIndex = line.indexOf('=')
    if (separatorIndex === -1) {
      continue
    }

    const key = line.slice(0, separatorIndex).trim()
    const value = line.slice(separatorIndex + 1).trim()

    if (key && process.env[key] === undefined) {
      process.env[key] = value
    }
  }
}

if (existsSync('.env')) {
  loadDotEnv('.env')
}

const command = process.argv[2]

if (!command || !['dev', 'start'].includes(command)) {
  console.error('Usage: node scripts/run-next.mjs <dev|start>')
  process.exit(1)
}

const appUrl = process.env.APP_URL || 'http://localhost:3000'
let host = 'localhost'
let port = '3000'

try {
  const parsedUrl = new URL(appUrl)
  host = parsedUrl.hostname || host
  port = parsedUrl.port || (parsedUrl.protocol === 'https:' ? '443' : '80')
} catch (error) {
  console.error(`Invalid APP_URL: ${appUrl}`)
  console.error('Expected format: http://localhost:3000')
  process.exit(1)
}

const nextBin = path.join(process.cwd(), 'node_modules', 'next', 'dist', 'bin', 'next')

const child = spawn(process.execPath, [nextBin, command, '--hostname', host, '--port', port], {
  stdio: 'inherit',
  env: process.env,
})

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal)
    return
  }

  process.exit(code ?? 0)
})
