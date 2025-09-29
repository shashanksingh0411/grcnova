// pages/api/compliance/checks.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  // Get all compliance checks
  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('compliance_checks')
      .select('*');
    
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    
    return res.status(200).json(data);
  }
  
  // Create a new compliance check
  if (req.method === 'POST') {
    const { check_name, check_description, check_type, check_criteria, severity, policy_type } = req.body;
    
    const { data, error } = await supabase
      .from('compliance_checks')
      .insert([
        {
          check_name,
          check_description,
          check_type,
          check_criteria,
          severity,
          policy_type
        }
      ])
      .select();
    
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    
    return res.status(201).json(data[0]);
  }
  
  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}