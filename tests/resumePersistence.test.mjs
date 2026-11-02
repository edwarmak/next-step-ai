import assert from 'node:assert/strict'
import { test } from 'node:test'
import { findOrCreateResume } from '../src/services/resumePersistence.ts'

test('matching fingerprint returns the saved resume without inserting', async () => {
  const resume = { id: 'existing-resume' }
  let findCount = 0
  let insertCount = 0

  const result = await findOrCreateResume({
    findByFingerprint: async () => {
      findCount += 1
      return resume
    },
    insert: async () => {
      insertCount += 1
      return { id: 'duplicate-resume' }
    },
    isUniqueViolation: () => false,
  })

  assert.equal(result, resume)
  assert.equal(findCount, 1)
  assert.equal(insertCount, 0)
})

test('concurrent duplicate insert reuses the winning resume', async () => {
  const resume = { id: 'winning-resume' }
  let findCount = 0

  const result = await findOrCreateResume({
    findByFingerprint: async () => {
      findCount += 1
      return findCount === 1 ? null : resume
    },
    insert: async () => {
      throw Object.assign(new Error('Duplicate fingerprint'), {
        code: '23505',
      })
    },
    isUniqueViolation: (error) =>
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === '23505',
  })

  assert.equal(result, resume)
  assert.equal(findCount, 2)
})
