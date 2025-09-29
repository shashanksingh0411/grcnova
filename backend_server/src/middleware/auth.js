const jwt = require('jsonwebtoken');
const { supabase } = require('../../supabase');

const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from Supabase
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', decoded.userId)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

const authorizeOrganization = (req, res, next) => {
  const { organization_id } = req.params;
  
  if (req.user.organization_id !== organization_id) {
    return res.status(403).json({ error: 'Unauthorized access to organization data' });
  }
  
  next();
};

module.exports = { authenticate, authorizeOrganization };