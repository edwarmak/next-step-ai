import { supabase } from '../lib/supabaseClient'
import type { NewSavedResume, SavedResume } from '../types/resume'
import { createResumeFingerprint } from './resumeFingerprint'
import { findOrCreateResume } from './resumePersistence'

const RESUME_COLUMNS =
  'id,user_id,file_name,display_name,file_type,extracted_text,content_fingerprint,created_at,updated_at'

export async function listSavedResumes(userId: string): Promise<SavedResume[]> {
  const { data, error } = await supabase
    .from('resumes')
    .select(RESUME_COLUMNS)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return data as SavedResume[]
}

export async function saveResume(
  resume: NewSavedResume,
): Promise<SavedResume> {
  const contentFingerprint = await createResumeFingerprint(
    resume.extracted_text,
  )

  return findOrCreateResume({
    findByFingerprint: async () => {
      const { data, error } = await supabase
        .from('resumes')
        .select(RESUME_COLUMNS)
        .eq('user_id', resume.user_id)
        .eq('content_fingerprint', contentFingerprint)
        .maybeSingle()

      if (error) {
        throw error
      }

      return data as SavedResume | null
    },
    insert: async () => {
      const { data, error } = await supabase
        .from('resumes')
        .insert({ ...resume, content_fingerprint: contentFingerprint })
        .select(RESUME_COLUMNS)
        .single()

      if (error) {
        throw error
      }

      return data as SavedResume
    },
    isUniqueViolation: (error) =>
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === '23505',
  })
}

export async function renameSavedResume(
  userId: string,
  resumeId: string,
  displayName: string,
): Promise<SavedResume> {
  const { data, error } = await supabase
    .from('resumes')
    .update({ display_name: displayName })
    .eq('id', resumeId)
    .eq('user_id', userId)
    .select(RESUME_COLUMNS)
    .single()

  if (error) {
    throw error
  }

  return data as SavedResume
}

export async function deleteSavedResume(
  userId: string,
  resumeId: string,
): Promise<void> {
  const { error } = await supabase
    .from('resumes')
    .delete()
    .eq('id', resumeId)
    .eq('user_id', userId)

  if (error) {
    throw error
  }
}
