export type JobAnalysisDetails = {
  jobTitle: string
  companyName: string
  jobDescription: string
}

export type SavedJobAnalysis = {
  id: string
  user_id: string
  resume_id: string | null
  job_title: string
  company_name: string
  job_description: string
  created_at: string
  updated_at: string
  resume_name: string | null
}
