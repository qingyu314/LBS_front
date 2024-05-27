<template>
  <img v-if="imgUrl!==''" :src="imgUrl" alt="extended information"/>
<!--  这里你改改↑-->
  <div v-if="!isModify">
    <el-text>{{props.showItem.name}}</el-text>
    <br />
    <el-text>{{props.showItem.locate}}</el-text>
    <br />
    <el-text>{{props.showItem.size}}</el-text>
    <br />
    <el-text>{{props.showItem.protectObject}}</el-text>
    <br />
    <el-text>{{props.showItem.type}}</el-text>
    <br />
    <el-text>{{props.showItem.level}}</el-text>
    <br />
    <el-text>{{props.showItem.setTime}}</el-text>
    <br />
    <el-text>{{props.showItem.department}}</el-text>
    <br />
    <el-button-group v-if="isAdmin()">
      <el-button @click="delPoi" :icon="Delete"></el-button>
      <el-button @click="modifyPoi" :icon="Edit"></el-button>
    </el-button-group>
  </div>
  <div v-else>
    <el-upload
        v-if="imgUrl==''"
        class="avatar-uploader"
        action="http://localhost:9091/secure/file/upload"
        :show-file-list="false"
        :on-success="handleAvatarSuccess"
    >
      <img v-if="imageUrl" :src="imageUrl" class="avatar" />
      <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
    </el-upload>
    <el-input v-model="tempPoi.name" />
    <el-input v-model="tempPoi.locate" />
    <el-input v-model="tempPoi.size" />
    <el-input v-model="tempPoi.protectObject" />
    <el-input v-model="tempPoi.type" />
    <el-input v-model="tempPoi.level" />
    <el-input v-model="tempPoi.setTime" />
    <el-input v-model="tempPoi.department" />

    <el-button-group v-if="isAdmin()">
      <el-button @click="saveEdit" :icon="DocumentChecked"></el-button>
      <el-button @click="discardEdit" :icon="DocumentDelete"></el-button>
    </el-button-group>
  </div>
</template>

<script setup lang="ts">
// 修改-----------------------------------------------------------------------------------------------------------

import type{poiItem} from "@/components/selectPoi.vue";
import {ref, watch} from "vue";
import {Delete, DocumentChecked, DocumentDelete, Edit} from "@element-plus/icons-vue"
import request from "@/utils/request";
import {ElMessage, type UploadProps} from "element-plus";

const props = defineProps<{
  showItem: poiItem
}>()

const emit = defineEmits(['reload'])

const isAdmin = () => {
  return parseInt(localStorage.getItem("id") as string, 10) == 1
}
// 删除----------------------------------------------------------------------------------------------------------
const delPoi = () => {
  request.delete(`/secure/user/poi/delete`,{
    params:{
      code: props.showItem.code,
    }
  }).then(res => {
    if (res.data.code === '0') {
      ElMessage({
        type: 'success',
        message: '删除成功',
      });
    } else {
      ElMessage({
        type: 'error',
        message: res.data.msg,
      })
    }
  }).then(()=>{
    if(props.showItem.imageid !== null || props.showItem.imageid != 0){
      request.delete(`/secure/file/image/delete`, {
        params:{
          imageId: props.showItem.imageid
        }
      }).then(res => {
        if (res.data.code === '0') {
          ElMessage({
            type: 'success',
            message: '图片删除成功',
          });
        } else {
          ElMessage({
            type: 'error',
            message: res.data.msg,
          })
        }
      })
    }

  }).finally(()=>{
    emit('reload')
  })

}

// 修改-----------------------------------------------------------------------------------------------------------------
const isModify = ref<boolean>(false);
const tempPoi = ref<poiItem>(JSON.parse(JSON.stringify(props.showItem)));
const modifyPoi = () => {
  tempPoi.value = JSON.parse(JSON.stringify(props.showItem))
  isModify.value = true
}

const discardEdit = () => {
  isModify.value = false
}

const saveEdit = () => {
  debugger
  request.post(`/secure/user/poi/dataupdate`, tempPoi.value).then(res => {
    if (res.data.code === '403') {
      ElMessage.error(res.data.code + res.data.msg);
    }
    else if (res.data.code === '404') {
      ElMessage.error(res.data.code + res.data.msg);
    }
    else {
      ElMessage.success(res.data.msg);
    }
    isModify.value = false
    emit('reload')

  })
}

// 获取图片-------------------------------------------------------------------------------------------------------------
const imgUrl = ref<string>('')
const getImgUrl = (imageid: number) => {
  if(imageid != 0){
    request.get('secure/file/image', {
      params: {
        imageId: props.showItem.imageid
      },
      responseType: 'blob'
    }).then(res => {
      const urlCreator = window.URL || window.webkitURL;
      imgUrl.value = urlCreator.createObjectURL(res.data);
    })
  }

}
// 上传图像----------------------------------------------------------
const imageUrl = ref('')
const handleAvatarSuccess: UploadProps['onSuccess'] = (
    response,
    uploadFile
) => {
  imageUrl.value = URL.createObjectURL(uploadFile.raw!)
  tempPoi.value.imageid = response.data
  saveEdit()
}

// ------------------------------------------------------------------------
watch(()=>props.showItem, (newVal, oldVal) => {
  getImgUrl(newVal.imageid)
},
    {deep: true}
)
</script>

<style scoped>
.avatar-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.el-icon.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
}
</style>