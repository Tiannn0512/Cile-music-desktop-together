import { ref } from 'vue'


export const roomCode = ref<string | null>(null)


export const hostStatus = ref(false)





export const setRoomCode = (

  code:string

)=>{


  roomCode.value = code


}








export const getRoomCode = ()=>{


  return roomCode.value


}








export const clearRoom = ()=>{


  roomCode.value = null


  hostStatus.value = false


}








export const setHost = (

  value:boolean

)=>{


  hostStatus.value = value


}








export const isHost = ()=>{


  return hostStatus.value


}