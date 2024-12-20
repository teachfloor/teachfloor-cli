// utils/manifestUtils.ts
import fs from 'fs'
import path from 'path'
import { Manifest } from '../types/manifest.types.js'

export const validateManifest = (manifestPath: string): void => {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

  if (!manifest.name) {
    throw new Error('Invalid manifest: "name" is a required field.');
  }

  if (!manifest.id) {
    throw new Error('Invalid manifest: "id" is a required field.');
  }

  if (!manifest.version) {
    throw new Error('Invalid manifest: "version" is a required field.');
  }
}

export const getManifestPath = (): string => {
  const manifestPath = path.join(process.cwd(), 'teachfloor-app.json')

  if (!fs.existsSync(manifestPath)) {
    throw new Error('Manifest file not found. Please ensure "teachfloor-app.json" exists in the project root.');
  }

  return manifestPath
}

export const getManifest = (path: string | null = null): Manifest => {
  return JSON.parse(fs.readFileSync(path || getManifestPath(), 'utf8')) || {};
}

export const getManifestValue = (path: string): any | undefined => (
  path.split('.').reduce((obj: any, key: string) => {
    if (obj && typeof obj === 'object' && key in obj) {
      return obj[key]
    }

    return undefined
  }, getManifest())
)

export const addManifestView = (viewport: string, componentName: string): void => {
  const manifestPath = getManifestPath()

  validateManifest(manifestPath)

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'))
  manifest.ui_extension = manifest.ui_extension || {}
  manifest.ui_extension.views = manifest.ui_extension.views || []
  manifest.ui_extension.views.push({
    viewport,
    component: componentName,
  })

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2))
}

export const removeManifestView = (viewport: string): void => {
  const manifestPath = getManifestPath()

  validateManifest(manifestPath)

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'))

  if (!manifest.ui_extension || !manifest.ui_extension.views) {
    throw new Error('No views found in the manifest.')
  }

  manifest.ui_extension.views = manifest.ui_extension.views.filter(
    (view: { viewport: string; component: string }) => view.viewport !== viewport
  )

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2))
}

export const addManifestPermission = (permissionName: string, explanation: string): void => {
  const manifestPath = getManifestPath()

  validateManifest(manifestPath)

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'))
  manifest.permissions = manifest.permissions || []
  manifest.permissions.push({
    permission: permissionName,
    purpose: explanation,
  })

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2))
}

export const removeManifestPermission = (permissionName: string): void => {
  const manifestPath = getManifestPath()

  validateManifest(manifestPath)

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'))
  manifest.permissions = manifest.permissions || []
  manifest.permissions = manifest.permissions.filter(
    (perm: { permission: string }) => perm.permission !== permissionName
  )

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2))
}

export const setManifestConfiguration = (key: string, value: string): void => {
  const manifestPath = getManifestPath()

  validateManifest(manifestPath)

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'))
  manifest[key] = value

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2))
}
