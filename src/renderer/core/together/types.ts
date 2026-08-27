export interface TogetherMessage {


  id?: string


  senderId?: string


  roomId?: string



  type:

    | 'musicChange'

    | 'play'

    | 'pause'

    | 'seek'

    | 'progress'


    // 房间相关

    | 'createRoom'

    | 'joinRoom'

    | 'leaveRoom'

    | 'roomCreated'

    | 'roomJoined'

    | 'userJoined'

    | 'userLeft'

    | 'roomError'

    | 'roomClosed'


    // 状态同步

    | 'syncState'



  timestamp?: number



  roomCode?: string



  message?: string



  // 当前一起听人数

  onlineCount?: number



  data?: {


    musicInfo?: any


    currentTime?: number


    playing?: boolean


    timestamp?: number


  }


}