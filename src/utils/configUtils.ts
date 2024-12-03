// utils/tokenUtils.ts
import * as fs from 'fs'
import * as path from 'path'

const configPath = path.join(process.env.HOME || process.env.USERPROFILE || '', '.teachfloorrc')

/**
 * Get configuration object
 */
const getConfig = () => {
  if (fs.existsSync(configPath)) {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
    return config ? config : {}
  }

  return {}
}

/**
 * Delete config file .teachfloorrc
 */
export const deleteConfigs = (): void => {
  fs.unlinkSync(configPath)
}

/**
 * Function to get the token from .teachfloorrc
 */
export const getToken = (): string | null => {
  const configs = getConfig()

  if (configs.token) {
    return configs.token
  }

  return null
}

/**
 * Function to set the token to .teachfloorrc
 */
export const setToken = (token: string): void => {
  const configs = getConfig()
  configs.token = token
  fs.writeFileSync(configPath, JSON.stringify(configs, null, 2), { mode: 0o600 })
}

/**
 * Function to set the organization to .teachfloorrc
 */
export const setOrganization = (orgSlug: string): void => {
  const configs = getConfig()
  configs.organization = orgSlug
  fs.writeFileSync(configPath, JSON.stringify(configs, null, 2), { mode: 0o600 })
}

/**
 * Function to get the organization from .teachfloorrc
 */
export const getOrganization = (): string | null => {
  const configs = getConfig()

  if (configs.organization) {
    return configs.organization
  }

  return null
}