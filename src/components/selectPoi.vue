<template>
  <el-radio-group v-model="mode">
    <el-radio :value="false" size="large">半径搜索</el-radio>
    <el-radio :value="true" size="large">关键字搜索</el-radio>
  </el-radio-group>
  <div class="demo-date-picker">
    <div style="width: 60%">
      <el-slider v-model="distance" :max="4000" :disabled="mode" show-input/>
    </div>
    <div style="margin-left: 30px">
      <el-button @click="getPoiByRad">查询</el-button>
    </div>
  </div>
  <div class="demo-date-picker">
    <el-checkbox v-model="enableCode" :disabled="!mode"/>
    <el-select
        v-model="selectCode"
        :disabled="!enableCode && !mode"
        clearable
        placeholder="选择省份"
        style="width: 240px"
    >
      <el-option
          v-for="item in provinces"
          :key="item.value"
          :label="item.label"
          :value="item.value"
      />
    </el-select>
    <el-checkbox v-model="enableType" :disabled="!mode"/>
    <el-select
        v-model="selectType"
        :disabled="!enableType && !mode"
        clearable
        placeholder="选择类型"
        style="width: 240px"
    >
      <el-option
          v-for="item in typeList"
          :key="item.value"
          :label="item.label"
          :value="item.value"
      />
    </el-select>
    <el-checkbox v-model="enableDepart" :disabled="!mode"/>
    <el-select
        v-model="selectDepart"
        :disabled="!enableDepart && !mode"
        clearable
        placeholder="选择所属系"
        style="width: 240px"
    >
      <el-option
          v-for="item in departList"
          :key="item.value"
          :label="item.label"
          :value="item.value"
      />
    </el-select>

    <el-date-picker
        v-model="chosenDate"
        format="YYYY/MM/DD"
        placeholder="Pick a day"
        size="default"
        type="date"
        value-format="YYYYMMDD"
    />
    <el-button @click="searchPoi">查找</el-button>
  </div>
</template>

<script lang="ts" setup>
import {onMounted, ref, watch} from "vue";
import request from "@/utils/request";
import * as sea from "node:sea";
import type {Point} from "vue3-baidu-map-gl";

const enableCode = ref(false)
const enableType = ref(false)
const enableDepart = ref(false)
const selectCode = ref<string>('')
const selectType = ref<string>('')
const selectDepart = ref<string>('')

export interface poiItem {
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

interface Option {
  value: string;
  label: string;
}

const props = defineProps<{
  showData: poiItem[],
  point: Point
}>()
const emit = defineEmits(['callbackShow'])
const resPoi = ref<poiItem[]>([])
// 选择模式-----------------------------------------------------------------------------------------------------------
const mode = ref<boolean>(true)
// 根据半径查询-------------------------------------------------------------------------------------------------------
const distance = ref<number>(100)
const getPoiByRad = () => {
  resPoi.value = props.showData.filter(poi => calculateDistance(props.point, {
    lat: poi.latitude,
    lng: poi.longitude
  }) <= distance.value);
  emit('callbackShow', resPoi)
}

function calculateDistance(coord1: Point, coord2: Point): number {
  const R = 6371; // 地球半径（单位：公里）
  const toRadians = (degree: number) => degree * (Math.PI / 180);

  const dLat = toRadians(coord2.lat - coord1.lat);
  const dLon = toRadians(coord2.lng - coord1.lng);

  const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(coord1.lat)) * Math.cos(toRadians(coord2.lat)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// 根据关键字选择------------------------------------------------------------------------------------------------------
const provinces = [
  {value: '京', label: '北京市'},
  {value: '津', label: '天津市'},
  {value: '沪', label: '上海市'},
  {value: '渝', label: '重庆市'},
  {value: '冀', label: '河北省'},
  {value: '豫', label: '河南省'},
  {value: '云', label: '云南省'},
  {value: '辽', label: '辽宁省'},
  {value: '黑', label: '黑龙江省'},
  {value: '湘', label: '湖南省'},
  {value: '皖', label: '安徽省'},
  {value: '鲁', label: '山东省'},
  {value: '新', label: '新疆维吾尔自治区'},
  {value: '苏', label: '江苏省'},
  {value: '浙', label: '浙江省'},
  {value: '赣', label: '江西省'},
  {value: '鄂', label: '湖北省'},
  {value: '桂', label: '广西壮族自治区'},
  {value: '甘', label: '甘肃省'},
  {value: '晋', label: '山西省'},
  {value: '蒙', label: '内蒙古自治区'},
  {value: '陕', label: '陕西省'},
  {value: '吉', label: '吉林省'},
  {value: '闽', label: '福建省'},
  {value: '贵', label: '贵州省'},
  {value: '粤', label: '广东省'},
  {value: '青', label: '青海省'},
  {value: '藏', label: '西藏自治区'},
  {value: '川', label: '四川省'},
  {value: '宁', label: '宁夏回族自治区'},
  {value: '琼', label: '海南省'},
  {value: '台', label: '台湾省'},
  {value: '港', label: '香港特别行政区'},
  {value: '澳', label: '澳门特别行政区'}
];

const typeList = ref<Option[]>([])
const departList = ref<Option[]>([])
const chosenDate = ref<string>('')

// 函数用于获取所有可能的 type 值，并以指定的格式返回
function getAllTypes(poiList: poiItem[]): { value: string, label: string }[] {
  const types = new Set<string>();

  for (const item of poiList) {
    types.add(item.type);
  }

  return Array.from(types).map(type => ({value: type, label: type}));
}

// 函数用于获取所有可能的 department 值，并以指定的格式返回
function getAllDepartments(poiList: poiItem[]): { value: string, label: string }[] {
  const departments = new Set<string>();

  for (const item of poiList) {
    departments.add(item.department);
  }

  return Array.from(departments).map(department => ({value: department, label: department}));
}

const searchPoi = () => {
  request.get(`/secure/user/poi/get`, {
    params: {
      code: selectCode.value,
      type: selectType.value,
      department: selectDepart.value,
      settime: chosenDate.value
    }
  }).then(res => {
    resPoi.value = res.data;
    emit('callbackShow', resPoi)
  })
}

watch(() => props.showData, (newVal, oldVal) => {
      console.log(111)
      typeList.value = getAllTypes(newVal)
      departList.value = getAllDepartments(newVal)
    },
    {deep: true}
)

watch(() => resPoi, (newVal, oldVal) => {
  console.log(newVal)
  emit('callbackShow', newVal)
})
onMounted(() => {
  typeList.value = getAllTypes(props.showData)
  departList.value = getAllDepartments(props.showData)
})
</script>

<style scoped>
.select {
  display: flex;
}

.demo-date-picker {
  display: flex;
  width: 100%;
  padding: 0;
  flex-wrap: wrap;
  margin: 10px 0
}

</style>