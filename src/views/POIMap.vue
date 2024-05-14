<template>
  <div>
    <label>
      <input v-model="mapSetting.enableScrollWheelZoom" type="checkbox"/>
      鼠标缩放
    </label>
    <br/>
    <label>
      <input v-model="mapSetting.enableDragging" type="checkbox"/>
      拖拽
    </label>
    <br/>
    <label>
      <input v-model="mapSetting.enableInertialDragging" type="checkbox"/>
      惯性拖拽
    </label>
    <br/>
    <label>
      <input v-model="mapSetting.enablePinchToZoom" type="checkbox"/>
      双指缩放地图
    </label>
    <br/>
    <label>
      <input v-model="mapSetting.enableKeyboard" type="checkbox"/>
      键盘操作
    </label>
    <br/>
    <label>
      <input v-model="mapSetting.enableDoubleClickZoom" type="checkbox"/>
      双击缩放，左键双击放大、右键双击缩小
    </label>
    <br/>
    <label>
      <input v-model="mapSetting.enableContinuousZoom" type="checkbox"/>
      双击平滑缩放效果
    </label>
    <br/>
    <label>
      <input v-model="mapSetting.enableTraffic" type="checkbox"/>
      显示交通路况
    </label>
    <br/>
    <br/>
    地图类型：
    <select id="" v-model="type" class="mySelect" name="">
      <option value="BMAP_NORMAL_MAP">常规地图 BMAP_NORMAL_MAP</option>
      <option value="BMAP_EARTH_MAP">地球模式 BMAP_EARTH_MAP</option>
      <option value="BMAP_SATELLITE_MAP">卫星图 BMAP_EARTH_MAP</option>
    </select>
    <br/>
    <br/>
    <BMap
        :center="{
        lng: 116.28019,
        lat: 40.049191
      }"
        :enableContinuousZoom="mapSetting.enableContinuousZoom"
        :enableDoubleClickZoom="mapSetting.enableDoubleClickZoom"
        :enableDragging="mapSetting.enableDragging"
        :enableInertialDragging="mapSetting.enableInertialDragging"
        :enableKeyboard="mapSetting.enableKeyboard"
        :enablePinchToZoom="mapSetting.enablePinchToZoom"
        :enableScrollWheelZoom="mapSetting.enableScrollWheelZoom"
        :enableTraffic="mapSetting.enableTraffic"
        :heading="0"
        :mapType="type"
        :minZoom="3"
        :tilt="0"
        :zoom="19"
        v-bind="$attrs"
    >
      <template v-if="loadPoint">
        <template v-for="(item, index) in POIData">
          <BMarker
              :position="{lat: item.latitude, lng: item.longitude}"

          >

          </BMarker>
<!--          <BInfoWindow-->
<!--              v-model:show="showPoi[index]"-->
<!--              :offset="{-->
<!--                x: 0,-->
<!--                y: -10-->
<!--              }"-->
<!--              :position="{lat: item.latitude, lng: item.longitude}"-->
<!--              :title="item.name"-->
<!--              enableAutoPan-->
<!--              enableCloseOnClick-->
<!--          >-->
<!--          </BInfoWindow>-->
        </template>
      </template>
    </BMap>
  </div>
</template>

<script lang="ts" setup>
import {onMounted, ref} from 'vue'
import {BInfoWindow, BMap, BMarker, type MapProps, type MapType, usePointConvertor} from 'vue3-baidu-map-gl'
import request from "@/utils/request";

const type = ref<MapType>('BMAP_NORMAL_MAP')
const mapSetting = ref<MapProps>({
  enableDragging: true,
  enableInertialDragging: true,
  enableScrollWheelZoom: true,
  enableContinuousZoom: true,
  enableResizeOnCenter: true,
  enableDoubleClickZoom: true,
  enableKeyboard: true,
  enablePinchToZoom: true,
  enableAutoResize: true,
  enableTraffic: true
})

//坐标转换
const {result: resConv, convert, isLoading: isLoadConv, isError: isErrConv, status: stConv} = usePointConvertor()
interface poiItem {
  code: string;
  department: string;
  latitude: number;
  level: string;
  locate: string;
  longitude: number;
  name: string;
  protectObject: string;
  setTime: string; // 你可以根据需要将时间类型更改为 Date 类型
  size: number;
  type: string;
}
const POIData = ref<poiItem[]>([])
const loadPoint = ref<boolean>(false)
const showPoi = ref<boolean[]>([])
// 获取POI
const getPOI = () => {
  request.get('secure/user/poi/all').then((res) => {
    POIData.value = res.data
    console.log(POIData.value)
    for(let i=0;i<POIData.value.length;i++){
      showPoi.value.push(true)
      console.log(showPoi.value)
      loadPoint.value=true
    }

  })
}


onMounted(()=>{
  getPOI()
})
</script>
