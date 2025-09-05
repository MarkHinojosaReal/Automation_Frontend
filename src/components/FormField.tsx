import React from "react"

interface FormFieldProps {
  label: string
  id: string
  required?: boolean
  error?: string
  children: React.ReactNode
}

export function FormField({ label, id, required = false, error, children }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <label 
        htmlFor={id} 
        className="block text-sm font-medium text-white/90"
      >
        {label}
        {required && <span className="text-accent-400 ml-1">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-red-400 text-sm font-medium">{error}</p>
      )}
    </div>
  )
}

interface TextInputProps {
  id: string
  name: string
  type?: string
  placeholder?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  required?: boolean
  disabled?: boolean
}

export function TextInput({ 
  id, 
  name, 
  type = "text", 
  placeholder, 
  value, 
  onChange, 
  required = false,
  disabled = false 
}: TextInputProps) {
  return (
    <input
      id={id}
      name={name}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      disabled={disabled}
      className="input-glass w-full text-white/90 placeholder-white/50 disabled:opacity-50 disabled:cursor-not-allowed"
    />
  )
}

interface TextAreaProps {
  id: string
  name: string
  placeholder?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  required?: boolean
  disabled?: boolean
  rows?: number
}

export function TextArea({ 
  id, 
  name, 
  placeholder, 
  value, 
  onChange, 
  required = false,
  disabled = false,
  rows = 4 
}: TextAreaProps) {
  return (
    <textarea
      id={id}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      disabled={disabled}
      rows={rows}
      className="input-glass w-full text-white/90 placeholder-white/50 disabled:opacity-50 disabled:cursor-not-allowed resize-none"
    />
  )
}

interface SelectProps {
  id: string
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  required?: boolean
  disabled?: boolean
  children: React.ReactNode
}

export function Select({ 
  id, 
  name, 
  value, 
  onChange, 
  required = false,
  disabled = false,
  children 
}: SelectProps) {
  return (
    <select
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      disabled={disabled}
      className="input-glass w-full text-white/90 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {children}
    </select>
  )
}
