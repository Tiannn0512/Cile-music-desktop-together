<template>
  <material-modal
    :show="true"
    :bg-close="true"
    max-width="360px"
    min-width="360px"
    @close="handleClose"
  >
    <main :class="$style.main">
      <h2>一起听</h2>

      <div :class="$style.info">
        <div :class="$style.row">
          <span :class="$style.label">状态</span>
          <span>
            <i
              :class="[
                $style.dot,
                connectionText === '已连接' ? $style.online : ''
              ]"
            />
            {{ connectionText }}
          </span>
        </div>

        <div :class="$style.row">
          <span :class="$style.label">身份</span>
          <div :class="$style.textBox">
            <Transition name="slide" mode="out-in">
              <span :key="hostText">{{ hostText }}</span>
            </Transition>
          </div>
        </div>

        <div :class="$style.row">
          <span :class="$style.label">房间码</span>
          <div :class="[$style.textBox, $style.room]">
            <Transition name="slide" mode="out-in">
              <span :key="roomDisplay">{{ roomDisplay }}</span>
            </Transition>
          </div>
          <base-btn
            :class="[$style.copy, !roomCode ? $style.disabled : '']"
            @click="copyRoomCode"
          >
            复制
          </base-btn>
        </div>

        <div :class="$style.row">
          <span :class="$style.label">人数</span>
          <div :class="$style.textBox">
            <Transition name="slide" mode="out-in">
              <span :key="onlineText">{{ onlineText }}</span>
            </Transition>
          </div>
        </div>
      </div>

      <div :class="$style.actions">
        <base-btn
          :class="[$style.createBtn, roomCode ? $style.disabled : '']"
          @click="handleCreate"
        >
          创建房间
        </base-btn>

        <div :class="$style.joinInput">
          <base-input
            v-model="inputRoom"
            placeholder="输入房间码"
            :disabled="!!roomCode"
          />
        </div>

        <div :class="$style.bottomBtns">
          <base-btn
            :class="[$style.smallBtn, roomCode ? $style.disabled : '']"
            @click="handleJoin"
          >
            加入房间
          </base-btn>

          <base-btn
            :class="[$style.smallBtn, !roomCode ? $style.disabled : '']"
            @click="handleLeave"
          >
            退出房间
          </base-btn>
        </div>
      </div>
    </main>
  </material-modal>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

import { createRoom, joinRoom } from '@renderer/core/together/websocket'
import { leaveTogetherRoom, TOGETHER_ROOM_CLOSED_EVENT } from '@renderer/core/together'
import { roomCode, hostStatus, onlineCount } from '@renderer/core/together/room'
import { connectionStatus } from '@renderer/core/together/connection'

const emit = defineEmits(['close'])

const inputRoom = ref('')

const roomClosedHandler = () => {
  inputRoom.value = ''
}

const handleCreate = () => {
  if (roomCode.value) return

  createRoom()
}

const handleJoin = () => {
  if (roomCode.value) return

  const code = inputRoom.value.trim()
  if (!code) return

  joinRoom(code)
}

const handleLeave = () => {
  if (!roomCode.value) return

  leaveTogetherRoom()
}

const copyRoomCode = () => {
  if (!roomCode.value) return

  navigator.clipboard.writeText(roomCode.value).catch((err) => {
    console.error('复制房间码失败:', err)
  })
}

const connectionText = computed(() => {
  switch (connectionStatus.value) {
    case 'connected':
      return '已连接'
    case 'connecting':
      return '连接中'
    default:
      return '未连接'
  }
})

const hostText = computed(() => {
  if (!roomCode.value) return '暂无'

  return hostStatus.value ? '房主' : '听客'
})

const roomDisplay = computed(() => {
  return roomCode.value ?? '未创建'
})

const onlineText = computed(() => {
  if (!roomCode.value) {
    return '现在还没有人听哦，快叫人一起来听吧！'
  }

  if (onlineCount.value <= 0) {
    return '等待其他人加入...'
  }

  return `当前${onlineCount.value}人在听哦`
})

const handleClose = () => {
  emit('close')
}

onMounted(() => {
  window.addEventListener(TOGETHER_ROOM_CLOSED_EVENT, roomClosedHandler)
})

onBeforeUnmount(() => {
  window.removeEventListener(TOGETHER_ROOM_CLOSED_EVENT, roomClosedHandler)
})
</script>

<style lang="less" module>
.main {
  display: flex;
  flex-direction: column;
  padding: 15px;
}

h2 {
  font-size: 14px;
  color: var(--color-primary);
  text-align: center;
  margin: 0 0 20px;
}

.info {
  font-size: 13px;
}

.row {
  height: 32px;
  display: flex;
  align-items: center;
  color: var(--color-font);
}

.label {
  width: 70px;
  opacity: .65;
}

.textBox {
  height: 20px;
  line-height: 20px;
  overflow: hidden;
  display: flex;
  align-items: center;
  white-space: nowrap;
  flex: 1;
}

.room {
  color: var(--color-primary);
  font-weight: bold;
  letter-spacing: 1px;
}

.dot {
  display: inline-block;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--color-font);
  margin-right: 6px;
}

.online {
  background: #4caf50;
}

.copy {
  margin-left: auto;
  height: 28px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  transition: opacity .25s ease;
}

.actions {
  margin-top: 20px;
}

.createBtn {
  width: 100%;
  height: 36px;
  margin-bottom: 15px;
}

.joinInput {
  width: 100%;
}

.joinInput :global(input) {
  width: 100%;
  height: 32px;
  box-sizing: border-box;
}

.bottomBtns {
  display: flex;
  width: 100%;
  gap: 12px;
  margin-top: 15px;
}

.smallBtn {
  flex: 1;
  height: 36px;
  transition: opacity .25s ease;
}

.disabled {
  opacity: .45;
  pointer-events: none;
}

:global(.slide-enter-active),
:global(.slide-leave-active) {
  transition: .25s ease;
}

:global(.slide-enter-from) {
  transform: translateY(-12px);
  opacity: 0;
}

:global(.slide-leave-to) {
  transform: translateY(12px);
  opacity: 0;
}
</style>
