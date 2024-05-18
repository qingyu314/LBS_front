<template>
  <el-card style="width: 60%; margin: 20px auto; border-radius: 8px">
    <template #header>
      <div class="profile-header">
        <img class="cover-photo" src="/profile_1.png" alt="Cover Photo"/>
      </div>
      <div class="profile-content">
        <el-icon :size="80">
          <User/>
        </el-icon>
        <div class="user-info">
          <h1 class="username">{{ form.username || '未登录' }}</h1>
          <span>{{ form.introduction || '暂无个人介绍' }}</span>
        </div>
        <el-button type="primary" @click="edit">编辑个人资料</el-button>
      </div>
      <div v-if="editing" class="edit-form">
        <el-form-item label="用户名" class="form-item">
          <el-input v-model="form.username"/>
        </el-form-item>
        <el-form-item label="原密码" class="form-item">
          <el-input v-model="form.oldPassword" show-password/>
        </el-form-item>
        <el-form-item label="新密码" class="form-item">
          <el-input v-model="form.password" show-password :disabled="!form.oldPassword"/>
        </el-form-item>
        <el-form-item label="确认新密码" class="form-item">
          <el-input v-model="form.confirmPassword" show-password :disabled="!form.oldPassword"/>
        </el-form-item>
        <el-form-item label="个人介绍" class="form-item">
          <el-input v-model="form.introduction"/>
        </el-form-item>
        <div class="form-actions">
          <el-button type="primary" @click="update">保存</el-button>
          <el-button @click="cancel">取消</el-button>
        </div>
      </div>
    </template>
    <div class="image-record">
      <div class="image-container" v-for="image in images" :key="image.id">
        <el-card shadow="hover" body-style="padding: 10px" @mouseover="showButtons(image.id)"
                 @mouseleave="hideButtons(image.id)" @click="goToMap(image)">
          <el-image :src="image.url" lazy class="image"/>
          <div class="overlay" v-if="image.showButtons">
            <el-button type="danger" :icon="Delete" size="large" @click.stop="confirmDelete(image.id)" class="cover-button"/>
          </div>
        </el-card>
      </div>
    </div>
    <div class="footer">
      <img src="/footer.png" alt="Footer Image" class="footer-image"/>
    </div>
  </el-card>
</template>

<script setup>
import {User, Delete} from "@element-plus/icons-vue";
import {reactive, ref, inject, onMounted} from 'vue';
import {ElMessage, ElMessageBox} from 'element-plus';
import request from "@/utils/request";
import router from "@/router";

import '/src/assets/css/userPage.css'

let editing = ref(false);
let selectedImageId = ref(null);
let images = ref([]);
let form = reactive({
  id: sessionStorage.getItem("id"),
  username: sessionStorage.getItem("username"),
  oldPassword: '',
  password: '',
  confirmPassword: '',
  introduction: ''
});

const userState = inject('userState');

onMounted(() => {
  const userId = sessionStorage.getItem("id");
  request.get(`/secure/user/${userId}`).then(res => {
    if (res.data) {
      form.introduction = res.data.introduction;
      sessionStorage.setItem("introduction", form.introduction);
    } else {
      ElMessage({
        type: "error",
        message: res.data.msg
      });
    }
  });
  loadImages(userId); // 加载图片
});

function loadImages(userId) {
  request.get(`/secure/file/userimage`, {
    params: {id: userId}
  }).then(res => {
    if (res.data) {
      let imageList = res.data;
      imageList.forEach(imageObj => {
        console.log(imageObj);
        request.get(`/secure/file/image`, {
          params: {
            imageId: imageObj.id
          },
          responseType: 'blob'
        }).then(response => {
          const url = URL.createObjectURL(response.data);
          images.value.push({
            id: imageObj.id,
            latitude: imageObj.latitude,
            longitude: imageObj.longitude,
            url,
            showButtons: false
          });
          images.value.sort((a, b) => a.id - b.id); // 按 ID 排序
        }).catch(error => {
          ElMessage({
            type: "error",
            message: `获取图片 ${imageObj.id} 失败: ${error}`
          });
        });
      });
    } else {
      ElMessage({
        type: "error",
        message: res.data.msg
      });
    }
  }).catch(error => {
    ElMessage({
      type: "error",
      message: `获取图片列表失败: ${error}`
    });
  });
}

function confirmDelete(imageId) {
  ElMessageBox.confirm(
    '此操作将永久删除图片及其所有评论，是否继续？',
    '删除图片',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(() => {
      selectedImageId.value = imageId;
      deleteImage();
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: '删除取消',
      })
    })
}

function deleteImage() {
  request.delete(`/secure/file/image/delete`, {
    params: {
      imageId: selectedImageId.value,
      userId: sessionStorage.getItem("id")
    }
  }).then(res => {
    if (res.data.code === '0') {
      ElMessage({
        type: "success",
        message: "删除成功"
      });
      images.value = images.value.filter(image => image.id !== selectedImageId.value);
    } else {
      ElMessage({
        type: "error",
        message: res.data.msg
      });
    }
  }).catch(error => {
    ElMessage({
      type: "error",
      message: `删除图片失败: ${error}`
    });
  });
}

function edit() {
  editing.value = true;
}

function cancel() {
  editing.value = false;
  form.username = sessionStorage.getItem("username");
  form.oldPassword = '';
  form.password = '';
  form.confirmPassword = '';
  form.introduction = sessionStorage.getItem("introduction");
}

function update() {
  if (form.username == '') {
    ElMessage({
      type: "error",
      message: "用户名不能为空"
    });
    return;
  }

  const storedPassword = sessionStorage.getItem("password");

  if (form.oldPassword && form.oldPassword !== storedPassword) {
    ElMessage({
      type: "error",
      message: "原密码不正确"
    });
    return;
  }

  if (form.oldPassword && form.password == '') {
    ElMessage({
      type: "error",
      message: "新密码不能为空"
    });
    return;
  }

  if (form.oldPassword && form.password !== form.confirmPassword) {
    ElMessage({
      type: "error",
      message: "两次输入的新密码不一致"
    });
    return;
  }

  const userUpdate = {
    id: form.id,
    username: form.username,
    introduction: form.introduction
  };

  if (form.oldPassword && form.password) {
    userUpdate.password = form.password;
  }

  request.put("/secure/user/updateuser", userUpdate).then(res => {
    if (res.data.code === '0') {
      ElMessage({
        type: "success",
        message: "更新成功"
      });
      userState.username = form.username;
      sessionStorage.setItem("username", form.username);
      if (form.password) {
        sessionStorage.setItem("password", form.password);
      }
      editing.value = false;
      form.oldPassword = '';
      form.password = '';
      form.confirmPassword = '';
    } else {
      ElMessage({
        type: "error",
        message: res.data.msg
      });
    }
  });
}

function showButtons(imageId) {
  const image = images.value.find(img => img.id === imageId);
  if (image) {
    image.showButtons = true;
  }
}

function hideButtons(imageId) {
  const image = images.value.find(img => img.id === imageId);
  if (image) {
    image.showButtons = false;
  }
}

function goToMap(image) {
  router.push({
    path: '/map',
    query: {
      lat: image.latitude,
      lng: image.longitude,
      index: image.id,
    }
  }).then(() => {
    window.location.reload();
  });
}

</script>

<style scoped>

</style>
