import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  getGuestSavedJob,
  listGuestSavedJobs,
  saveGuestJob,
} from '../src/services/guestSavedJobService.ts'

const STORAGE_KEY = 'next-step-ai:guest-saved-jobs'

function createMemoryStorage(initial = {}) {
  const values = new Map(Object.entries(initial))
  return {
    getItem(key) {
      return values.get(key) ?? null
    },
    setItem(key, value) {
      values.set(key, String(value))
    },
    removeItem(key) {
      values.delete(key)
    },
  }
}

function details(index = 1) {
  return {
    jobTitle: `Designer ${index}`,
    companyName: `Company ${index}`,
    jobDescription: `Description ${index}`,
  }
}

test('saving a guest job stores only necessary detail fields and can retrieve it', () => {
  const storage = createMemoryStorage()
  const savedJob = saveGuestJob(details(), storage)
  const storedValue = JSON.parse(storage.getItem(STORAGE_KEY))

  assert.match(savedJob.id, /^guest-/)
  assert.deepEqual(Object.keys(storedValue[0]).sort(), [
    'company_name',
    'created_at',
    'id',
    'job_description',
    'job_title',
  ])
  assert.equal(getGuestSavedJob(savedJob.id, storage)?.id, savedJob.id)
})

test('guest jobs are limited to the five most recent records', () => {
  const storage = createMemoryStorage()
  const savedJobs = Array.from({ length: 7 }, (_, index) =>
    saveGuestJob(details(index + 1), storage),
  )
  const recentJobs = listGuestSavedJobs(storage)

  assert.equal(recentJobs.length, 5)
  assert.equal(recentJobs[0].id, savedJobs[6].id)
  assert.equal(
    recentJobs.some((job) => job.id === savedJobs[0].id),
    false,
  )
})

test('malformed and outdated session data is safely discarded', () => {
  const invalidRecords = createMemoryStorage({
    [STORAGE_KEY]: JSON.stringify([
      { id: 'old-format', title: 'Old job' },
      {
        id: 'guest-valid',
        job_title: 'Designer',
        company_name: 'Company',
        job_description: 'Description',
        created_at: '2026-11-02T00:00:00.000Z',
        extracted_resume_text: 'should not be retained',
      },
    ]),
  })

  assert.deepEqual(listGuestSavedJobs(invalidRecords).map((job) => job.id), [
    'guest-valid',
  ])
  assert.equal(
    'extracted_resume_text' in
      JSON.parse(invalidRecords.getItem(STORAGE_KEY))[0],
    false,
  )

  const malformedJson = createMemoryStorage({
    [STORAGE_KEY]: '{not valid json',
  })
  assert.deepEqual(listGuestSavedJobs(malformedJson), [])
  assert.equal(malformedJson.getItem(STORAGE_KEY), null)
})
