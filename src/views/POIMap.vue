<template>
    <selectPoi
        ref="reloadPoi"
        :point="point"
        :result="result?.address"
        :rectangle="rectangle"
        @callbackShow="getPoi"
        @draw-rectangle="handleDraw"
    />
  <div style="display: flex">
    <div style="flex: 1">
      <BMap
          :center="{
        lng: 116.28019,
        lat: 40.049191
      }"
          :minZoom="3"
          :zoom="5"
          enableContinuousZoom
          enableDoubleClickZoom
          enableDragging
          enableInertialDragging
          enableKeyboard
          enableScrollWheelZoom
          height="95vh"
          v-bind="$attrs"
          @initd="handleInitd"
          @click="handleClick"
      >
        <template v-if="!loadPoi">
          <BMarker
              v-for="(item, index) in showPoi"
              :position="{lng: item.longitude, lat: item.latitude}"
              enableClicking
              @click="(event) => clickDot(item, event)"
          >
          </BMarker>
          <BInfoWindow
              v-model:show="showInfo"
              :offset="{
                x: 0,
                y: -10
              }"
              :position="infoPos"
              enableAutoPan
              enableCloseOnClick
          >
            <infoWindow v-model:showItem="showItem" @reload="handleReload"/>
          </BInfoWindow>
        </template>
        <template v-if="!isLoading && !isEmpty">
          <BMarker :position="point" :icon="'loc_blue'"></BMarker>
          <BLabel
              :content="`地址: ${result?.address} 所属商圈:${result?.business} 最匹配地点: ${
            result?.surroundingPois[0]?.title || '无'
          }`"
              :position="result.point"
              style="color: #333; font-size: 9px"
          />
        </template>
      </BMap>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {
  BControl,
  BInfoWindow,
  BLabel,
  BMap,
  BMarker,
  type Point, type PointGeocoderResult,
  usePointGeocoder
} from "vue3-baidu-map-gl";
import {ref, watch, nextTick} from "vue";
import SelectPoi, {type poiItem} from "@/components/selectPoi.vue";
import InfoWindow from "@/components/infoWindow.vue";

const showPoi = ref<poiItem[]>([]);


// 坐标解析---------------------------------------------------------------------------------------------------------
const {get: getGeo, result, isLoading, isEmpty} = usePointGeocoder<PointGeocoderResult>()
// 点击地图---------------------------------------------------------------------------------------------------------------
const point = ref({lng: 116.30793520652882, lat: 40.05861561613348})
const showMarker = ref<boolean>(false);
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
  import('bmap-draw').then(({ DrawScene, RectDraw }) => {
    const scene = new DrawScene(map,
        {
          noLimit: true
        })
    clearFn.value = () => scene.clearData()
    // 矩形绘制
    rectangle.value.instance = new RectDraw(scene, {
      hideTip: true, // 隐藏绘制提示
      isOpen: false,
      isSeries: false, // 是否开启批量绘制
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
    });
  })
}
let pointS = null;
function handleClick(e) {
  point.value = e.latlng
  showMarker.value = true
  getGeo(e.latlng)
  if(rectangle.value.instance.startPoint != null
      && pointS?.lat != rectangle.value.instance.startPoint.lat
      && pointS?.lng != rectangle.value.instance.startPoint.lng
      && enableDraw) {
    pointS = rectangle.value.instance.startPoint;
    nextTick(() => {
      console.log(pointS)
      console.log(rectangle.value.instance.startPoint)
      reloadPoi.value.getRectPoint(rectangle.value.instance.startPoint, point.value)
    })
  }
}

// function handleMouseUp() {
//   if(rectangle.value.instance.startPoint != null && enableDraw)
//     nextTick(() => {
//       reloadPoi.value.getRectPoint(rectangle.value.instance.startPoint, point.value)
//     })
// }
// 点击标点--------------------------------------------------------------------------------------------------------
function clickDot(item: poiItem, event: MouseEvent) {
  event.stopPropagation()
  infoPos.value = {lng: item.longitude, lat: item.latitude}
  showItem.value = JSON.parse(JSON.stringify(item))
  showInfo.value = true
}

// BInfoWindow相关-------------------------------------------------------------------------------------------------
const infoPos = ref<Point>({lng: 0, lat: 0})
const showItem = ref<poiItem>({
  code: '',
  department: '',
  latitude: 0,
  level: '国家级',
  locate: '',
  longitude: 0,
  name: '',
  protectObject: '',
  setTime: '',
  size: 0,
  type: '',
  imageid: 0,
})
const showInfo = ref<boolean>(false);
const loadPoi = ref<boolean>(true)
// 处理子组件selectPoi事件------------------------------------------------------------------------------------------------
const getPoi = (data: poiItem[]) => {
  console.log('Received POI data:', data);
  console.log('previous POI data', showPoi.value)
  showPoi.value = data; // 更新 poiData
  if (data.length > 0) {
    showItem.value = showPoi.value[0];
    infoPos.value = {lng: showPoi.value[0].longitude, lat: showPoi.value[0].latitude}
    loadPoi.value = false
    showInfo.value = true

  } else {
    showInfo.value = false
  }
};

// 处理绘图
let enableDraw = false
const handleDraw = () => {
  enableDraw = true
  clearFn.value()
  rectangle.value.toggle()
}
const reloadPoi = ref()
//处理子组件infoWindow事件------------------------------------------------------------------------------------------
const handleReload = () => {
  reloadPoi.value.reloadShow()
}


</script>

<style scoped>

</style>