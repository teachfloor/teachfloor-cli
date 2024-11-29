// utils/tokenUtils.ts
import * as fs from 'fs'
import * as path from 'path'

const configPath = path.join(process.env.HOME || process.env.USERPROFILE || '', '.teachfloorrc')

// Function to get the token from .teachfloorrc
export function getToken(): string | null {
  if (fs.existsSync(configPath)) {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
    return config.token || null
  }

  return null
}

// Function to set the token to .teachfloorrc
export function setToken(token: string): void {
  const config = { token }
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2), { mode: 0o600 })
}
