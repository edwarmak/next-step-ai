import assert from 'node:assert/strict'
import { test } from 'node:test'
import { getResumeAttachment } from '../src/components/JobAnalysis/JobAnalysisForm/resumeAttachment.ts'

test('successfully parsed uploads use the attached resume card details', () => {
  assert.deepEqual(
    getResumeAttachment({ name: 'portfolio.docx' }, null, 'success'),
    { fileName: 'portfolio.docx', fileType: 'DOCX' },
  )
})

test('selected saved resumes use the same attached resume card details', () => {
  assert.deepEqual(
    getResumeAttachment(null, {
      file_name: 'resume.pdf',
      file_type: 'pdf',
    }, 'success'),
    { fileName: 'resume.pdf', fileType: 'PDF' },
  )
})

test('a resume is not marked attached while parsing or after a parsing failure', () => {
  const file = { name: 'resume.pdf' }

  assert.equal(getResumeAttachment(file, null, 'loading'), null)
  assert.equal(getResumeAttachment(file, null, 'error'), null)
})
