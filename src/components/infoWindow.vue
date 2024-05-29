<template>
  <div class="poi-container">
    <el-image v-if="imgUrl!==''" :src="imgUrl" alt="extended information" :preview-src-list="[imgUrl]"
              class="poi-image"/>
    <div v-if="!isModify" class="poi-text">
      <el-text type="primary" size="large">{{ props.showItem.name }}</el-text>
      <br/>
      <el-text type="info">{{ props.showItem.locate }}</el-text>
      <br/>
      <el-text>面积：{{ props.showItem.size }}公顷</el-text>
      <br/>
      <el-text>主要保护对象：{{ props.showItem.protectObject }}</el-text>
      <br/>
      <el-text>类型：{{ props.showItem.type }}</el-text>
      <br/>
      <el-text>级别：{{ props.showItem.level }}</el-text>
      <br/>
      <el-text>始建时间：{{ props.showItem.setTime }}</el-text>
      <br/>
      <el-text>主管部门：{{ props.showItem.department }}</el-text>
      <br/>
      <div v-if="isAdmin()" class="poi-button-group">
        <el-button @click="modifyPoi" :icon="Edit" type="primary"></el-button>
        <el-button @click="delPoi" :icon="Delete" type="danger"></el-button>
      </div>
    </div>
    <div v-else>
      <el-upload
          v-if="imgUrl==''"
          drag
          :headers="authHeaders"
          action="http://localhost:9091/secure/file/upload"
          :before-upload="handleUpload"
          :on-success="handleSuccess"
          :data="dataForm"
          class="upload-demo"
      >
        <el-icon class="el-icon--upload">
          <upload-filled/>
        </el-icon>
        <div class="el-upload__text">
          拖拽图片到这里或 <em>点击上传</em>
        </div>
      </el-upload>
      <el-form :model="tempPoi" :inline="true" label-width="80px">
        <el-form-item label="名称">
          <el-input v-model="tempPoi.name" size="small"/>
        </el-form-item>
        <el-form-item label="行政区域">
          <el-input v-model="tempPoi.locate" size="small"/>
        </el-form-item>
        <el-form-item label="面积(公顷)">
          <el-input v-model="tempPoi.size" size="small"/>
        </el-form-item>
        <el-form-item label="保护对象">
          <el-input v-model="tempPoi.protectObject" size="small"/>
        </el-form-item>
        <el-form-item label="类型">
          <el-input v-model="tempPoi.type" size="small"/>
        </el-form-item>
        <el-form-item label="级别">
          <el-input v-model="tempPoi.level" size="small"/>
        </el-form-item>
        <el-form-item label="始建时间">
          <el-input v-model="tempPoi.setTime" size="small"/>
        </el-form-item>
        <el-form-item label="主管部门">
          <el-input v-model="tempPoi.department" size="small"/>
        </el-form-item>
      </el-form>

      <div v-if="isAdmin()" class="poi-button-group">
        <el-button @click="saveEdit" :icon="DocumentChecked" type="primary"></el-button>
        <el-button @click="discardEdit" :icon="DocumentDelete" type="danger"></el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 修改-----------------------------------------------------------------------------------------------------------

import type {poiItem} from "@/components/selectPoi.vue";
import {ref, watch} from "vue";
import {Delete, DocumentChecked, DocumentDelete, Edit, UploadFilled} from "@element-plus/icons-vue"
import request from "@/utils/request";
import {ElMessage, type UploadProps} from "element-plus";

let authHeaders = {
  Authorization: localStorage.getItem("token")
}

const props = defineProps<{
  showItem: poiItem
}>()

const emit = defineEmits(['reload'])

const isAdmin = () => {
  return parseInt(localStorage.getItem("id") as string, 10) == 1
}
// 删除----------------------------------------------------------------------------------------------------------
const delPoi = () => {
  request.delete(`/secure/user/poi/delete`, {
    params: {
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
  }).then(() => {
    if (props.showItem.imageid != 0) {
      request.delete(`/secure/file/image/delete`, {
        params: {
          imageId: props.showItem.imageid
        }
      }).then(res2 => {
        if (res2.data.code === '0') {
          ElMessage({
            type: 'success',
            message: '图片删除成功',
          });
        } else {
          ElMessage({
            type: 'error',
            message: res2.data.msg,
          })
        }
      })
    }

  }).finally(() => {
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
    if (res.data.code === '403' || res.data.code === '404') {
      ElMessage.error(res.data.code + res.data.msg);
    } else {
      ElMessage.success(res.data.msg);
    }
    isModify.value = false
    emit('reload')

  })
}

// 获取图片-------------------------------------------------------------------------------------------------------------
const imgUrl = ref<string>('')
const getImgUrl = (imageid: number) => {
  if (imageid != 0) {
    request.get('secure/file/image', {
      params: {
        imageId: props.showItem.imageid
      },
      responseType: 'blob'
    }).then(res => {
      const urlCreator = window.URL || window.webkitURL;
      imgUrl.value = urlCreator.createObjectURL(res.data);
    })
  } else {
    imgUrl.value = ''
  }

}
// 上传图像----------------------------------------------------------
const dataForm = ref({
  id: parseInt(localStorage.getItem("id") as string, 10),
  latitude: props.showItem.latitude,
  longitude: props.showItem.longitude,
})
const uploadUrl = ref('')

const handleUpload = () => {
  dataForm.value.latitude = props.showItem.latitude
  dataForm.value.longitude = props.showItem.longitude
}
const handleSuccess: UploadProps['onSuccess'] = (
    response,
    uploadFile
) => {
  uploadUrl.value = URL.createObjectURL(uploadFile.raw!)
  tempPoi.value.imageid = response.data
  saveEdit()
}

// ------------------------------------------------------------------------
watch(() => props.showItem, (newVal, oldVal) => {
      getImgUrl(newVal.imageid)
      isModify.value = false
    },
    {deep: true}
)
</script>

<style scoped>

.poi-container {
  display: flex;
  flex-direction: column;
  margin: 0 20px 20px 5px;
  gap: 10px;
  align-items: flex-start;
  height: auto;
}

.poi-image {
  max-width: 400px !important;
  height: 120px !important;
  width: auto !important;
}

.poi-text {
    white-space: nowrap !important; /* 不换行 */
}

.poi-button-group {
  width: 100%;
  display: flex;
  justify-content: right;
}
</style>