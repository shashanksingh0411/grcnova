// services/scheduler.js
const cron = require('node-cron');
const PolicyMonitor = require('../policyMonitor');

const policyMonitor = new PolicyMonitor();

// Run every hour
cron.schedule('0 * * * *', () => {
  console.log('Running scheduled policy monitoring...');
  policyMonitor.monitorPolicyChanges();
});

// Run at midnight every day
cron.schedule('0 0 * * *', () => {
  console.log('Running daily compliance checks...');
  // Additional daily tasks can be added here
});

module.exports = policyMonitor;