/// <reference types="vite/client" />

declare global {
  interface Window {
    ipcRenderer?: {
      on(channel: string, func: (...args: any[]) => void): void
      off(channel: string, func: (...args: any[]) => void): void
      send(channel: string, ...args: any[]): void
      invoke(channel: string, ...args: any[]): Promise<any>
    }
    hideLoading?: () => void
  }
}

export {}