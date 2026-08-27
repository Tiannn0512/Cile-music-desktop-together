import {
  connectWebSocket,
  createRoom,
  joinRoom,
  leaveRoom
} from './websocket'


import {
  setRoomCode,
  setHost,
  isHost,
  getRoomCode,
  clearRoom
} from './room'


import {
  handleTogetherMessage
} from './controller'


import {
  createMusicChangeMessage,
  createPlayMessage,
  createPauseMessage,
  createProgressMessage
} from './sync'


import {
  sendMessage,
  registerReceiver
} from './transport'


import {
  getRemoteAction,
  setTogetherEnabled
} from './status'


import type {
  TogetherMessage
} from './types'





let initialized = false


let progressTimer:
  ReturnType<typeof setInterval> | null = null







// 更新一起听人数到UI

const updateOnlineCount = (

  count:number

)=>{


  window.dispatchEvent(

    new CustomEvent(

      'togetherOnlineCount',

      {

        detail:count

      }

    )

  )


}









// 通知UI房间关闭

const notifyRoomClosed = (

  message?:string

)=>{


  window.dispatchEvent(

    new CustomEvent(

      'togetherRoomClosed',

      {

        detail:message

      }

    )

  )


}









const startTogetherProgressSync = ()=>{


  if(progressTimer)

    return





  progressTimer =

    setInterval(()=>{


      if(

        !isHost() ||

        !getRoomCode() ||

        getRemoteAction()

      )

        return





      sendMessage(

        createProgressMessage()

      )



    },2000)


}









export const stopTogetherProgressSync = ()=>{


  if(progressTimer){


    clearInterval(

      progressTimer

    )


    progressTimer = null


  }


}









export const initTogether = ()=>{


  if(initialized)

    return





  initialized = true





  connectWebSocket(

    'wss://together-server-sxyr.onrender.com'

  )









  registerReceiver(

    (message:TogetherMessage)=>{


      console.log(

        '收到服务器消息:',

        message

      )







      switch(message.type){







        case 'roomCreated':{


          setRoomCode(

            message.roomCode!

          )


          setHost(true)


          setTogetherEnabled(true)





          updateOnlineCount(

            message.onlineCount ?? 0

          )





          startTogetherProgressSync()





          console.log(

            '创建房间成功:',

            message.roomCode

          )





          break


        }











        case 'roomJoined':{


          setRoomCode(

            message.roomCode!

          )


          setHost(false)


          setTogetherEnabled(true)





          updateOnlineCount(

            message.onlineCount ?? 0

          )





          stopTogetherProgressSync()





          console.log(

            '加入房间成功:',

            message.roomCode

          )





          break


        }













        case 'userJoined':{


          console.log(

            '对方加入一起听'

          )





          updateOnlineCount(

            message.onlineCount ?? 0

          )





          break


        }













        case 'userLeft':{


          updateOnlineCount(

            message.onlineCount ?? 0

          )





          break


        }













        case 'roomClosed':{


          console.log(

            '房间已关闭:',

            message.message

          )





          clearRoom()


          stopTogetherProgressSync()


          setTogetherEnabled(false)





          updateOnlineCount(0)





          notifyRoomClosed(

            message.message

          )





          break


        }













        case 'roomError':{


          console.error(

            message.message

          )





          break


        }













        default:{


          handleTogetherMessage(

            message

          )


          break


        }


      }


    }

  )













  // 歌曲切换

  window.app_event.on(

    'musicToggled',

    ()=>{


      if(

        !isHost() ||

        !getRoomCode() ||

        getRemoteAction()

      )

        return





      const message =

        createMusicChangeMessage()





      if(message){


        sendMessage(

          message

        )


      }


    }

  )













  // 播放

  window.app_event.on(

    'play',

    ()=>{


      if(

        !isHost() ||

        !getRoomCode() ||

        getRemoteAction()

      )

        return





      sendMessage(

        createPlayMessage()

      )


    }

  )













  // 暂停

  window.app_event.on(

    'pause',

    ()=>{


      if(

        !isHost() ||

        !getRoomCode() ||

        getRemoteAction()

      )

        return





      sendMessage(

        createPauseMessage()

      )


    }

  )


}









export const leaveTogetherRoom = ()=>{


  leaveRoom()


  stopTogetherProgressSync()


  clearRoom()



  setTogetherEnabled(false)





  updateOnlineCount(

    0

  )





  notifyRoomClosed()


}









export const togetherTest = (

  message:TogetherMessage

)=>{


  console.log(

    '手动测试:',

    message

  )





  handleTogetherMessage(

    message

  )


}









;(window as any).togetherTest =

  togetherTest





;(window as any).createTogetherRoom =

  createRoom





;(window as any).joinTogetherRoom =

  joinRoom





;(window as any).leaveTogetherRoom =

  leaveTogetherRoom