import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react'
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react'

export type NotificationType = 'success' | 'error' | 'warning' | 'info'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message?: string
  duration?: number
  persistent?: boolean
}

interface NotificationState {
  notifications: Notification[]
}

type NotificationAction =
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'CLEAR_ALL' }

const NotificationContext = createContext<{
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, 'id'>) => void
  removeNotification: (id: string) => void
  clearAll: () => void
} | null>(null)

const notificationReducer = (state: NotificationState, action: NotificationAction): NotificationState => {
  switch (action.type) {
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [...state.notifications, action.payload]
      }
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload)
      }
    case 'CLEAR_ALL':
      return {
        ...state,
        notifications: []
      }
    default:
      return state
  }
}

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(notificationReducer, { notifications: [] })

  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newNotification: Notification = {
      ...notification,
      id,
      duration: notification.duration ?? 5000
    }

    dispatch({ type: 'ADD_NOTIFICATION', payload: newNotification })

    // Auto-remove notification after duration (unless persistent)
    if (!notification.persistent && newNotification.duration > 0) {
      setTimeout(() => {
        dispatch({ type: 'REMOVE_NOTIFICATION', payload: id })
      }, newNotification.duration)
    }
  }, [])

  const removeNotification = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: id })
  }, [])

  const clearAll = useCallback(() => {
    dispatch({ type: 'CLEAR_ALL' })
  }, [])

  return (
    <NotificationContext.Provider
      value={{
        notifications: state.notifications,
        addNotification,
        removeNotification,
        clearAll
      }}
    >
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  )
}

const NotificationContainer: React.FC = () => {
  const context = useContext(NotificationContext)
  if (!context) return null

  const { notifications } = context

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
      {notifications.map((notification) => (
        <NotificationItem key={notification.id} notification={notification} />
      ))}
    </div>
  )
}

const NotificationItem: React.FC<{ notification: Notification }> = ({ notification }) => {
  const context = useContext(NotificationContext)
  if (!context) return null

  const { removeNotification } = context

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />
    }
  }

  const getColors = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
      case 'info':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
    }
  }

  return (
    <div
      className={`
        ${getColors()}
        border rounded-lg p-4 max-w-sm shadow-lg backdrop-blur-sm
        pointer-events-auto slide-in-right
        hover:shadow-xl transition-shadow duration-200
      `}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white">
            {notification.title}
          </h4>
          {notification.message && (
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              {notification.message}
            </p>
          )}
        </div>
        <button
          onClick={() => removeNotification(notification.id)}
          className="flex-shrink-0 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-150"
        >
          <X className="w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
        </button>
      </div>
    </div>
  )
}

// Hook for using notifications
export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider')
  }
  return context
}

// Convenience functions
export const useToast = () => {
  const { addNotification } = useNotifications()

  return {
    success: (title: string, message?: string, options?: Partial<Notification>) =>
      addNotification({ type: 'success', title, message, ...options }),

    error: (title: string, message?: string, options?: Partial<Notification>) =>
      addNotification({ type: 'error', title, message, persistent: true, ...options }),

    warning: (title: string, message?: string, options?: Partial<Notification>) =>
      addNotification({ type: 'warning', title, message, ...options }),

    info: (title: string, message?: string, options?: Partial<Notification>) =>
      addNotification({ type: 'info', title, message, ...options })
  }
}

