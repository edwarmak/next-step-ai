export type ResumeFileType = 'pdf' | 'docx'

export type SavedResume = {
  id: string
  user_id: string
  file_name: string
  display_name: string
  file_type: ResumeFileType
  extracted_text: string
  content_fingerprint: string
  created_at: string
  updated_at: string
}

export type NewSavedResume = Pick<
  SavedResume,
  'user_id' | 'file_name' | 'display_name' | 'file_type' | 'extracted_text'
>
