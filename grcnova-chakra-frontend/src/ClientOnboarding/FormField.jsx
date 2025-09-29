// components/FormField/FormField.jsx
import React from 'react';

const FormField = ({
  label,
  name,
  type,
  placeholder,
  register,
  errors,
  validation = {},
  required = false
}) => {
  return (
    <div className="form-field">
      <label className="form-label">
        {label}
        {required && <span className="required-indicator">*</span>}
      </label>
      <input
        {...register(name, validation)}
        type={type}
        className={`form-input ${errors[name] ? 'error' : ''}`}
        placeholder={placeholder}
      />
      {errors[name] && (
        <p className="form-error">{errors[name].message}</p>
      )}
    </div>
  );
};

export default FormField;