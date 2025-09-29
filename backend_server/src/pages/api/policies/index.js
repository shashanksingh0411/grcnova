// pages/api/policies/index.js
import { supabase } from '../../supabase'

export default async function handler(req, res) {
  switch (req.method) {
    case 'GET':
      return getPolicies(req, res)
    case 'POST':
      return createPolicy(req, res)
    default:
      return res.status(405).json({ error: 'Method not allowed' })
  }
}

async function getPolicies(req, res) {
  try {
    const { data, error } = await supabase
      .from('uploaded_policies')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    res.status(200).json(data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

async function createPolicy(req, res) {
  try {
    const policyData = req.body
    const { data, error } = await supabase
      .from('uploaded_policies')
      .insert([policyData])
      .select()

    if (error) throw error
    res.status(201).json(data[0])
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}