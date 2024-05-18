<script lang="ts" setup>
import {ref, watch} from 'vue';
const typeData = [
  {
    value: 'BMAP_NORMAL_MAP',
    label: 'BMAP_NORMAL_MAP',
  },
  {
    value: 'BMAP_EARTH_MAP',
    label: 'BMAP_EARTH_MAP',
  },
  {
    value: 'BMAP_SATELLITE_MAP',
    label: 'BMAP_SATELLITE_MAP',
  }
]
const props = defineProps(['modelValue']);
const emit = defineEmits(['update:modelValue']);

watch(
    () => props.modelValue,
    (newVal) => {
      emit('update:modelValue', newVal);
    },
    {deep: true}
);
</script>

<template>
  <el-menu>
    <el-sub-menu index="1">
      <template #title><span>地图功能</span></template>
      <el-menu-item>
        <el-checkbox v-model="props.modelValue.enableScrollWheelZoom" label="鼠标缩放"/>
      </el-menu-item>
      <el-menu-item>
        <el-checkbox v-model="props.modelValue.enableDragging" label="拖拽"/>
      </el-menu-item>
      <el-menu-item>
        <el-checkbox v-model="props.modelValue.enableInertialDragging" label="惯性拖拽"/>
      </el-menu-item>
      <el-menu-item>
        <el-checkbox v-model="props.modelValue.enablePinchToZoom" label="双指缩放地图"/>
      </el-menu-item>
      <el-menu-item>
        <el-checkbox v-model="props.modelValue.enableKeyboard" label="键盘操作"/>
      </el-menu-item>
      <el-menu-item>
        <el-checkbox v-model="props.modelValue.enableDoubleClickZoom" label="双击缩放，左键双击放大、右键双击缩小"/>
      </el-menu-item>
      <el-menu-item>
        <el-checkbox v-model="props.modelValue.enableContinuousZoom" label="双击平滑缩放效果"/>
      </el-menu-item>
      <el-menu-item>
        <el-checkbox v-model="props.modelValue.enableTraffic" label="显示交通路况"/>
      </el-menu-item>
    </el-sub-menu>
    <el-menu-item>
      <el-select
          v-model="props.modelValue.type"
          placeholder="Select"
          size="large"
          style="width: 240px"
      >
        <el-option
            v-for="item in typeData"
            :key="item.value"
            :label="item.label"
            :value="item.value"
        />
      </el-select>
    </el-menu-item>
  </el-menu>
</template>

<style scoped>
</style>
