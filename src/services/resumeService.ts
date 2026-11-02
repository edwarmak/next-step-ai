import { supabase } from '../lib/supabaseClient'
import type { NewSavedResume, SavedResume } from '../types/resume'

const RESUME_COLUMNS =
  'id,user_id,file_name,display_name,file_type,extracted_text,created_at,updated_at'

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
  const { data, error } = await supabase
    .from('resumes')
    .insert(resume)
    .select(RESUME_COLUMNS)
    .single()

  if (error) {
    throw error
  }

  return data as SavedResume
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
