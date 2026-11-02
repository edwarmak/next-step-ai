export function normalizeResumeTextForFingerprint(text: string): string {
  return text.replace(/\r\n/g, '\n').normalize('NFC')
}

export async function createResumeFingerprint(text: string): Promise<string> {
  const normalizedText = normalizeResumeTextForFingerprint(text)
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(normalizedText),
  )

  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('')
}
