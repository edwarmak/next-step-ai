import { supabase } from '../lib/supabaseClient'
import type {
  JobAnalysisDetails,
  SavedJobAnalysis,
} from '../types/jobAnalysis'

const JOB_ANALYSIS_COLUMNS =
  'id,user_id,resume_id,job_title,company_name,job_description,created_at,updated_at,resume:resumes!job_analyses_resume_owner_fk(display_name)'

type JobAnalysisRow = Omit<SavedJobAnalysis, 'resume_name'> & {
  resume: { display_name: string } | { display_name: string }[] | null
}

function mapJobAnalysis(row: JobAnalysisRow): SavedJobAnalysis {
  const { resume, ...analysis } = row
  const resumeName = Array.isArray(resume)
    ? resume[0]?.display_name
    : resume?.display_name

  return {
    ...analysis,
    resume_name: resumeName ?? null,
  }
}

export async function listJobAnalyses(
  userId: string,
): Promise<SavedJobAnalysis[]> {
  const { data, error } = await supabase
    .from('job_analyses')
    .select(JOB_ANALYSIS_COLUMNS)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return (data as JobAnalysisRow[]).map(mapJobAnalysis)
}

export async function getJobAnalysis(
  userId: string,
  analysisId: string,
): Promise<SavedJobAnalysis> {
  const { data, error } = await supabase
    .from('job_analyses')
    .select(JOB_ANALYSIS_COLUMNS)
    .eq('user_id', userId)
    .eq('id', analysisId)
    .single()

  if (error) {
    throw error
  }

  return mapJobAnalysis(data as JobAnalysisRow)
}

export async function saveJobAnalysis(
  userId: string,
  details: JobAnalysisDetails,
  resumeId: string | null,
): Promise<SavedJobAnalysis> {
  const { data, error } = await supabase
    .from('job_analyses')
    .insert({
      user_id: userId,
      job_title: details.jobTitle.trim(),
      company_name: details.companyName.trim(),
      job_description: details.jobDescription.trim(),
      resume_id: resumeId,
      analysis_results: null,
    })
    .select(JOB_ANALYSIS_COLUMNS)
    .single()

  if (error) {
    throw error
  }

  return mapJobAnalysis(data as JobAnalysisRow)
}

export async function deleteJobAnalysis(
  userId: string,
  analysisId: string,
): Promise<void> {
  const { data, error } = await supabase
    .from('job_analyses')
    .delete()
    .eq('user_id', userId)
    .eq('id', analysisId)
    .select('id')
    .maybeSingle()

  if (error) {
    throw error
  }

  if (!data) {
    throw new Error('The saved job could not be found or deleted.')
  }
}
