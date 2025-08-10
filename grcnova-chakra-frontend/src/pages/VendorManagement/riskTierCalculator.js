export function calculateRisk(vendor) {
  let score = 0;
  // Add your risk calculation logic
  return score >= 5 ? "High" : score >= 3 ? "Medium" : "Low";
}