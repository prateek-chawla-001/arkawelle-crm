import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from './supabase.js'
import { useAuth } from './auth.jsx'

// One hook for all lead data: fetch, realtime sync, optimistic update, delete, role filtering.
export function useLeads() {
  const { user, can } = useAuth()
  const seeAll = can('seeAll')
  const [all, setAll] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [live, setLive] = useState(false)

  const fetchLeads = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const { data, error } = await supabase.from('leads').select('*').order('created_at', { ascending: false })
      if (error) throw error
      setAll(data || [])
      setError(null)
    } catch (err) {
      console.error('Fetch leads failed:', err)
      setError(err.message || 'Could not load leads.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLeads()
    // Realtime: any insert/update/delete on `leads` triggers a silent refetch.
    const channel = supabase
      .channel('leads-' + Math.random().toString(36).slice(2))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, () => fetchLeads(true))
      .subscribe((status) => setLive(status === 'SUBSCRIBED'))
    return () => { supabase.removeChannel(channel) }
  }, [fetchLeads])

  const leads = useMemo(
    () => (seeAll ? all : all.filter((l) => l.assigned_tech && l.assigned_tech === user?.tech)),
    [all, seeAll, user]
  )

  // Optimistic update with rollback. Throws on failure so the caller can show a toast.
  const updateLead = useCallback(async (lead, patch) => {
    const snapshot = all
    setAll((ls) => ls.map((l) => (l.id === lead.id ? { ...l, ...patch } : l)))
    try {
      const { data, error } = await supabase.from('leads').update(patch).eq('id', lead.id).select().single()
      if (error) throw error
      setAll((ls) => ls.map((l) => (l.id === lead.id ? data : l)))

      // ---- PHASE 1: n8n webhook trigger (mock) ----------------------------------
      // Fires only when a lead moves INTO "Site Survey Scheduled".
      // if (patch.status === 'Site Survey Scheduled' && lead.status !== 'Site Survey Scheduled') {
      //   fetch('https://YOUR-N8N-DOMAIN/webhook/site-survey-scheduled', {
      //     method: 'POST',
      //     headers: { 'Content-Type': 'application/json' },
      //     body: JSON.stringify({
      //       lead_id: data.id, customer_name: data.customer_name, phone: data.phone,
      //       email: data.email, city: data.city, address: data.address, assigned_tech: data.assigned_tech,
      //     }),
      //   }).catch((e) => console.error('n8n webhook failed:', e))
      // }
      // ---------------------------------------------------------------------------
      return data
    } catch (err) {
      console.error('Update lead failed:', err)
      setAll(snapshot)
      throw err
    }
  }, [all])

  const deleteLead = useCallback(async (lead) => {
    try {
      const { error } = await supabase.from('leads').delete().eq('id', lead.id)
      if (error) throw error
      setAll((ls) => ls.filter((l) => l.id !== lead.id))
    } catch (err) {
      console.error('Delete lead failed:', err)
      throw err
    }
  }, [])

  return { leads, loading, error, live, refetch: fetchLeads, updateLead, deleteLead }
}
