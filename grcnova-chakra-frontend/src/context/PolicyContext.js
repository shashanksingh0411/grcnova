import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const PolicyContext = createContext()

export const PolicyProvider = ({ children }) => {
  const [policies, setPolicies] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0
  })
  const [filters, setFilters] = useState({
    status: '',
    framework: '',
    search: ''
  })

  const fetchPolicies = async () => {
    setLoading(true)
    try {
      const { page, limit } = pagination
      const { status, framework, search } = filters
      
      let query = supabase
        .from('policies')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1)

      if (status) query = query.eq('status', status)
      if (framework) query = query.eq('framework', framework)
      if (search) query = query.ilike('title', `%${search}%`)

      const { data, error, count } = await query

      if (error) throw error

      setPolicies(data)
      setPagination(prev => ({ ...prev, total: count }))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const createPolicy = async (policyData) => {
    try {
      const { data, error } = await supabase
        .from('policies')
        .insert([policyData])
        .select()
        .single()

      if (error) throw error

      setPolicies(prev => [data, ...prev])
      return data
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const updatePolicy = async (id, updates) => {
    try {
      const { data, error } = await supabase
        .from('policies')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      setPolicies(prev => 
        prev.map(policy => policy.id === id ? data : policy)
      )
      return data
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  useEffect(() => {
    fetchPolicies()
  }, [pagination.page, filters])

  return (
    <PolicyContext.Provider
      value={{
        policies,
        loading,
        error,
        pagination,
        filters,
        setPagination,
        setFilters,
        fetchPolicies,
        createPolicy,
        updatePolicy
      }}
    >
      {children}
    </PolicyContext.Provider>
  )
}

export const usePolicy = () => useContext(PolicyContext)