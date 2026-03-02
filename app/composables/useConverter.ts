import { ref } from 'vue'
import type { ConversionResult } from '~/types/profile'
import { parseR13 } from './useR13Parser'
import { generateR14 } from './useR14Generator'

export type ConversionStatus = 'idle' | 'parsing' | 'converting' | 'done' | 'error'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB

export function useConverter() {
  const status = ref<ConversionStatus>('idle')
  const fileName = ref('')
  const result = ref<ConversionResult | null>(null)
  const error = ref('')
  const copied = ref(false)

  async function handleFile(file: File) {
    status.value = 'parsing'
    fileName.value = file.name
    error.value = ''
    result.value = null

    try {
      // File size limit
      if (file.size > MAX_FILE_SIZE) {
        throw new Error(
          `File is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum allowed size is 10 MB.`
        )
      }

      const xmlString = await file.text()

      // Validate XML structure
      const trimmed = xmlString.trimStart()
      if (!trimmed.startsWith('<?xml') && !trimmed.startsWith('<')) {
        throw new Error('This file does not appear to be a valid XML document.')
      }

      const profileMatch = xmlString.match(/<profile\s[^>]*version="(\d+)"/)
      if (!profileMatch) {
        throw new Error(
          'This file does not appear to be a Joystick Gremlin profile. Expected a <profile version="..."> root element.'
        )
      }

      const version = parseInt(profileMatch[1] ?? '0')
      if (version >= 14) {
        throw new Error(
          `This profile is already version ${version} (R14+). No conversion needed.`
        )
      }

      const profile = parseR13(xmlString)

      status.value = 'converting'

      // Small delay so the UI can update
      await new Promise((r) => setTimeout(r, 50))

      result.value = generateR14(profile)
      status.value = 'done'
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Unknown error occurred'
      status.value = 'error'
    }
  }

  function download() {
    if (!result.value) return

    const blob = new Blob([result.value.xml], { type: 'application/xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const safeName = fileName.value
      .replace(/\.xml$/i, '')
      .replace(/[^a-zA-Z0-9_\-. ]/g, '_')
      .replace(/\.{2,}/g, '_')
      .slice(0, 200)
    a.download = safeName + '_R14.xml'
    a.click()
    URL.revokeObjectURL(url)
  }

  async function copyXml() {
    if (!result.value) return
    await navigator.clipboard.writeText(result.value.xml)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  }

  function reset() {
    status.value = 'idle'
    fileName.value = ''
    result.value = null
    error.value = ''
    copied.value = false
  }

  return {
    status,
    fileName,
    result,
    error,
    copied,
    handleFile,
    download,
    copyXml,
    reset,
  }
}
