import { useState, useEffect } from 'react';
import { message } from 'antd';
import { calculateRisk } from './riskTierCalculator';

export default function useVendorData() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Mock API call - replace with actual API implementation
  const fetchVendors = async () => {
    try {
      setLoading(true);
      // In a real app, this would be an API call:
      // const response = await api.get('/vendors', { params: { search: searchTerm } });
      
      // Mock data
      const mockVendors = [
        { id: 1, name: 'Cloud Hosting Inc', serviceType: 'Infrastructure', handlesPII: true, hasSOC2: true },
        { id: 2, name: 'Data Analytics Co', serviceType: 'Analytics', handlesPHI: true, businessCritical: true },
        { id: 3, name: 'Email Service Ltd', serviceType: 'Communication', hasISO27001: true }
      ];

      // Filter by search term
      const filtered = mockVendors.filter(v => 
        v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.serviceType.toLowerCase().includes(searchTerm.toLowerCase())
      );

      // Add risk tier calculation
      const withRisk = filtered.map(vendor => ({
        ...vendor,
        riskLevel: calculateRisk(vendor)
      }));

      setVendors(withRisk);
    } catch (error) {
      message.error('Failed to load vendors');
      console.error('Error fetching vendors:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, [searchTerm]);

  const handleSearch = (value) => {
    setSearchTerm(value);
  };

  return {
    vendors,
    loading,
    handleSearch,
    refresh: fetchVendors
  };
}