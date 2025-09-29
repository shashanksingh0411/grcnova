// Step1Standards.jsx
import { useState } from 'react';
import { supabase } from '../../lib/supabase';

const Step1Standards = ({ onNext }) => {
  const [standards, setStandards] = useState(['soc2', 'iso27001', 'gdpr']);
  const [selected, setSelected] = useState([]);

  return (
    <div>
      <h2>Select Standards</h2>
      {standards.map(standard => (
        <button
          key={standard}
          onClick={() => setSelected(prev => 
            prev.includes(standard) 
              ? prev.filter(s => s !== standard) 
              : [...prev, standard]
          )}
          className={selected.includes(standard) ? 'selected' : ''}
        >
          {standard.toUpperCase()}
        </button>
      ))}
      <button 
        onClick={() => onNext(selected)} 
        disabled={selected.length === 0}
      >
        Next
      </button>
    </div>
  );
};