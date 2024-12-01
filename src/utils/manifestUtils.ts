// utils/manifestUtils.ts
import * as fs from 'fs'
import path from 'path'

export function validateManifest(manifestPath: string): void {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

  if (!manifest.name) {
    throw new Error('Invalid manifest: "name" is a required fields.');
  }

  if (!manifest.id) {
    throw new Error('Invalid manifest: "id" is a required fields.');
  }
}

export const getManifestPath = (): string => {
  const manifestPath = path.join(process.cwd(), 'teachfloor-app.json')

  if (!fs.existsSync(manifestPath)) {
    throw new Error('Manifest file not found. Please ensure "teachfloor-app.json" exists in the project root.');
  }

  return manifestPath
}
