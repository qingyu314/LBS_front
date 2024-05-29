<template>
  <div>
    <button class="myButton" type="button" v-if="!circle.isDrawing" @click="circle.toggle">绘制圆</button>
    <button class="myButton" type="button" v-else @click="circle.toggle">禁用绘制圆</button>
    <button class="myButton" type="button" v-if="!rectangle.isDrawing" @click="rectangle.toggle">绘制矩形</button>
    <button class="myButton" type="button" v-else @click="rectangle.toggle">禁用绘制矩形</button>
    <button class="myButton" type="button" @click="clearFn">清空</button>
    <BMap
        v-bind="$attrs"
        :center="{ lng: 116.385243, lat: 39.913063 }"
        :zoom="16"
        enable-scroll-wheel-zoom
        @initd="handleInitd"
        @mouseup="handleMouseUp"
    />
  </div>
</template>

<script lang="ts" setup>
import {ref, watch} from 'vue'
import {BMap} from 'vue3-baidu-map-gl'
let circle = ref({
  instance: null,
  isDrawing: false,
  toggle() {
    let _circle = circle.value
    _circle.isDrawing ? _circle.instance.closeAll() : _circle.instance.open()
    _circle.isDrawing = !_circle.isDrawing
  }
})
let rectangle = ref({
  instance: null,
  isDrawing: false,
  toggle() {
    let _rectangle = rectangle.value
    _rectangle.isDrawing ? _rectangle.instance.closeAll() : _rectangle.instance.open()
    _rectangle.isDrawing = !_rectangle.isDrawing
  }
})
let clearFn = ref()
function handleInitd({ map, BMapGL }) {
  import('bmap-draw').then(({ DrawScene, CircleDraw, RectDraw }) => {
    const scene = new DrawScene(map)
    clearFn.value = () => scene.clearData()
    // 圆形绘制
    circle.value.instance = new CircleDraw(scene, {
      isOpen: false,
      labelOptions: {
        borderRadius: '2px',
        background: '#b5d3fb',
        border: '1px solid #b5d3fb',
        color: '#333',
        fontSize: '12px',
        letterSpacing: '0',
        padding: '5px'
      },
      baseOpts: {
        strokeColor: '#6d77f9',
        fillColor: '#fff',
        strokeWeight: 5,
        strokeOpacity: 1,
        fillOpacity: 0.2
      }
    })
    // 矩形绘制
    rectangle.value.instance = new RectDraw(scene, {
      isOpen: false,
      isSeries: true,
      labelOptions: {
        borderRadius: '2px',
        background: '#b5d3fb',
        border: '1px solid #b5d3fb',
        color: '#333',
        fontSize: '12px',
        letterSpacing: '0',
        padding: '5px'
      },
      baseOpts: {
        fillColor: '#fff',
        strokeWeight: 5,
        strokeOpacity: 1,
        fillOpacity: 0.2
      }
    })
  })
}
function handleMouseUp(){
  console.log(circle.value.instance.circle.point?.latLng);
  console.log(circle.value.instance.circle.radius);
}

watch(() => rectangle.value.instance, (newVal) => {
  console.log(newVal)
}, { deep: true });
</script>
