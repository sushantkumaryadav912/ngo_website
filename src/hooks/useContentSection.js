import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { contentAPI } from '../services/api'

const normalizeResponse = (response) => {
  if (!response) return []
  if (Array.isArray(response)) return response
  if (Array.isArray(response.data)) return response.data
  if (Array.isArray(response?.data?.data)) return response.data.data
  return []
}

const getInitialState = (select, defaultValue) => {
  if (select === 'all') {
    if (Array.isArray(defaultValue)) return defaultValue
    return []
  }

  return defaultValue ?? null
}

export const useContentSection = (
  type,
  {
    enabled = true,
    defaultValue = null,
    select = 'first',
    transform,
  } = {}
) => {
  const [data, setData] = useState(getInitialState(select, defaultValue))
  const [loading, setLoading] = useState(Boolean(enabled))
  const [error, setError] = useState(null)
  const isMountedRef = useRef(true)

  const memoizedDefault = useMemo(() => getInitialState(select, defaultValue), [select, defaultValue])

  const pickRecords = useCallback(
    (records) => {
      if (select === 'all') {
        return Array.isArray(records) ? records : memoizedDefault
      }
      return records?.at(0) ?? memoizedDefault
    },
    [select, memoizedDefault]
  )

  const applyResult = useCallback(
    (updater) => {
      if (!isMountedRef.current) return
      updater()
    },
    []
  )

  const fetchContent = useCallback(async (options = {}) => {
    const { silent = false } = options
    applyResult(() => {
      if (!silent) setLoading(true)
      setError(null)
    })

    try {
      const response = await contentAPI.getByType(type)
      const records = normalizeResponse(response)
      const picked = pickRecords(records)
      applyResult(() => {
        setData(transform ? transform(picked) : picked)
      })
    } catch (err) {
      applyResult(() => {
        setError(err)
        setData(transform ? transform(memoizedDefault) : memoizedDefault)
      })
    } finally {
      applyResult(() => {
        setLoading(false)
      })
    }
  }, [type, transform, pickRecords, memoizedDefault, applyResult])

  useEffect(() => {
    isMountedRef.current = true

    if (!enabled) {
      setLoading(false)
      return
    }

    fetchContent()

    return () => {
      isMountedRef.current = false
    }
  }, [enabled, fetchContent])

  return { data, loading, error, refetch: fetchContent }
}

export default useContentSection