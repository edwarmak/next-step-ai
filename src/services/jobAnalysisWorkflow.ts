import type { JobAnalysisDetails } from '../types/jobAnalysis'
import type {
  NewSavedResume,
  ResumeFileType,
  SavedResume,
} from '../types/resume'

export type ActiveResume =
  | { kind: 'saved'; id: string }
  | { kind: 'uploaded'; fileName: string; extractedText: string }
  | null

export class JobAnalysisPersistenceError extends Error {
  readonly stage: 'resume' | 'analysis'
  readonly resumeIsSaved: boolean
  readonly originalError: unknown
  readonly savedResume: SavedResume | null

  constructor(
    message: string,
    stage: 'resume' | 'analysis',
    resumeIsSaved: boolean,
    originalError: unknown,
    savedResume: SavedResume | null,
  ) {
    super(message)
    this.name = 'JobAnalysisPersistenceError'
    this.stage = stage
    this.resumeIsSaved = resumeIsSaved
    this.originalError = originalError
    this.savedResume = savedResume
  }
}

type JobAnalysisWorkflowDependencies<TAnalysis> = {
  saveResume: (resume: NewSavedResume) => Promise<SavedResume>
  saveJobAnalysis: (
    userId: string,
    details: JobAnalysisDetails,
    resumeId: string | null,
  ) => Promise<TAnalysis>
}

function getResumeFileType(fileName: string): ResumeFileType {
  const fileType = fileName.split('.').pop()?.toLowerCase()
  if (fileType !== 'pdf' && fileType !== 'docx') {
    throw new Error('Only PDF and DOCX resumes can be saved.')
  }

  return fileType
}

export async function persistJobAnalysis<TAnalysis>(
  userId: string | null,
  details: JobAnalysisDetails,
  activeResume: ActiveResume,
  dependencies: JobAnalysisWorkflowDependencies<TAnalysis>,
): Promise<{ analysis: TAnalysis; savedResume: SavedResume | null }> {
  if (!userId) {
    throw new Error('Sign in to save a job analysis.')
  }

  let resumeId: string | null = null
  let resumeIsSaved = false
  let savedResumeForAnalysis: SavedResume | null = null

  if (activeResume?.kind === 'saved') {
    resumeId = activeResume.id
    resumeIsSaved = true
  } else if (activeResume?.kind === 'uploaded') {
    if (!activeResume.extractedText.trim()) {
      throw new JobAnalysisPersistenceError(
        'The uploaded resume has no readable text and was not saved.',
        'resume',
        false,
        null,
        null,
      )
    }

    if (activeResume.extractedText.length > 100_000) {
      throw new JobAnalysisPersistenceError(
        'The uploaded resume exceeds the 100,000 character limit and was not saved.',
        'resume',
        false,
        null,
        null,
      )
    }

    let savedResume: SavedResume
    try {
      const fileType = getResumeFileType(activeResume.fileName)
      savedResume = await dependencies.saveResume({
        user_id: userId,
        file_name: activeResume.fileName,
        display_name: activeResume.fileName,
        file_type: fileType,
        extracted_text: activeResume.extractedText,
      })
    } catch (error) {
      throw new JobAnalysisPersistenceError(
        'The uploaded resume could not be saved, so the job analysis was not saved.',
        'resume',
        false,
        error,
        null,
      )
    }

    resumeId = savedResume.id
    resumeIsSaved = true
    savedResumeForAnalysis = savedResume
  }

  try {
    const analysis = await dependencies.saveJobAnalysis(
      userId,
      details,
      resumeId,
    )
    return {
      analysis,
      savedResume: savedResumeForAnalysis,
    }
  } catch (error) {
    throw new JobAnalysisPersistenceError(
      'The job analysis could not be saved.',
      'analysis',
      resumeIsSaved,
      error,
      savedResumeForAnalysis,
    )
  }
}
