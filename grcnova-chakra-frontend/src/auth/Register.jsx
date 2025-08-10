import { supabase } from '../supabaseClient'; // Make sure this path is correct
import { useState } from 'react';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

 const handleRegister = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError(null);

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          // Add any additional profile data here
          username: email.split('@')[0] // Example
        }
      }
    });

    if (error) throw error;
    
    if (!data.user) {
      throw new Error('Signup failed - no user returned');
    }

    // Optional: Insert additional data to your public.users table
    const { error: profileError } = await supabase
      .from('users')
      .upsert({
        id: data.user.id,
        email: data.user.email,
        created_at: new Date().toISOString()
      });

    if (profileError) throw profileError;

    alert('Registration successful!');
    
  } catch (err) {
    console.error('Registration error:', err);
    setError(err.message);
  } finally {
    setLoading(false);
  }
};

  return (
    <div>
      <h2>Register</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleRegister}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
    </div>
  );
}