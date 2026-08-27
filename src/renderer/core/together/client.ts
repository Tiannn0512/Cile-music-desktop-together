const createId = ()=>{


  return Math.random()

    .toString(36)

    .substring(2)

    +

    Date.now()


}





// 当前设备唯一ID

export const clientId = createId()