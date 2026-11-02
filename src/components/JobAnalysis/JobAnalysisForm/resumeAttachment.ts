import type { ResumeExtractionStatus } from '../ResumeUpload/ResumeUpload'

type ResumeFile = Pick<File, 'name'>
type SavedResumeFile = {
  file_name: string
  file_type: string
}

export type ResumeAttachment = {
  fileName: string
  fileType: string
}

export function getResumeAttachment(
  file: ResumeFile | null,
  savedResume: SavedResumeFile | null,
  extractionStatus: ResumeExtractionStatus,
): ResumeAttachment | null {
  if (extractionStatus !== 'success') {
    return null
  }

  if (savedResume) {
    return {
      fileName: savedResume.file_name,
      fileType: savedResume.file_type.toUpperCase(),
    }
  }

  if (!file) {
    return null
  }

  return {
    fileName: file.name,
    fileType: file.name.split('.').pop()?.toUpperCase() ?? '',
  }
}
