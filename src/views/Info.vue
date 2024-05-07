<template>
  <el-card style="width: 80%; margin: 10px 10% auto auto">
    <template #header>
      <div class="card-header">
        <span>个人信息</span>
      </div>
    </template>
    <el-form-item>
      <el-upload
          class="avatar-uploader"
          action="/files/upload"
          :show-file-list="false"
          :data="formData"
          :on-success="handleAvatarSuccess"
          :before-upload="beforeAvatarUpload"
      >
        <img v-if="imageUrl" :src="imageUrl" class="avatar" />
        <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
      </el-upload>
    </el-form-item>
    <el-form-item label="用户名">
      <el-input v-model="form.username" disabled style="width: 80%"/>
    </el-form-item>
    <el-form-item label="密码">
      <el-input v-model="form.password" show-password style="width: 80%"/>
    </el-form-item>
    <div style="text-align: center">
      <el-button type="primary" @click="update">保存</el-button>
    </div>
  </el-card>

</template>

<script lang="ts" setup>
import {reactive, ref} from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

import type { UploadProps } from 'element-plus'
import request from "@/utils/request";

const imageUrl = ref('')

let form = reactive({
  username:'',
  password:''

})
let formData = reactive({
  username:''
})

let username = sessionStorage.getItem("username")
getImgUrl()
function getImgUrl(){
  request.get("/api/secure/user/"+username).then(res=>{
    console.log(res);
    formData.username=form.username
    imageUrl.value = "http://192.168.3.173:9090"+res.data[0].imag
    console.log(imageUrl.value)
  })
}
const handleAvatarSuccess: UploadProps['onSuccess'] = (
    response,
    uploadFile
) => {
  imageUrl.value = URL.createObjectURL(uploadFile.raw!)
}

const beforeAvatarUpload: UploadProps['beforeUpload'] = (rawFile) => {
  if (rawFile.type !== 'image/jpeg') {
    ElMessage.error('Avatar picture must be JPG format!')
    return false
  } else if (rawFile.size / 1024 / 1024 > 2) {
    ElMessage.error('Avatar picture size can not exceed 2MB!')
    return false
  }
  return true
}

function update(){
  request.put("/user", form).then(res => {
    console.log(res)
    if(res.data.code === '0'){
      ElMessage({
        type: "success",
        message: "更新成功"
      })
      sessionStorage.setItem("username", form.username)
    } else {
      ElMessage({
        type:"error",
        message:res.data.msg
      })
    }
  })
}
</script>

<style scoped>
.avatar-uploader .avatar {
  width: 178px;
  height: 178px;
  display: block;
}
</style>

<style>
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
