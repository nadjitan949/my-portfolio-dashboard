// useNotification.ts
import { useContext } from 'react'
import { NotificationContext } from '../contexts/NotificationContext'

export function useNotification() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotification doit être utilisé dans un NotificationProvider')
  }
  return context
}