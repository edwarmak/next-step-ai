import type { JobAnalysisDetails } from '../types/jobAnalysis'

const GUEST_SAVED_JOBS_KEY = 'next-step-ai:guest-saved-jobs'
const MAX_GUEST_SAVED_JOBS = 5

export type GuestSavedJob = {
  id: string
  job_title: string
  company_name: string
  job_description: string
  created_at: string
}

type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

function isGuestSavedJob(value: unknown): value is GuestSavedJob {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const job = value as Record<string, unknown>
  return (
    typeof job.id === 'string' &&
    job.id.startsWith('guest-') &&
    typeof job.job_title === 'string' &&
    job.job_title.trim().length > 0 &&
    typeof job.company_name === 'string' &&
    job.company_name.trim().length > 0 &&
    typeof job.job_description === 'string' &&
    typeof job.created_at === 'string' &&
    Number.isFinite(Date.parse(job.created_at))
  )
}

function getStorage(storage?: StorageLike): StorageLike {
  if (storage) {
    return storage
  }

  if (typeof window === 'undefined' || !window.sessionStorage) {
    throw new Error('Session storage is unavailable in this browser.')
  }

  return window.sessionStorage
}

export function listGuestSavedJobs(storage?: StorageLike): GuestSavedJob[] {
  const sessionStorage = getStorage(storage)
  const storedJobs = sessionStorage.getItem(GUEST_SAVED_JOBS_KEY)
  if (!storedJobs) {
    return []
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(storedJobs)
  } catch {
    sessionStorage.removeItem(GUEST_SAVED_JOBS_KEY)
    return []
  }

  if (!Array.isArray(parsed)) {
    sessionStorage.removeItem(GUEST_SAVED_JOBS_KEY)
    return []
  }

  const validJobs = parsed.filter(isGuestSavedJob).map(
    ({ id, job_title, company_name, job_description, created_at }) => ({
      id,
      job_title,
      company_name,
      job_description,
      created_at,
    }),
  )
  const recentJobs = validJobs
    .sort(
      (left, right) =>
        Date.parse(right.created_at) - Date.parse(left.created_at),
    )
    .slice(0, MAX_GUEST_SAVED_JOBS)

  if (storedJobs !== JSON.stringify(recentJobs)) {
    sessionStorage.setItem(GUEST_SAVED_JOBS_KEY, JSON.stringify(recentJobs))
  }

  return recentJobs
}

export function getGuestSavedJob(
  jobId: string,
  storage?: StorageLike,
): GuestSavedJob | null {
  return listGuestSavedJobs(storage).find((job) => job.id === jobId) ?? null
}

export function saveGuestJob(
  details: JobAnalysisDetails,
  storage?: StorageLike,
): GuestSavedJob {
  const sessionStorage = getStorage(storage)
  const title = details.jobTitle.trim()
  const company = details.companyName.trim()
  const description = details.jobDescription.trim()
  if (!title || !company || !description) {
    throw new Error('Enter a job title, company, and description before saving.')
  }

  const job: GuestSavedJob = {
    id: `guest-${crypto.randomUUID()}`,
    job_title: title,
    company_name: company,
    job_description: description,
    created_at: new Date().toISOString(),
  }

  const recentJobs = listGuestSavedJobs(sessionStorage)
  sessionStorage.setItem(
    GUEST_SAVED_JOBS_KEY,
    JSON.stringify([job, ...recentJobs].slice(0, MAX_GUEST_SAVED_JOBS)),
  )
  return job
}
