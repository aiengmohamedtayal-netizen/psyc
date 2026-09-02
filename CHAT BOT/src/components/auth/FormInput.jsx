import React from 'react'

const labelStyle = {
  display: 'block',
  fontSize: '0.82rem',
  color: 'var(--text-muted, #c4bebb)',
  marginBottom: '5px',
}

const inputStyle = {
  width: '100%',
  padding: '9px 12px',
  background: 'var(--bg-main, #1f1e1d)',
  border: '1px solid var(--border-color, #383531)',
  borderRadius: '7px',
  color: '#fff',
  fontSize: '0.88rem',
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
}

export default function FormInput({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  required = false,
  autoFocus = false,
  id,
}) {
  return (
    <div>
      {label && (
        <label htmlFor={id} style={labelStyle}>
          {label}
        </label>
      )}
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        autoFocus={autoFocus}
        style={inputStyle}
      />
    </div>
  )
}
