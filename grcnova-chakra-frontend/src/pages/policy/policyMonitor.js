// services/policyMonitor.js
const { createClient } = require('@supabase/supabase-js');
const natural = require('natural');
const { OpenAI } = require('openai');

// Initialize clients
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
const openai = new OpenAI(process.env.OPENAI_API_KEY);

class PolicyMonitor {
  constructor() {
    this.tokenizer = new natural.WordTokenizer();
    this.tfidf = new natural.TfIdf();
  }

  // Monitor for policy changes
  async monitorPolicyChanges() {
    console.log('Monitoring policy changes...');
    
    // Get all policies that need to be monitored
    const { data: policies, error } = await supabase
      .from('uploaded_policies')
      .select('*')
      .eq('monitoring_enabled', true);
    
    if (error) {
      console.error('Error fetching policies:', error);
      return;
    }
    
    for (const policy of policies) {
      try {
        // Check if policy document has been updated
        const { data: versions } = await supabase
          .from('policy_versions')
          .select('*')
          .eq('policy_id', policy.id)
          .order('created_at', { ascending: false })
          .limit(2);
        
        if (versions && versions.length > 1) {
          // Compare current version with previous version
          const currentVersion = versions[0];
          const previousVersion = versions[1];
          
          const changes = await this.detectChanges(
            previousVersion.content, 
            currentVersion.content
          );
          
          if (changes && changes.length > 0) {
            // Store changes and notify relevant users
            await this.recordPolicyChanges(policy.id, changes, currentVersion.id);
          }
        }
        
        // Run compliance checks
        await this.runComplianceChecks(policy);
      } catch (err) {
        console.error(`Error monitoring policy ${policy.id}:`, err);
      }
    }
  }

