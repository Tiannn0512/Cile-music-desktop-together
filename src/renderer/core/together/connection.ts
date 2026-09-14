import { ref } from 'vue'

export type TogetherConnectionStatus =
  | 'disconnected'
  | 'connecting'
  | 'connected'

export const connectionStatus = ref<TogetherConnectionStatus>('disconnected')

export const setConnectionStatus = (value: TogetherConnectionStatus) => {
  connectionStatus.value = value
}

export const getConnectionStatus = () => {
  return connectionStatus.value
}
