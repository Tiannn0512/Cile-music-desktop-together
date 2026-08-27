<template>

  <div :class="$style.wrapper">


    <span
      :class="[
        $style.text,
        animate
          ? $style.leave
          : ''
      ]"
    >

      {{ oldText }}

    </span>


    <span
      v-if="animate"
      :class="$style.textNew"
    >

      {{ text }}

    </span>


  </div>


</template>


<script setup>


import {

  ref,

  watch,

  nextTick,

} from 'vue'


const props = defineProps({

  text: {

    type: String,

    default: '',

  },

})


const oldText = ref(

  props.text,

)


const animate = ref(false)


watch(

  () => props.text,

  async(value) => {
    if (value === oldText.value) {
      return
    }


    animate.value = true


    await nextTick()


    setTimeout(() => {
      oldText.value = value


      animate.value = false
    }, 260)
  },

)


</script>


<style lang="less" module>


.wrapper {


  position:relative;


  display:inline-block;


  height:18px;


  overflow:hidden;


  vertical-align:middle;


}


.text,
.textNew {


  display:block;


  height:18px;


  line-height:18px;


  transition:

    transform .26s ease,

    opacity .26s ease;


}


.leave {


  transform:

    translateY(-100%);


  opacity:0;


}


.textNew {


  position:absolute;


  left:0;


  top:100%;


  opacity:0;


}


.wrapper .textNew {


  transform:

    translateY(0);


}


</style>
