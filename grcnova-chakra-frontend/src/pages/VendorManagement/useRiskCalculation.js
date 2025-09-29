import { useState, useMemo } from 'react';

export const useRiskCalculation = (formData) => {
  const [riskTier, setRiskTier] = useState('Low');
  const [riskScore, setRiskScore] = useState(0);

  useMemo(() => {
    if (!formData) {
      setRiskTier('Low');
      setRiskScore(0);
      return;
    }

    let score = 0;
    
    // Financial Health Scoring (0-30 points)
    if (formData.profitableLastTwoYears === 'no') score += 15;
    if (formData.provideFinancialStatements === 'no') score += 10;
    if (formData.provideFinancialStatements === 'uponRequest') score += 5;
    if (formData.restructuringInfo) score += 5;

    // Security & Data Privacy Scoring (0-40 points)
    if (formData.hasSecurityPolicy === 'no') score += 20;
    if (!formData.securityAudits) score += 10;
    if (formData.hasBCP === 'no') score += 10;

    // Operational & Quality Management (0-15 points)
    if (formData.hasQualityManagement === 'no') score += 10;
    if (!formData.kpis) score += 5;

    // Legal & Compliance (0-15 points)
    if (formData.hasCodeOfConduct === 'no') score += 10;
    if (formData.willingToSignAgreement === 'no') score += 15;
    if (formData.willingToSignAgreement === 'withModifications') score += 5;

    // Cap the score at 100
    score = Math.min(score, 100);
    setRiskScore(score);

    // Determine risk tier based on score
    if (score >= 80) {
      setRiskTier('Critical');
    } else if (score >= 60) {
      setRiskTier('High');
    } else if (score >= 40) {
      setRiskTier('Medium');
    } else {
      setRiskTier('Low');
    }
  }, [formData]);

  return {
    riskTier,
    riskScore,
    isLoading: !formData
  };
};