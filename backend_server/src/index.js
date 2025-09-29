require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createServer } = require('http');
const { supabase } = require('../supabase');
const authRoutes = require('./routes/auth');
const orgRoutes = require('./routes/organizations');
const policyRoutes = require('./routes/policies');
const evidenceRoutes = require('./routes/evidence');
const riskRoutes = require('./routes/risks');
const vendorRoutes = require('./routes/vendors');
const controlRoutes = require('./routes/controls');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/organizations', orgRoutes);
app.use('/api/policies', policyRoutes);
app.use('/api/evidence', evidenceRoutes);
app.use('/api/risks', riskRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/controls', controlRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

const server = createServer(app);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});