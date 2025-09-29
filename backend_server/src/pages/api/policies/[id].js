// pages/api/policies/[id].js
import { supabase } from '../../supabase'

export default async function handler(req, res) {
  const { id } = req.query

  switch (req.method) {
    case 'GET':
      return getPolicy(req, res, id)
    case 'PUT':
      return updatePolicy(req, res, id)
    case 'DELETE':
      return deletePolicy(req, res, id)
    default:
      return res.status(405).json({ error: 'Method not allowed' })
  }
}

async function getPolicy(req, res, id) {
  try {
    const { data, error } = await supabase
      .from('uploaded_policies')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    res.status(200).json(data)
  } catch (error) {
    res.status(404).json({ error: 'Policy not found' })
  }
}

async function updatePolicy(req, res, id) {
  try {
    const policyData = req.body
    const { data, error } = await supabase
      .from('uploaded_policies')
      .update(policyData)
      .eq('id', id)
      .select()

    if (error) throw error
    res.status(200).json(data[0])
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

async function deletePolicy(req, res, id) {
  try {
    const { error } = await supabase
      .from('uploaded_policies')
      .delete()
      .eq('id', id)

    if (error) throw error
    res.status(204).end()
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}