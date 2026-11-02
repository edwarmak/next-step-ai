import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  getRecentJobDisplay,
  loadRecentJobsForViewer,
} from '../src/components/RecentJobs/recentAnalysisView.ts'
import { listGuestSavedJobs } from '../src/services/guestSavedJobService.ts'

function savedJob(overrides = {}) {
  return {
    id: 'analysis-123',
    user_id: 'user-123',
    resume_id: null,
    job_title: 'Product Designer',
    company_name: 'Northstar',
    job_description: 'Design thoughtful products.',
    analyzed_at: null,
    created_at: '2026-10-24T10:00:00.000Z',
    updated_at: '2026-10-24T10:00:00.000Z',
    resume_name: null,
    ...overrides,
  }
}

test('signed-in dashboard fetching is scoped to that user', async () => {
  const savedJobs = [savedJob()]
  const requestedUserIds = []

  const result = await loadRecentJobsForViewer(
    'user-123',
    async (userId) => {
      requestedUserIds.push(userId)
      return savedJobs
    },
    () => {
      assert.fail('Signed-in users should not read guest session jobs.')
    },
  )

  assert.deepEqual(requestedUserIds, ['user-123'])
  assert.deepEqual(result, savedJobs)
})

test('guest dashboard reads session jobs without calling the Supabase fetcher', async () => {
  const guestJobs = [{ id: 'guest-1' }]
  let supabaseFetchCount = 0
  let guestReadCount = 0

  const result = await loadRecentJobsForViewer(
    null,
    async () => {
      supabaseFetchCount += 1
      return [savedJob()]
    },
    () => {
      guestReadCount += 1
      return guestJobs
    },
  )

  assert.deepEqual(result, guestJobs)
  assert.equal(supabaseFetchCount, 0)
  assert.equal(guestReadCount, 1)
})

test('recent saved job display uses the saved date and existing detail route', () => {
  const job = savedJob()
  const display = getRecentJobDisplay(job)

  assert.equal(display.id, job.id)
  assert.equal(display.title, job.job_title)
  assert.equal(display.company, job.company_name)
  assert.equal(
    display.date,
    new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(
      new Date(job.created_at),
    ),
  )
  assert.equal(display.detailsPath, '/applications/analysis-123')
})

test('guest dashboard shows jobs returned by session storage', () => {
  const storage = createMemoryStorage()
  storage.setItem(
    'next-step-ai:guest-saved-jobs',
    JSON.stringify([
      {
        id: 'guest-123',
        job_title: 'Product Designer',
        company_name: 'Northstar',
        job_description: 'Design thoughtful products.',
        created_at: '2026-10-24T10:00:00.000Z',
      },
    ]),
  )
  const [job] = listGuestSavedJobs(storage)
  const display = getRecentJobDisplay(job)

  assert.equal(display.id, 'guest-123')
  assert.equal(display.title, 'Product Designer')
  assert.equal(display.detailsPath, '/applications/guest-123')
})

function createMemoryStorage() {
  const values = new Map()
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
