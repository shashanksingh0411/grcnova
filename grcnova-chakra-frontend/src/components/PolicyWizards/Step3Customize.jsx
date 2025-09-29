// Step3Customize.jsx
import { useState } from 'react';

const Step3Customize = ({ templateId, onComplete }) => {
  const [values, setValues] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    onComplete(values);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Customize Template</h2>
      {template.variables.map(variable => (
        <div key={variable.key}>
          <label>{variable.key}</label>
          <input
            type="text"
            value={values[variable.key] || variable.defaultValue}
            onChange={(e) => 
              setValues(prev => ({
                ...prev,
                [variable.key]: e.target.value
              }))
            }
          />
        </div>
      ))}
      <button type="submit">Generate Policy</button>
    </form>
  );
};