// utils/complianceData.js
import { supabase } from '../supabase';

export const getFrameworkComplianceData = async (organizationId) => {
  try {
    // Simple query - no joins needed!
    const { data, error } = await supabase
      .from('control_implementations')
      .select('framework_name, status')
      .eq('organization_id', organizationId);

    if (error) {
      console.error('Error fetching compliance data:', error);
      throw error;
    }

    // If no data found, return empty array
    if (!data || data.length === 0) {
      console.log('No control implementations found for organization');
      return [];
    }

    console.log('Raw data from Supabase:', data);

    // Framework name mapping for consistent display names
    const frameworkDisplayMap = {
      'iso': 'ISO 27001',
      'iso27001': 'ISO 27001',
      'soc2': 'SOC 2',
      'soc 2': 'SOC 2',
      'hipaa': 'HIPAA',
      'gdpr': 'GDPR',
      'nist': 'NIST',
      'pci': 'PCI DSS',
      'pci dss': 'PCI DSS'
    };

    // Aggregate data by framework
    const frameworkStats = {};
    
    data.forEach(impl => {
      let frameworkName = impl.framework_name || 'Other';
      
      // Normalize and map to display names
      const normalizedKey = frameworkName.toLowerCase().trim();
      frameworkName = frameworkDisplayMap[normalizedKey] || frameworkName;

      // Capitalize first letter of each word for consistency
      frameworkName = frameworkName.replace(/\w\S*/g, (txt) => {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      });

      if (!frameworkStats[frameworkName]) {
        frameworkStats[frameworkName] = {
          total: 0,
          implemented: 0
        };
      }

      frameworkStats[frameworkName].total += 1;
      
      if (impl.status === 'implemented') {
        frameworkStats[frameworkName].implemented += 1;
      }
    });

    console.log('Aggregated framework stats:', frameworkStats);

    // Transform to array format with colors
    const frameworks = Object.entries(frameworkStats).map(([name, stats], index) => {
      const colors = [
        'rgba(59, 130, 246, 0.7)', // blue
        'rgba(16, 185, 129, 0.7)', // green
        'rgba(245, 158, 11, 0.7)', // yellow
        'rgba(239, 68, 68, 0.7)',  // red
        'rgba(139, 92, 246, 0.7)'  // purple
      ];
      
      return {
        name,
        total: stats.total,
        implemented: stats.implemented,
        color: colors[index % colors.length]
      };
    });

    return frameworks;
  } catch (error) {
    console.error('Error fetching compliance data:', error);
    return [];
  }
};