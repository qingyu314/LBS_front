<template>
  <div style="display: flex">

    <div style="flex: 1">
      <el-button-group>
        <el-button @click="() => getPOI()">获取所有信息</el-button>
        <el-button @click="console.log(POIData)">控制台打印poi</el-button>
        <el-button @click="()=>getGeo(convertedPositions[201])">解析坐标</el-button>
        <el-button @click="uploadData">上传数据</el-button>
      </el-button-group>
      <div>
        <selectPoi v-model:showData="POIData" :point="point" />
      </div>
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
      >
        <template v-if="!loadPoint">
          <template v-for="(item, index) in convertedPositions">
            <BMarker
                :position="item"
            >
            </BMarker>
          </template>
        </template>
        <template v-if="!isLoadGeo && !isEmpty">
          <template>
            <BLabel
                :content="`地址: ${resGeo?.address} 所属商圈:${resGeo?.business} 最匹配地点: ${
              resGeo?.surroundingPois[0]?.title || '无'
            }`"
                :position="resGeo.point"
                style="color: #333; font-size: 9px"
            ></BLabel>
          </template>
        </template>
      </BMap>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {
  BControl,
  BLabel,
  BMap,
  BMarker,
  CoordinatesFromType,
  CoordinatesToType,
  type Point, type PointGeocoderResult,
  usePointConvertor, usePointGeocoder
} from "vue3-baidu-map-gl";
import request from "@/utils/request";
import {ref, watch} from "vue";
import {get} from "axios";
import SelectPoi, {type poiItem} from "@/components/selectPoi.vue";
const {result: resConv, convert, isLoading: isLoadConv, isError: isErrConv, status: stConv} = usePointConvertor();

const POIData = ref<poiItem[]>([]);
const loadPoint = ref<boolean>(false);
const positions = ref<Point[]>([]);
const convertedPositions = ref<Point[]>([]);
const getPOI = () => {
  POIData.value = [];
  request.get('secure/user/poi/all').then((res) => {
    POIData.value = res.data;
    console.log(POIData.value);
  }).then(() => {
    convertedPositions.value = POIData.value.map(poi => ({lng: poi.longitude, lat: poi.latitude}));
    console.log(convertedPositions.value)
  })
};

// 坐标转换-------------------------------------------------------------------------------------------------
const batchSize = 10; // 每次转换的坐标数量
let currentIndex = ref(0);

// 处理下一个坐标转换
const processNextBatch = () => {
  if (currentIndex.value >= positions.value.length) {
    console.log('All positions converted');
    return;
  }

  const endIndex = Math.min(currentIndex.value + batchSize, positions.value.length);
  const currentBatch = positions.value.slice(currentIndex.value, endIndex);
  convert(currentBatch, CoordinatesFromType['COORDINATES_GCJ02'], CoordinatesToType['COORDINATES_BD09'])
};

// 监视resConv的变化
watch(resConv, (newVal) => {
  if (newVal.length > 0) {
    // 更新相应的 POIData 项
    for (let i = 0; i < newVal.length; i++) {
      const index = currentIndex.value + i;
      POIData.value[index].longitude = newVal[i].lng;
      POIData.value[index].latitude = newVal[i].lat;
      convertedPositions.value.push(newVal[i]);
    }

    currentIndex.value += batchSize;
    processNextBatch();
  }
});
// 坐标解析，看位置是否正确-------------------------------------------------------------------------------------
const {get: getGeo, result: resGeo, isLoading: isLoadGeo, isEmpty} = usePointGeocoder<PointGeocoderResult>()
// 上传数据---------------------------------------------------------------------------------------------------------
const uploadData = () => {
  request.post(`/secure/user/poi/update`, POIData.value).then(response => {
    console.log('POI data updated successfully', response);
  }).catch(error => {
    console.error('Error updating POI data', error);
  });
}
</script>

<style scoped>

</style>