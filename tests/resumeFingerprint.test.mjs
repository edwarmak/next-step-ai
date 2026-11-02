import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createResumeFingerprint } from '../src/services/resumeFingerprint.ts'

test('resume fingerprints normalize line endings and Unicode NFC', async () => {
  const composed = await createResumeFingerprint('Resume\r\nExperience: café')
  const decomposed = await createResumeFingerprint(
    'Resume\nExperience: cafe\u0301',
  )

  assert.equal(composed, decomposed)
  assert.match(composed, /^[0-9a-f]{64}$/)
})

test('resume fingerprints preserve meaningful text differences', async () => {
  const singleSpace = await createResumeFingerprint('Experience: Engineer')
  const doubleSpace = await createResumeFingerprint('Experience:  Engineer')
  const differentLine = await createResumeFingerprint('Experience:\nEngineer')

  assert.notEqual(singleSpace, doubleSpace)
  assert.notEqual(singleSpace, differentLine)
})
