import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  JobAnalysisPersistenceError,
  persistJobAnalysis,
} from '../src/services/jobAnalysisWorkflow.ts'

const details = {
  jobTitle: 'Designer',
  companyName: 'Northstar',
  jobDescription: 'Design thoughtful products.',
}

function savedResume(overrides = {}) {
  return {
    id: 'resume-1',
    user_id: 'user-1',
    file_name: 'resume.pdf',
    display_name: 'resume.pdf',
    file_type: 'pdf',
    extracted_text: 'Resume text',
    content_fingerprint: 'a'.repeat(64),
    created_at: '2026-11-02T00:00:00.000Z',
    updated_at: '2026-11-02T00:00:00.000Z',
    ...overrides,
  }
}

test('new uploaded resume is saved first and its ID is linked to the job', async () => {
  const calls = []
  let insertedResume
  let linkedResumeId

  const result = await persistJobAnalysis(
    'user-1',
    details,
    {
      kind: 'uploaded',
      fileName: 'resume.pdf',
      extractedText: 'Parsed resume text',
    },
    {
      saveResume: async (resume) => {
        calls.push('resume')
        insertedResume = resume
        return savedResume()
      },
      saveJobAnalysis: async (_userId, _details, resumeId) => {
        calls.push('analysis')
        linkedResumeId = resumeId
        return { id: 'analysis-1' }
      },
    },
  )

  assert.deepEqual(calls, ['resume', 'analysis'])
  assert.deepEqual(insertedResume, {
    user_id: 'user-1',
    file_name: 'resume.pdf',
    display_name: 'resume.pdf',
    file_type: 'pdf',
    extracted_text: 'Parsed resume text',
  })
  assert.equal(linkedResumeId, 'resume-1')
  assert.equal(result.analysis.id, 'analysis-1')
  assert.equal(result.savedResume?.id, 'resume-1')
})

test('a selected saved resume is reused without creating another record', async () => {
  let linkedResumeId

  const result = await persistJobAnalysis(
    'user-1',
    details,
    { kind: 'saved', id: 'existing-resume-id' },
    {
      saveResume: async () => {
        assert.fail('A selected saved resume must not be inserted again.')
      },
      saveJobAnalysis: async (_userId, _details, resumeId) => {
        linkedResumeId = resumeId
        return { id: 'analysis-1' }
      },
    },
  )

  assert.equal(linkedResumeId, 'existing-resume-id')
  assert.equal(result.savedResume, null)
})

test('guest uploads do not call resume or job persistence', async () => {
  const calls = []

  await assert.rejects(
    persistJobAnalysis(
      null,
      details,
      {
        kind: 'uploaded',
        fileName: 'resume.pdf',
        extractedText: 'Guest resume text',
      },
      {
        saveResume: async () => {
          calls.push('resume')
          return savedResume()
        },
        saveJobAnalysis: async () => {
          calls.push('analysis')
          return { id: 'analysis-1' }
        },
      },
    ),
    /Sign in to save a job analysis/,
  )

  assert.deepEqual(calls, [])
})

test('resume save failure prevents an unlinked job analysis insert', async () => {
  const calls = []
  const resumeError = new Error('Resume insert failed')

  await assert.rejects(
    persistJobAnalysis(
      'user-1',
      details,
      {
        kind: 'uploaded',
        fileName: 'resume.pdf',
        extractedText: 'Parsed resume text',
      },
      {
        saveResume: async () => {
          calls.push('resume')
          throw resumeError
        },
        saveJobAnalysis: async () => {
          calls.push('analysis')
          return { id: 'analysis-1' }
        },
      },
    ),
    (error) =>
      error instanceof JobAnalysisPersistenceError &&
      error.stage === 'resume' &&
      !error.resumeIsSaved &&
      error.originalError === resumeError,
  )

  assert.deepEqual(calls, ['resume'])
})

test('job analysis failure reports that its resume was saved', async () => {
  const resume = savedResume()
  const analysisError = new Error('Job insert failed')
  let linkedResumeId

  await assert.rejects(
    persistJobAnalysis(
      'user-1',
      details,
      {
        kind: 'uploaded',
        fileName: 'resume.pdf',
        extractedText: 'Parsed resume text',
      },
      {
        saveResume: async () => resume,
        saveJobAnalysis: async (_userId, _details, resumeId) => {
          linkedResumeId = resumeId
          throw analysisError
        },
      },
    ),
    (error) =>
      error instanceof JobAnalysisPersistenceError &&
      error.stage === 'analysis' &&
      error.resumeIsSaved &&
      error.savedResume === resume &&
      error.originalError === analysisError,
  )

  assert.equal(linkedResumeId, resume.id)
})
