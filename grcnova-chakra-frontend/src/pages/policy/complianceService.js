import { supabase } from '../supabaseClient';

// Initialize framework data for an organization
export const initializeFrameworkData = async (organizationId, frameworkId) => {
  try {
    // Get the framework data
    const framework = frameworks[frameworkId];
    if (!framework) {
      throw new Error(`Framework ${frameworkId} not found`);
    }

    // Initialize stats
    const totalControls = framework.categories.reduce(
      (acc, category) => acc + (category.controls?.length || 0), 0
    );

    const { data: stats, error: statsError } = await supabase
      .from('framework_stats')
      .upsert({
        organization_id: organizationId,
        framework: frameworkId,
        implemented: 0,
        in_progress: 0,
        not_started: totalControls,
        last_audit: null
      }, { onConflict: 'organization_id,framework' });

    if (statsError) throw statsError;

    return { success: true };
  } catch (error) {
    console.error('Error initializing framework data:', error);
    return { success: false, error: error.message };
  }
};

// Get framework statistics
export const getFrameworkStats = async (organizationId, frameworkId) => {
  try {
    const { data, error } = await supabase
      .from('framework_stats')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('framework', frameworkId)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "not found"

    // If no stats exist, initialize them
    if (!data) {
      await initializeFrameworkData(organizationId, frameworkId);
      // Try fetching again
      const { data: newData, error: newError } = await supabase
        .from('framework_stats')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('framework', frameworkId)
        .single();

      if (newError) throw newError;
      return newData;
    }

    return data;
  } catch (error) {
    console.error('Error getting framework stats:', error);
    throw error;
  }
};

// Update framework statistics
export const updateFrameworkStats = async (organizationId, frameworkId, updates) => {
  try {
    const { data, error } = await supabase
      .from('framework_stats')
      .update(updates)
      .eq('organization_id', organizationId)
      .eq('framework', frameworkId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating framework stats:', error);
    throw error;
  }
};

// Get evidence for a control
export const getEvidenceForControl = async (organizationId, frameworkId, controlId) => {
  try {
    const { data, error } = await supabase
      .from('evidence')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('framework', frameworkId)
      .eq('control_id', controlId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting evidence:', error);
    throw error;
  }
};

// Upload evidence for a control
export const uploadEvidence = async (organizationId, frameworkId, controlId, file, notes, uploadedBy) => {
  try {
    // Upload file to storage
    const filePath = `${organizationId}/evidence/${controlId}/${Date.now()}_${file.name}`;
    
    const { error: uploadError } = await supabase.storage
      .from('compliance-evidence')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) throw uploadError;

    // Save evidence record to database
    const { data, error: dbError } = await supabase
      .from('evidence')
      .insert({
        control_id: controlId,
        framework: frameworkId,
        file_path: filePath,
        organization_id: organizationId,
        uploaded_by: uploadedBy,
        notes: notes
      })
      .select()
      .single();

    if (dbError) throw dbError;

    return data;
  } catch (error) {
    console.error('Error uploading evidence:', error);
    throw error;
  }
};

// Delete evidence
export const deleteEvidence = async (evidenceId) => {
  try {
    // First get the evidence record to get the file path
    const { data: evidence, error: fetchError } = await supabase
      .from('evidence')
      .select('file_path')
      .eq('id', evidenceId)
      .single();

    if (fetchError) throw fetchError;

    // Delete the file from storage
    const { error: storageError } = await supabase.storage
      .from('compliance-evidence')
      .remove([evidence.file_path]);

    if (storageError) throw storageError;

    // Delete the evidence record
    const { error: dbError } = await supabase
      .from('evidence')
      .delete()
      .eq('id', evidenceId);

    if (dbError) throw dbError;

    return { success: true };
  } catch (error) {
    console.error('Error deleting evidence:', error);
    throw error;
  }
};

// Get team members for an organization
export const getTeamMembers = async (organizationId) => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('id, name, email, role, avatar_url')
      .eq('organization_id', organizationId)
      .in('role', ['compliance_manager', 'security_analyst', 'auditor', 'admin'])
      .order('name');

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting team members:', error);
    throw error;
  }
};

// Update control implementation status
export const updateControlStatus = async (organizationId, frameworkId, controlId, status) => {
  try {
    // First get current stats
    const currentStats = await getFrameworkStats(organizationId, frameworkId);
    
    let updates = {};
    
    // Decrement the current status count
    if (currentStats[status] > 0) {
      updates[status] = currentStats[status] - 1;
    }
    
    // Increment the new status count
    updates[status] = (updates[status] || 0) + 1;
    
    // Update the stats
    return await updateFrameworkStats(organizationId, frameworkId, updates);
  } catch (error) {
    console.error('Error updating control status:', error);
    throw error;
  }
};

// Get download URL for evidence file
export const getEvidenceDownloadUrl = async (filePath) => {
  try {
    const { data, error } = await supabase.storage
      .from('compliance-evidence')
      .createSignedUrl(filePath, 60); // URL expires in 60 seconds

    if (error) throw error;
    return data.signedUrl;
  } catch (error) {
    console.error('Error getting download URL:', error);
    throw error;
  }
};