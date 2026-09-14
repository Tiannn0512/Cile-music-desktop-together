import { ref } from 'vue'

export const roomCode = ref<string | null>(null)

// 当前用户是否为房主
export const hostStatus = ref(false)

// 当前一起听人数（全局共享，面板重开后仍能显示真实人数）
export const onlineCount = ref(0)

export const setRoomCode = (code: string) => {
  roomCode.value = code
}

export const getRoomCode = () => {
  return roomCode.value
}

export const setOnlineCount = (count: number) => {
  onlineCount.value = count
}

export const clearRoom = () => {
  roomCode.value = null
  hostStatus.value = false
  onlineCount.value = 0
}

export const setHost = (value: boolean) => {
  hostStatus.value = value
}

export const isHost = () => {
  return hostStatus.value
}
