import { useCallback, useEffect, useState } from 'react'
import { supabase } from './supabase.js'

export function useVendors() {
  const [vendors, setVendors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refetch = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const { data, error } = await supabase.from('vendors').select('*').order('created_at', { ascending: false })
      if (error) throw error
      setVendors(data || [])
      setError(null)
    } catch (err) {
      console.error('Fetch vendors failed:', err)
      setError(err.message || 'Could not load vendors.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { refetch(true) }, [refetch])

  // Throws on failure so the caller can show a toast.
  const setStatus = useCallback(async (vendor, status) => {
    const { data, error } = await supabase.from('vendors').update({ status }).eq('id', vendor.id).select().single()
    if (error) throw error
    setVendors((vs) => vs.map((v) => (v.id === vendor.id ? data : v)))
    return data
  }, [])

  return { vendors, loading, error, refetch, setStatus }
}
