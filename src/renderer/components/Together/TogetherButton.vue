<template>
  <div>
    <div
      :class="$style.button"
      title="一起听"
      @click="visible = !visible"
    >
      <svg :class="$style.icon" viewBox="0 0 24 24">
        <!-- 前面的人 -->
        <circle cx="9" cy="8" r="3" />
        <path d="M3 20c0-3.5 2.7-6 6-6s6 2.5 6 6" />

        <!-- 后面的人 -->
        <circle cx="16" cy="9" r="2.5" />
        <path d="M14 15c3 0 5 2 5 5" />
      </svg>
    </div>

    <TogetherPanel
      v-if="visible"
      :class="$style.panel"
      @close="visible = false"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import TogetherPanel from './TogetherPanel.vue'

const visible = ref(false)
</script>

<style lang="less" module>
.button {
  -webkit-app-region: no-drag;
  cursor: pointer;
  height: 32px;
  width: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-font);
  user-select: none;
}

.button:hover {
  color: var(--color-primary);
}

.icon {
  width: 21px;
  height: 21px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.panel {
  position: absolute;
  top: 45px;
  right: 80px;
  z-index: 20;
}
</style>
