// NotificationContext.ts
import { createContext } from 'react'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
}

export interface ConfirmDialog {
  id: string
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'danger' | 'warning' | 'info'
  onConfirm: () => void
  onCancel?: () => void
}

export interface NotificationContextType {
  toasts: Toast[]
  confirms: ConfirmDialog[]
  addToast: (type: ToastType, title: string, message?: string, duration?: number) => void
  removeToast: (id: string) => void
  showConfirm: (title: string, message: string, onConfirm: () => void, options?: Partial<Omit<ConfirmDialog, 'id' | 'title' | 'message' | 'onConfirm'>>) => void
  removeConfirm: (id: string) => void
}

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined)