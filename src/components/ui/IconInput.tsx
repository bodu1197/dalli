'use client'

import type { FC, ReactNode, InputHTMLAttributes } from 'react'

interface IconInputProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string
  label: string
  icon: ReactNode
  error?: string
}

export const IconInput: FC<IconInputProps> = ({ id, label, icon, error, ...props }) => {
  return (
    <div>
      <label htmlFor={id} style={{
        display: 'block',
        fontSize: '13px',
        fontWeight: 600,
        marginBottom: '8px',
        color: 'var(--color-gray-700)'
      }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <div style={{
          position: 'absolute',
          left: '12px',
          top: '50%',
          transform: 'translateY(-50%)',
          color: 'var(--color-gray-400)',
          display: 'flex',
          alignItems: 'center'
        }}>
          {icon}
        </div>
        <input
          id={id}
          {...props}
          style={{
            width: '100%',
            padding: '12px 12px 12px 42px',
            border: `1px solid ${error ? 'var(--color-error-500)' : 'var(--color-gray-200)'}`,
            borderRadius: '8px',
            fontSize: '14px',
            ...props.style
          }}
        />
      </div>
      {error && (
        <p style={{ marginTop: '6px', fontSize: '12px', color: 'var(--color-error-500)' }}>
          {error}
        </p>
      )}
    </div>
  )
}
