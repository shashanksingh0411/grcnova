// Step2Templates.jsx
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

const Step2Templates = ({ standards, onNext }) => {
  const [templates, setTemplates] = useState([]);
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    const fetchTemplates = async () => {
      const { data, error } = await supabase
        .from('policy_templates')
        .select('*')
        .in('standard', standards);

      if (error) console.error(error);
      else setTemplates(data);
    };

    fetchTemplates();
  }, [standards]);

  return (
    <div>
      <h2>Select Templates</h2>
      {templates.map(template => (
        <div key={template.id}>
          <input
            type="checkbox"
            checked={selected.includes(template.id)}
            onChange={() => setSelected(prev => 
              prev.includes(template.id) 
                ? prev.filter(id => id !== template.id) 
                : [...prev, template.id]
            )}
          />
          <label>{template.name}</label>
        </div>
      ))}
      <button onClick={() => onNext(selected)}>Next</button>
    </div>
  );
};