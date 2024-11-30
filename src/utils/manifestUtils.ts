// utils/manifestUtils.ts
import * as fs from 'fs'

export function validateManifest(manifestPath: string): void {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

  if (!manifest.name) {
    throw new Error('Invalid manifest: "name" is a required fields.');
  }

  if (!manifest.id) {
    throw new Error('Invalid manifest: "id" is a required fields.');
  }
}