  // Detect changes between policy versions
  async detectChanges(oldText, newText) {
    try {
      // Use NLP to detect meaningful changes
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a compliance analyst. Compare these two policy documents and identify meaningful changes. Return a JSON array of changes with description and impact level (low, medium, high)."
          },
          {
            role: "user",
            content: `Compare these two policy versions:\n\nOLD VERSION:\n${oldText}\n\nNEW VERSION:\n${newText}`
          }
        ],
        max_tokens: 1000
      });
      
      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error('Error detecting changes with OpenAI:', error);
      
      // Fallback to simple text comparison
      return this.simpleTextComparison(oldText, newText);
    }
  }

  // Simple text comparison fallback
  simpleTextComparison(oldText, newText) {
    const changes = [];
    const oldLines = oldText.split('\n');
    const newLines = newText.split('\n');
    
    // Simple line-by-line comparison
    for (let i = 0; i < Math.max(oldLines.length, newLines.length); i++) {
      if (i >= oldLines.length) {
        changes.push({
          type: 'addition',
          description: `Added: ${newLines[i]}`,
          impact: 'medium'
        });
      } else if (i >= newLines.length) {
        changes.push({
          type: 'deletion',
          description: `Removed: ${oldLines[i]}`,
          impact: 'medium'
        });
      } else if (oldLines[i] !== newLines[i]) {
        changes.push({
          type: 'modification',
          description: `Changed: "${oldLines[i]}" to "${newLines[i]}"`,
          impact: 'medium'
        });
      }
    }
    
    return changes;
  }

  // Record policy changes
  async recordPolicyChanges(policyId, changes, versionId) {
    for (const change of changes) {
      const { error } = await supabase
        .from('policy_changes')
        .insert({
          policy_id: policyId,
          version_id: versionId,
          change_type: change.type,
          description: change.description,
          impact: change.impact,
          detected_at: new Date()
        });
      
      if (error) {
        console.error('Error recording policy change:', error);
      }
    }
    
    // Notify relevant users about significant changes
    if (changes.some(change => change.impact === 'high' || change.impact === 'critical')) {
      await this.notifyUsers(policyId, 'policy_change', changes);
    }
  }

  // Run compliance checks for a policy
  async runComplianceChecks(policy) {
    console.log(`Running compliance checks for policy ${policy.id}`);
    
    // Get all active compliance checks for this policy type
    const { data: checks, error } = await supabase
      .from('compliance_checks')
      .select('*')
      .eq('is_active', true)
      .eq('policy_type', policy.policy_type); // Assuming you have a policy_type field
    
    if (error) {
      console.error('Error fetching compliance checks:', error);
      return;
    }
    
    for (const check of checks) {
      try {
        let result;
        
        if (check.check_type === 'automated') {
          result = await this.runAutomatedCheck(policy, check);
        } else {
          // Manual checks need to be assigned to someone
          result = { status: 'pending', details: { message: 'Manual check required' } };
        }
        
        // Record the check result
        const { error: resultError } = await supabase
          .from('check_results')
          .insert({
            check_id: check.id,
            policy_id: policy.id,
            status: result.status,
            details: result.details,
            executed_at: new Date()
          });
        
        if (resultError) {
          console.error('Error recording check result:', resultError);
          continue;
        }
        
        // If check failed, create a violation
        if (result.status === 'fail') {
          await this.createViolation(policy.id, check.id, result.details);
        }
      } catch (err) {
        console.error(`Error running check ${check.id}:`, err);
        
        // Record the error
        await supabase
          .from('check_results')
          .insert({
            check_id: check.id,
            policy_id: policy.id,
            status: 'error',
            details: { error: err.message },
            executed_at: new Date()
          });
      }
    }
  }

  // Run an automated compliance check
  async runAutomatedCheck(policy, check) {
    // Get the policy content
    const { data: file } = await supabase.storage
      .from('policies')
      .download(policy.file_path);
    
    const policyText = await file.text();
    
    // Different types of checks can be implemented here
    switch (check.check_name) {
      case 'required_sections_check':
        return await this.checkRequiredSections(policyText, check.check_criteria);
      case 'keyword_check':
        return await this.checkKeywords(policyText, check.check_criteria);
      case 'ai_compliance_check':
        return await this.aiComplianceCheck(policyText, check.check_criteria);
      default:
        throw new Error(`Unknown check type: ${check.check_name}`);
    }
  }

  // Check if policy contains required sections
  async checkRequiredSections(policyText, criteria) {
    const missingSections = [];
    
    for (const section of criteria.required_sections) {
      if (!policyText.toLowerCase().includes(section.toLowerCase())) {
        missingSections.push(section);
      }
    }
    
    if (missingSections.length > 0) {
      return {
        status: 'fail',
        details: {
          message: `Missing required sections: ${missingSections.join(', ')}`,
          missing_sections: missingSections
        }
      };
    }
    
    return {
      status: 'pass',
      details: { message: 'All required sections present' }
    };
  }

  // Check for required keywords or phrases
  async checkKeywords(policyText, criteria) {
    const missingKeywords = [];
    
    for (const keyword of criteria.required_keywords) {
      if (!policyText.toLowerCase().includes(keyword.toLowerCase())) {
        missingKeywords.push(keyword);
      }
    }
    
    if (missingKeywords.length > 0) {
      return {
        status: 'fail',
        details: {
          message: `Missing required keywords: ${missingKeywords.join(', ')}`,
          missing_keywords: missingKeywords
        }
      };
    }
    
    return {
      status: 'pass',
      details: { message: 'All required keywords present' }
    };
  }

  // AI-powered compliance check
  async aiComplianceCheck(policyText, criteria) {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are a compliance officer checking if a policy meets these criteria: ${JSON.stringify(criteria)}. Return a JSON response with {compliance_status: "pass" or "fail", issues: []}`
          },
          {
            role: "user",
            content: `Evaluate this policy:\n\n${policyText}`
          }
        ],
        max_tokens: 1000
      });
      
      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error('Error with AI compliance check:', error);
      return {
        status: 'error',
        details: { error: error.message }
      };
    }
  }

  // Create a violation
  async createViolation(policyId, checkId, details) {
    const { data: check } = await supabase
      .from('compliance_checks')
      .select('*')
      .eq('id', checkId)
      .single();
    
    const { error } = await supabase
      .from('violations')
      .insert({
        policy_id: policyId,
        check_id: checkId,
        description: details.message || `Compliance violation detected for check: ${check.check_name}`,
        severity: check.severity || 'medium',
        status: 'open'
      });
    
    if (error) {
      console.error('Error creating violation:', error);
      return;
    }
    
    // Notify relevant users about the violation
    await this.notifyUsers(policyId, 'violation', {
      check_name: check.check_name,
      details: details
    });
  }

  // Notify users about policy events
  async notifyUsers(policyId, eventType, data) {
    // Get users who should be notified about this policy
    const { data: subscribers } = await supabase
      .from('policy_subscriptions')
      .select('user_id')
      .eq('policy_id', policyId);
    
    if (!subscribers || subscribers.length === 0) return;
    
    let title, message;
    
    if (eventType === 'policy_change') {
      title = 'Policy Changes Detected';
      message = `Significant changes detected in policy ${policyId}. ${data.length} changes found.`;
    } else if (eventType === 'violation') {
      title = 'Compliance Violation Detected';
      message = `Violation detected: ${data.check_name}. ${data.details.message}`;
    }
    
    // Create notifications for all subscribers
    for (const subscriber of subscribers) {
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: subscriber.user_id,
          title: title,
          message: message,
          type: eventType === 'violation' ? 'error' : 'warning',
          related_type: eventType,
          related_id: policyId
        });
      
      if (error) {
        console.error('Error creating notification:', error);
      }
    }
    
    // TODO: Add email notifications here if needed
  }
}

export default PolicyMonitor;