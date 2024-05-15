<template>
  <el-text :type="type" :style="computedStyle">{{ text }}</el-text>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';

const props = defineProps<{
  text: string;
  type?: string;
  width?: number;
  fontSize?: number;
  fontWeight?: string;
  color?: string;
}>();

const defaultWidth = 150;
const defaultFontSize = 30;
const defaultFontWeight = 'bold';
const defaultColor = '#0f88eb';

const computedStyle = computed(() => ({
  width: `${props.width || defaultWidth}px`,
  fontSize: `${props.fontSize || defaultFontSize}px`,
  fontWeight: props.fontWeight || defaultFontWeight,
  color: `${props.color || defaultColor}`,
  display: 'flex',
  justifyContent: 'center',
  userSelect: 'none',
}));
</script>

<style scoped>

</style>