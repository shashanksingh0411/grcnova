import { useState, useEffect } from 'react';
import { message } from 'antd';
import { calculateRisk } from './riskTierCalculator';

export default function useRiskCalculation() {
  const [riskData, setRiskData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Calculate risk scores and prepare dashboard data
  const calculateRiskData = async () => {
    try {
      setLoading(true);
      // In a real app, this would fetch from your API:
      // const vendors = await api.get('/vendors');
      
      // Mock data - should match your actual vendor data structure
      const mockVendors = [
        { id: 1, name: 'Cloud Hosting Inc', lastAssessment: '2023-05-15', handlesPII: true },
        { id: 2, name: 'Data Analytics Co', lastAssessment: '2023-06-20', businessCritical: true },
        { id: 3, name: 'Email Service Ltd', lastAssessment: '2023-04-10', hasISO27001: true }
      ];

      const calculatedData = mockVendors.map(vendor => {
        const riskLevel = calculateRisk(vendor);
        return {
          ...vendor,
          riskLevel,
          riskScore: getRiskScore(riskLevel),
          lastUpdated: new Date().toISOString()
        };
      });

      setRiskData(calculatedData);
    } catch (error) {
      message.error('Failed to calculate risk data');
      console.error('Risk calculation error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Convert risk level to numerical score for visualization
  const getRiskScore = (riskLevel) => {
    const scores = { High: 3, Medium: 2, Low: 1 };
    return scores[riskLevel] || 0;
  };

  useEffect(() => {
    calculateRiskData();
  }, []);

  return {
    riskData,
    loading,
    refresh: calculateRiskData
  };
}