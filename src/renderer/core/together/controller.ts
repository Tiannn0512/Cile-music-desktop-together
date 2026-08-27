import { 
  play,
  pause,
  handlePlay
} from '@renderer/core/player/action'


import {
  setPlayMusicInfo
} from '@renderer/store/player/action'


import {
  setCurrentTime
} from '@renderer/plugins/player'


import {
  setRemoteAction
} from './status'







export const handleTogetherMessage = (

  message:any

)=>{


  setRemoteAction(true)



  try{


    switch(message.type){



      case 'syncState':{


        const state =
          message.data



        if(
          state &&
          state.musicInfo
        ){


          setPlayMusicInfo(

            null,

            state.musicInfo

          )



          if(
            state.playing
          ){

            handlePlay()

          }


        }






        if(
          state &&
          state.currentTime !== undefined
        ){


          setTimeout(()=>{


            setCurrentTime(

              state.currentTime

            )


          },1000)


        }





        if(
          state &&
          state.playing === false
        ){


          setTimeout(()=>{


            pause()


          },1200)


        }



        break

      }








      case 'musicChange':{



        setPlayMusicInfo(

          null,

          message.data.musicInfo

        )



        handlePlay()



        break

      }








      case 'play':{



        play()



        if(
          message.data.currentTime !== undefined
        ){



          setTimeout(()=>{


            setCurrentTime(

              message.data.currentTime

            )


          },1000)


        }



        break

      }








      case 'pause':{



        pause()



        if(
          message.data.currentTime !== undefined
        ){


          setCurrentTime(

            message.data.currentTime

          )


        }



        break

      }








      case 'seek':{


        setCurrentTime(

          message.data.currentTime

        )


        break

      }








      case 'progress':{



        const delay =

          (

            Date.now()

            -

            message.timestamp

          )

          /

          1000






        setCurrentTime(

          message.data.currentTime

          +

          delay

        )



        break

      }


    }



  }

  finally{


    setTimeout(()=>{


      setRemoteAction(false)


    },1000)


  }



}