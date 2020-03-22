import path from 'path'
import config from '../../config/server'

export function normalizeEmail (email: string): string {
  return email.trim().toLowerCase()
}

export function normalizeName (name: string): string {
  return name.trim().toLowerCase()
}

export function normalizeDownload (name: string): string {
  const filename = path.basename(name)

  const parts = filename.split('.')
  const nameParts = parts[0].split('-')

  if (config.removeDownloadHashes && nameParts.length !== 1) {
    // Remove the hash
    nameParts.splice(nameParts.length - 1, 1)
  }
  parts[0] = nameParts.join('-')

  const cleanName = parts.join('.')

  return cleanName
}
