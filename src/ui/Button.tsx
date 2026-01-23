// components/Button.tsx
import { type ReactNode } from 'react'
import type { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  className?: string
}

function Button({ children, className = '', ...props }: ButtonProps) {
  return (
    <button
      className={` cursor-pointer ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button
