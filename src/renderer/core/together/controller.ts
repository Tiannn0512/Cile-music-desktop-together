import { play, pause, handlePlay } from '@renderer/core/player/action'
import { setPlayMusicInfo } from '@renderer/store/player/action'
import { getCurrentTime, setCurrentTime } from '@renderer/plugins/player'

import { setRemoteAction, releaseRemoteActionAfter } from './status'
import { getSyncableMusicInfo } from './musicInfo'
import type { TogetherMessage } from './types'

// 远程操作后的防护窗口：期间抑制本地播放事件广播，避免同步动作回环
const REMOTE_ACTION_GUARD_MS = 1000

// 进度延迟补偿的上限（秒）：正常网络延迟远小于此值，
// 钳制可避免双端时钟偏差把听客进度推到错误位置
const PROGRESS_DELAY_MAX = 2

// 进度对齐死区（秒）：偏差小于此值不干预，各自自然播放，
// 避免每次进度心跳都强制 seek 造成播放卡顿
const PROGRESS_SYNC_THRESHOLD = 1.2

// 直追判定窗口（毫秒）：仅在此时间内收到的心跳才参与外推，超过则视为常规同步
const PROGRESS_CATCHUP_WINDOW = 6000

// 直追的最小目标位置（秒）：0 = 任何明显落后都一步追到房主实时位置，
// 消除“每次心跳追一小段、连续跳好几下”的阶梯式追赶
const PROGRESS_CATCHUP_MIN = 0

// 最近一次收到房主进度心跳的时间（用于直追外推）
let lastProgressAt = 0

// 追踪式进度对齐：播放器加载耗时不可控，固定延时单次 seek 可能失效。
// 目标位置按经过时间持续外推，多次尝试；确认自然播放后交给心跳，避免额外 seek 造成跳感。
const alignPlaybackPosition = (basePosition: number) => {
  const alignState = { prevPos: -1 }
  const startedAt = Date.now()

  void (async() => {
    for (const delay of [900, 1200, 1500, 1800, 2200, 2600, 3000]) {
      await new Promise<void>(resolve => setTimeout(resolve, delay))
      const elapsed = (Date.now() - startedAt) / 1000
      const expected = basePosition + elapsed
      const current = getCurrentTime()

      // 已对齐
      if (Math.abs(current - expected) < PROGRESS_SYNC_THRESHOLD) return
      // 已自然播放、离目标不远且没有异常超前：交给心跳微调
      if (current > basePosition + 0.5 && current > alignState.prevPos && current <= expected + PROGRESS_SYNC_THRESHOLD) return
      try {
        await setCurrentTime(expected)
      } catch {
        // 播放器未就绪时继续下一次尝试
      }
      alignState.prevPos = current
    }
  })()
}

export const handleTogetherMessage = (message: TogetherMessage) => {
  setRemoteAction(true)

  try {
    switch (message.type) {
      // 加入房间时服务端下发的完整播放状态
      case 'syncState': {
        const state = message.data

        const musicInfo = getSyncableMusicInfo(state?.musicInfo)
        if (musicInfo) {
          // 丢弃待恢复的本地播放状态，避免远程切歌被“恢复上次播放”分支拦截导致不同步
          window.lx.restorePlayInfo = null
          setPlayMusicInfo(null, musicInfo)

          if (state?.playing) {
            handlePlay()
          }
        }

        const currentTime = state?.currentTime
        if (currentTime !== undefined) {
          // 播放器加载耗时不可控，用追踪式对齐直到真正追上
          alignPlaybackPosition(currentTime)
        }

        if (state?.playing === false) {
          setTimeout(() => {
            pause()
          }, 1200)
        }

        break
      }

      // 房主切换了歌曲
      case 'musicChange': {
        const musicInfo = getSyncableMusicInfo(message.data?.musicInfo)
        if (!musicInfo) break

        // 丢弃待恢复的本地播放状态，避免远程切歌被“恢复上次播放”分支拦截导致不同步
        window.lx.restorePlayInfo = null
        setPlayMusicInfo(null, musicInfo)

        handlePlay()

        // 起播后直接对齐房主进度（追踪式，加载完成后一步到位）
        const currentTime = message.data?.currentTime
        if (currentTime !== undefined) {
          alignPlaybackPosition(currentTime)
        }

        break
      }

      case 'play': {
        play()

        const currentTime = message.data?.currentTime
        if (currentTime !== undefined) {
          alignPlaybackPosition(currentTime)
        }

        break
      }

      case 'pause': {
        pause()

        const currentTime = message.data?.currentTime
        // 暂停前已对齐就不重复 seek，避免暂停动作本身产生跳感
        if (currentTime !== undefined && Math.abs(getCurrentTime() - currentTime) > PROGRESS_SYNC_THRESHOLD) {
          setCurrentTime(currentTime)
        }

        break
      }

      case 'seek': {
        const currentTime = message.data?.currentTime
        if (currentTime !== undefined) {
          setCurrentTime(currentTime)
        }

        break
      }

      case 'progress': {
        const currentTime = message.data?.currentTime
        if (currentTime === undefined) break

        lastProgressAt = Date.now()

        const delay = Math.min(
          Math.max((Date.now() - (message.timestamp ?? Date.now())) / 1000, 0),
          PROGRESS_DELAY_MAX,
        )

        const target = currentTime + delay

        // 晚到端快速直追：本端刚完成加载（明显落后）且心跳新鲜时，
        // 按"房主位置 + 心跳龄"外推当前应处位置，一步追平，
        // 消除"一端先播、另一端加载完突然跳过去"的两段式追赶
        if (target > PROGRESS_CATCHUP_MIN && Date.now() - lastProgressAt < PROGRESS_CATCHUP_WINDOW) {
          const age = (Date.now() - lastProgressAt) / 1000
          const liveTarget = target + age
          if (getCurrentTime() < liveTarget - PROGRESS_SYNC_THRESHOLD) {
            setCurrentTime(liveTarget)
            break
          }
        }

        // 偏差在死区内不干预，避免频繁 seek 造成卡顿
        if (Math.abs(getCurrentTime() - target) < PROGRESS_SYNC_THRESHOLD) break

        setCurrentTime(target)

        break
      }
    }
  } finally {
    releaseRemoteActionAfter(REMOTE_ACTION_GUARD_MS)
  }
}
