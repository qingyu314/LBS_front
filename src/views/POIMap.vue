<template>
    <selectPoi ref="reloadPoi" :point="point" :result="result?.address" @callbackShow="getPoi"/>
  <div style="display: flex">
    <div style="flex: 1">
      <BMap
          :center="{
        lng: 116.28019,
        lat: 40.049191
      }"
          :heading="0"
          :minZoom="3"
          :tilt="0"
          :zoom="5"
          enableContinuousZoom
          enableDoubleClickZoom
          enableDragging
          enableInertialDragging
          enableKeyboard
          enableScrollWheelZoom
          height="95vh"
          v-bind="$attrs"

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
          <BMarker :position="point"></BMarker>
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
import {ref, watch} from "vue";
import SelectPoi, {type poiItem} from "@/components/selectPoi.vue";
import InfoWindow from "@/components/infoWindow.vue";

const showPoi = ref<poiItem[]>([]);


// 坐标解析---------------------------------------------------------------------------------------------------------
const {get: getGeo, result, isLoading, isEmpty} = usePointGeocoder<PointGeocoderResult>()
// 点击地图---------------------------------------------------------------------------------------------------------------
const point = ref({lng: 116.30793520652882, lat: 40.05861561613348})
const showMarker = ref<boolean>(false);

function handleClick(e) {
  point.value = e.latlng
  showMarker.value = true
  getGeo(e.latlng)
}

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

const reloadPoi = ref()
//处理子组件infoWindow事件------------------------------------------------------------------------------------------
const handleReload = () => {
  reloadPoi.value.reloadShow()
}
</script>

<style scoped>

</style>