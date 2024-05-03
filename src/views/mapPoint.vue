<template>
  <div class="demo-image">
    <div v-for="fit in fits" :key="fit" class="block">
      <span class="demonstration">{{ fit }}</span>
      <el-image style="width: 100px; height: 100px" :src="url" :fit="fit" />
    </div>
    <el-button @click="getImgSec">dddddd</el-button>
  </div>
</template>

<script lang="ts" setup>
import type { ImageProps } from 'element-plus'

const fits = [
  'fill',
  'contain',
  'cover',
  'none',
  'scale-down',
] as ImageProps['fit'][]
 import request from "@/utils/request";
 import {onMounted, ref} from "vue";

 const url = ref('')
 const getImgSec = () => {
   request.get('/file/image', {
     params:{
       imageId : 2
     },
     responseType: 'blob'
   }).then(res => {
     console.log(res.data)
     const urlCreator = window.URL || window.webkitURL;
     url.value = urlCreator.createObjectURL(res.data);  // 创建一个临时URL用于图片显示
     console.log(url.value);
   })
  onMounted(()=>{
    getImgSec()
  })
 };
</script>

<style scoped>
.demo-image .block {
  padding: 30px 0;
  text-align: center;
  border-right: solid 1px var(--el-border-color);
  display: inline-block;
  width: 20%;
  box-sizing: border-box;
  vertical-align: top;
}
.demo-image .block:last-child {
  border-right: none;
}
.demo-image .demonstration {
  display: block;
  color: var(--el-text-color-secondary);
  font-size: 14px;
  margin-bottom: 20px;
}
</style>