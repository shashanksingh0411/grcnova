// pages/api/compliance/results/[policyId].js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  const { policyId } = req.query;
  
  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('check_results')
      .select(`
        *,
        compliance_checks (*)
      `)
      .eq('policy_id', policyId)
      .order('executed_at', { ascending: false });
    
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    
    return res.status(200).json(data);
  }
  
  res.setHeader('Allow', ['GET']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}