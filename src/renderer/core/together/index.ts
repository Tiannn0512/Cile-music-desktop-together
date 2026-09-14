import {
  connectWebSocket,
  createRoom,
  joinRoom,
  leaveRoom,
  onReconnected,
} from './websocket'

import {
  setRoomCode,
  setHost,
  isHost,
  getRoomCode,
  clearRoom,
  setOnlineCount,
} from './room'

import {
  handleTogetherMessage,
} from './controller'

import {
  createMusicChangeMessage,
  createPlayMessage,
  createPauseMessage,
  createProgressMessage,
} from './sync'

import {
  sendMessage,
  registerReceiver,
} from './transport'

import {
  getRemoteAction,
  setTogetherEnabled,
} from './status'

import type {
  TogetherMessage,
} from './types'

// 一起听服务器地址
const SERVER_URL = 'wss://together-server-sxyr.onrender.com'

// 房主进度同步心跳间隔
const PROGRESS_SYNC_INTERVAL = 2000

// 一起听 UI 事件名（TogetherPanel 监听）
export const TOGETHER_ROOM_CLOSED_EVENT = 'togetherRoomClosed'

let initialized = false

let progressTimer: ReturnType<typeof setInterval> | null = null

// 通知UI房间关闭
const notifyRoomClosed = (message?: string) => {
  window.dispatchEvent(new CustomEvent(TOGETHER_ROOM_CLOSED_EVENT, { detail: message }))
}

const startTogetherProgressSync = () => {
  if (progressTimer) return

  progressTimer = setInterval(() => {
    if (!isHost() || !getRoomCode() || getRemoteAction()) return

    sendMessage(createProgressMessage())
  }, PROGRESS_SYNC_INTERVAL)
}

export const stopTogetherProgressSync = () => {
  if (progressTimer) {
    clearInterval(progressTimer)
    progressTimer = null
  }
}

// 房间失效（服务端关闭/主动退出/断线重连后失效）时的统一清理
const handleRoomClosed = (message?: string) => {
  clearRoom()
  stopTogetherProgressSync()
  setTogetherEnabled(false)
  setOnlineCount(0)
  notifyRoomClosed(message)
}

// 房主广播播放事件（远程操作期间忽略本地事件，避免回环）
const broadcastHostEvent = (create: () => TogetherMessage | null) => {
  if (!isHost() || !getRoomCode() || getRemoteAction()) return

  const message = create()
  if (message) sendMessage(message)
}

export const initTogether = () => {
  if (initialized) return

  initialized = true

  connectWebSocket(SERVER_URL)

  // 断线重连成功后，本地若仍残留房间状态（服务端房间已随旧连接消失），统一清理
  onReconnected(() => {
    if (getRoomCode()) {
      handleRoomClosed('网络连接中断，房间已失效，请重新创建或加入')
    }
  })

  registerReceiver((message: TogetherMessage) => {
    switch (message.type) {
      case 'roomCreated':
        setRoomCode(message.roomCode)
        setHost(true)
        setTogetherEnabled(true)
        setOnlineCount(message.onlineCount ?? 0)
        startTogetherProgressSync()
        break

      case 'roomJoined':
        setRoomCode(message.roomCode)
        setHost(false)
        setTogetherEnabled(true)
        setOnlineCount(message.onlineCount ?? 0)
        stopTogetherProgressSync()
        break

      case 'userJoined':
      case 'userLeft':
        setOnlineCount(message.onlineCount ?? 0)
        break

      case 'roomClosed':
        handleRoomClosed(message.message)
        break

      case 'roomError':
        console.error('一起听房间错误:', message.message)
        break

      // 播放同步消息
      default:
        handleTogetherMessage(message)
        break
    }
  })

  // 歌曲切换
  window.app_event.on('musicToggled', () => {
    broadcastHostEvent(createMusicChangeMessage)
  })

  // 播放
  window.app_event.on('play', () => {
    broadcastHostEvent(createPlayMessage)
  })

  // 暂停
  window.app_event.on('pause', () => {
    broadcastHostEvent(createPauseMessage)
  })
}

export const leaveTogetherRoom = () => {
  leaveRoom()
  stopTogetherProgressSync()
  handleRoomClosed()
}

export const togetherTest = (message: TogetherMessage) => {
  console.log('手动测试:', message)

  handleTogetherMessage(message)
}

// 调试用：暴露到 window 方便控制台手动测试
;(window as any).togetherTest = togetherTest
;(window as any).createTogetherRoom = createRoom
;(window as any).joinTogetherRoom = joinRoom
;(window as any).leaveTogetherRoom = leaveTogetherRoom
