type ResumeFingerprintStore<T> = {
  findByFingerprint: () => Promise<T | null>
  insert: () => Promise<T>
  isUniqueViolation: (error: unknown) => boolean
}

export async function findOrCreateResume<T>(
  store: ResumeFingerprintStore<T>,
): Promise<T> {
  const existingResume = await store.findByFingerprint()
  if (existingResume) {
    return existingResume
  }

  try {
    return await store.insert()
  } catch (error) {
    if (!store.isUniqueViolation(error)) {
      throw error
    }

    const concurrentlySavedResume = await store.findByFingerprint()
    if (concurrentlySavedResume) {
      return concurrentlySavedResume
    }

    throw error
  }
}
