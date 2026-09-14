// 当前设备唯一ID
const createId = () => {
  return Math.random().toString(36).substring(2) + Date.now()
}

export const clientId = createId()
