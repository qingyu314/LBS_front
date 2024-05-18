<template>
  <div style="display: flex">
    <el-menu
        :collapse="isCollapse"
        style="min-height: calc(100vh - 50px);"
    >
      <div style="margin: 10px auto auto 10px">
        <el-button :icon="Fold" plain type="info" @click="changeMode"></el-button>
      </div>
      <el-menu-item index="1">
        <el-icon>
          <Guide/>
        </el-icon>
        <template #title>
          <span>全国自然保护区(POI界面)</span>
        </template>
      </el-menu-item>
      <el-sub-menu index="2">
        <template #title>
          <el-icon>
            <Setting/>
          </el-icon>
          <span>地图设置</span>
        </template>
        <mapOption v-model="mapSetting"/>
      </el-sub-menu>
      <el-menu-item index="3">
        <el-icon>
          <ChatDotSquare/>
        </el-icon>
        <template #title>
          <el-dropdown>
            <span class="el-dropdown-link">
              <el-button plain type="info" @click="()=>getDotsByRad()">附近POI</el-button>
              <el-icon class="el-icon--right">
                <arrow-down/>
              </el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item style="height: 200px">
                  <el-slider v-model="distance" :max="4000000" show-input size="small" vertical/>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
      </el-menu-item>
    </el-menu>
    <div style="flex: 1">
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
        :zoom="10"
        height="600px"
        v-bind="$attrs"

        @click="handleClick"
    >
      <template v-if="!isLoadGeo && !isEmpty">
        <BMarker :position="point" icon="loc_blue"></BMarker>
        <BLabel
            style="color: #333; font-size: 9px"
            :position="resGeo.point"
            :content="`地址: ${resGeo?.address} 所属商圈:${resGeo?.business} 最匹配地点: ${
            resGeo?.surroundingPois[0]?.title || '无'
          }`"
        />
      </template>
      <template v-if="!loadPoint">
        <template v-for="(item, index) in convertedPositions">
          <BMarker
              :position="item"
              :visible="visible"
          >
          </BMarker>
        </template>
        <BControl>
          <el-button
              :plain="true"
              :type="visible ? 'info' : 'success'"
              @click="changeVisible"
          >
            {{ visible ? '隐藏' : '显示' }}
          </el-button>
        </BControl>
      </template>

    </BMap>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {onMounted, ref, watch} from 'vue'
import {
  BControl,
  BInfoWindow,
  BMap,
  BMarker,
  CoordinatesFromType, CoordinatesToType,
  type MapType,
  type Point, type PointGeocoderResult,
  usePointConvertor, usePointGeocoder,
} from 'vue3-baidu-map-gl'
import request from "@/utils/request";
import {ArrowDown, ChatDotSquare, Fold, Guide, Setting} from "@element-plus/icons-vue";
import MapOption from "@/components/MapOption.vue";
// 给每个点进行坐标转换--------------------------------------------------------------------------------------------------
// const { result, convert, isLoading, isError, status } = usePointConvertor()
const type = ref<MapType>('BMAP_NORMAL_MAP')
interface allSettings {
  enableDragging: boolean,
  enableInertialDragging: boolean,
  enableScrollWheelZoom: boolean,
  enableContinuousZoom: boolean,
  enableResizeOnCenter: boolean,
  enableDoubleClickZoom: boolean,
  enableKeyboard: boolean,
  enablePinchToZoom: boolean,
  enableAutoResize: boolean,
  enableTraffic: boolean,
  type: MapType
}

let mapSetting = ref<allSettings>({
  enableDragging: true,
  enableInertialDragging: true,
  enableScrollWheelZoom: true,
  enableContinuousZoom: true,
  enableResizeOnCenter: true,
  enableDoubleClickZoom: false,
  enableKeyboard: true,
  enablePinchToZoom: true,
  enableAutoResize: true,
  enableTraffic: false,
  type: 'BMAP_NORMAL_MAP'
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
const positions = ref<Point[]>([])
const convertedPositions = ref<Point[]>([])
// 获取POI
const getPOI = () => {
  POIData.value = []
  request.get('secure/user/poi/all').then((res) => {
    POIData.value = res.data
    console.log(POIData.value)
  }).then(()=>{
    for(let i=0;i<POIData.value.length;i++){
      const tmpPoi = {lng: POIData.value[i].longitude, lat: POIData.value[i].latitude};
      positions.value.push(tmpPoi);
    }
  }).then(()=>{
    // 开始单个转换
    convertedPositions.value = positions.value
    // processNext();
  })
}
// 坐标转换-------------------------------------------------------------------------------------------------
// let currentIndex = 0;
// // 处理下一个坐标转换
// const processNext = () => {
//   if (currentIndex >= positions.value.length) {
//     console.log('All positions converted:', convertedPositions.value);
//     return;
//   }
//
//   const currentPoint = [positions.value[currentIndex]];
//   convert(currentPoint, CoordinatesFromType['COORDINATES_GCJ02'], CoordinatesToType['COORDINATES_BD09']);
// };
//
// // 监视resConv的变化
// watch(resConv, (newVal) => {
//   if (newVal.length > 0) {
//     convertedPositions.value.push(...newVal);
//     currentIndex++;
//     processNext();
//   }
// });

// 改变侧边栏展示模式-------------------------------------------------------------------------------------------
const isCollapse = ref<boolean>(true)
const changeMode = () => {
  isCollapse.value = !isCollapse.value
}
// POI的全部显示与隐藏------------------------------------------------------------------------------------------------------------
const visible = ref<boolean>(true)
const changeVisible = () => {
  visible.value = !visible.value
}
// 标点与解析----------------------------------------------------------------------------------------------------------------
const { get: getGeo, result: resGeo, isLoading: isLoadGeo, isEmpty } = usePointGeocoder<PointGeocoderResult>()
const point = ref({ lng: 116.30793520652882, lat: 40.05861561613348 })
const markerPoint = point
function handleClick(e) {
  markerPoint.value = e.latlng
  getGeo(e.latlng)
}
// 查找-----------------------------------------------------------------------------------------------------------
const distance = ref(10000)
const getDotsByRad=()=>{
  request.get('secure/user/getLocation', {
    params:{
      latitude: point.value.lat,
      longitude: point.value.lng,
      radius: distance.value
    }
  }).then((res) => {
    console.log(point.value)
    console.log(res.data)
  })
}

onMounted(()=>{
  getPOI()
})
</script>
