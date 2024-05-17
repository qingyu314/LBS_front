<template>
  <el-drawer
      v-loading="loading"
      v-model="drawerRef"
      title="I am the title"
      :with-header="false"
  >
    <el-card>
      <el-form
          :label-position="labelPosition"
          :model="cmtFirst"
          label-width="auto"
          style="max-width: 600px"
      >
        <el-form-item>
          <el-text size="large">{{ cmtFirst.username }}</el-text>
        </el-form-item>
        <el-form-item>
          <el-text>{{ cmtFirst.comment }}</el-text>
        </el-form-item>
        <el-form-item>
          <el-image :src="info.imgUrl"/>
        </el-form-item>
      </el-form>
    </el-card>
    <el-card v-for="item in cmtList" style="max-width: 600px">
      <el-form
          :label-position="labelPosition"
          :model="item"
          label-width="auto"
          style="max-width: 600px"
      >
        <el-form-item>
          <el-text size="large">{{ item.username }}</el-text>
        </el-form-item>
        <el-form-item>
          <el-text>{{ item.comment }}</el-text>
        </el-form-item>
      </el-form>
    </el-card>
  </el-drawer>
</template>

<script lang="ts" setup>
import {ref, watch, toRef, onMounted, reactive} from 'vue';
import request from "@/utils/request";
import type {FormProps} from "element-plus";

const props = defineProps(['drawer','info']);
const drawerRef = toRef(props, 'drawer');
const info = toRef(props, 'info');
const emit = defineEmits(['update:drawer']);

const loading = ref(false);

watch(drawerRef, (newVal) => {
  console.log(111)
  console.log(drawerRef.value)
  if(newVal) getCmtById()
  emit('update:drawer', newVal);
});
interface Comment {
  userId: number,
  username: string,
  comment: string,
}
const cmtList = ref<Comment[]>([]);
const cmtFirst = reactive<Comment>({
  userId: info?.value.userId,
  username: '',
  comment: '无评论',
});
const getCmtById = () => {
  console.log(drawerRef?.value);
  loading.value = true;
  request.get('/secure/file/comments', {
    params:{
      imageid: info?.value.imageId,
    }
  }).then((res) => {
    console.log(res)
    if (res.data && res.data.length > 0 && res.data[0].contain !== undefined) {
      const tmpRes = res.data.slice(1)
      cmtFirst.comment = res.data[0].Contain;
      request.get('secure/user/'+info?.value.userId).then((res1) => {
        cmtFirst.username = res1.data.username
      })
      for (let i = 0; i < tmpRes.length; i++) {
        let cmtItem = <Comment>{
          userId: tmpRes[i].userId,
          username: '',
          comment: tmpRes[i].Contain,
        }
        request.get('secure/user/'+tmpRes[i].userid).then((res1) => {
          cmtItem.username = res1.data.username
        }).then(()=>{
          cmtList.value.push(cmtItem)
        })
      }
    } else {
      request.get('secure/user/'+info?.value.userId).then((res1) => {
        cmtFirst.username = res1.data.username
      })
    }
  }).finally(() => {
    loading.value = false;
  });
};

// const handleClose = () => {
//   console.log(drawerRef.value)
// }
onMounted(()=>{
})
// 卡片显示---------------------------------------------------------------
const labelPosition = ref<FormProps['labelPosition']>('left')
</script>
