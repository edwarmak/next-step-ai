import type { SavedJobAnalysis } from '../../types/jobAnalysis'
import type { GuestSavedJob } from '../../services/guestSavedJobService'

type RecentJobFetcher = (
  userId: string,
) => Promise<SavedJobAnalysis[]>

type RecentJob = Pick<
  SavedJobAnalysis,
  'id' | 'job_title' | 'company_name' | 'created_at'
>

export type RecentJobDisplay = {
  id: string
  title: string
  company: string
  date: string
  detailsPath: string
}

export function loadRecentJobsForViewer(
  userId: string,
  fetchJobs: RecentJobFetcher,
  readGuestJobs: () => GuestSavedJob[],
): Promise<SavedJobAnalysis[]>
export function loadRecentJobsForViewer(
  userId: null,
  fetchJobs: RecentJobFetcher,
  readGuestJobs: () => GuestSavedJob[],
): Promise<GuestSavedJob[]>
export function loadRecentJobsForViewer(
  userId: string | null,
  fetchJobs: RecentJobFetcher,
  readGuestJobs: () => GuestSavedJob[],
): Promise<SavedJobAnalysis[] | GuestSavedJob[]> {
  return userId
    ? fetchJobs(userId)
    : Promise.resolve(readGuestJobs())
}

export function getRecentJobDisplay(
  job: RecentJob | GuestSavedJob,
): RecentJobDisplay {
  return {
    id: job.id,
    title: job.job_title,
    company: job.company_name,
    date: new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
    }).format(new Date(job.created_at)),
    detailsPath: `/applications/${job.id}`,
  }
}
