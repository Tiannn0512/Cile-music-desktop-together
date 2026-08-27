let remoteAction = false



let remoteActionTimer:
  ReturnType<typeof setTimeout> | null = null





let togetherEnabled = false






export const setRemoteAction = (

  value:boolean

)=>{


  remoteAction = value



  if(!value){


    if(remoteActionTimer){


      clearTimeout(
        remoteActionTimer
      )


      remoteActionTimer=null


    }


    return

  }






  if(remoteActionTimer){


    clearTimeout(
      remoteActionTimer
    )


  }





  remoteActionTimer =
    setTimeout(()=>{


      remoteAction=false


      remoteActionTimer=null


    },3000)



}









export const getRemoteAction = ()=>{


  return remoteAction


}









export const setTogetherEnabled = (

  value:boolean

)=>{


  togetherEnabled=value


}









export const getTogetherEnabled = ()=>{


  return togetherEnabled


}