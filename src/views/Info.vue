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
          <el-input v-model="form.username" class="input-right"/>
        </el-form-item>
        <el-form-item label="原密码" class="form-item">
          <el-input v-model="form.oldPassword" show-password class="input-right"/>
        </el-form-item>
        <el-form-item label="新密码" class="form-item">
          <el-input v-model="form.password" show-password class="input-right" :disabled="!form.oldPassword"/>
        </el-form-item>
        <el-form-item label="确认新密码" class="form-item">
          <el-input v-model="form.confirmPassword" show-password class="input-right" :disabled="!form.oldPassword"/>
        </el-form-item>
        <el-form-item label="个人介绍" class="form-item">
          <el-input v-model="form.introduction" class="input-right"/>
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
                 @mouseleave="hideButtons(image.id)">
          <img :src="image.url" :alt="'Image ' + image.id" class="image"/>
          <div class="overlay" v-if="image.showButtons">
            <el-button type="primary" plain :icon="Position" size="large" @click="goToMap(image)" class="cover-button" />
            <el-button type="danger" plain :icon="Delete" size="large" @click="confirmDelete(image.id)" class="cover-button" />
          </div>
        </el-card>
      </div>
    </div>
  <div class="footer">
    <img src="/footer.png" alt="Footer Image" class="footer-image"/>
  </div>
  </el-card>
  <el-dialog title="确定要删除这张图片吗？" v-model="dialogVisible" width="300px" center>
      <span slot="footer" class="dialog-footer" style="display: flex; justify-content: center">
        <el-button type="primary" @click="deleteImage">确定</el-button>
        <el-button @click="dialogVisible = false">取消</el-button>
      </span>
  </el-dialog>
</template>

<script setup>
import {User, Position, Delete} from "@element-plus/icons-vue";
import {reactive, ref, inject, onMounted} from 'vue';
import {ElMessage} from 'element-plus';
import request from "@/utils/request";
import {useRouter} from 'vue-router';

const router = useRouter();
let editing = ref(false);
let dialogVisible = ref(false);
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
        request.get(`/secure/file/image`, {
          params: {
            imageId: imageObj.id
          },
          responseType: 'blob'
        }).then(response => {
          const url = URL.createObjectURL(response.data);
          images.value.push({id: imageObj.id, url, showButtons: false});
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
  selectedImageId.value = imageId;
  dialogVisible.value = true;
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
      dialogVisible.value = false;
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
      id: image.id,
      lat: image.lat,
      lng: image.lng,
    }
  });
}
</script>

<style scoped>
.profile-header {
  position: relative;
  height: 350px;
  background-color: #ccc;
}

.cover-photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-content {
  display: flex;
  align-items: flex-end;
  padding: 20px;
}

.user-info {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  padding: 10px;
  gap: 10px;
}

.username {
  margin: 0;
  font-size: 24px;
  font-weight: bold;
}

.edit-form {
  padding: 20px;
}

.form-item {
  margin-bottom: 20px;
  width: 100%;
}

.input-right input {
  text-align: right;
}

.form-actions {
  text-align: center;
  margin-top: 20px;
}

.image-record {
  column-count: 2;
  column-gap: 10px;
}

.image-container {
  position: relative;
  text-align: center;
  border-radius: 16px;
  grid-row-start: auto;
  margin-bottom: 20px;
  break-inside: avoid;
}

.image {
  width: 100%;
  height: auto;
  border-radius: 4px;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(145deg, rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.1));
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  padding-top: 15px;
  padding-right: 20px;
  gap: 10px;
  opacity: 0;
  border-radius: 4px;
}

.image-container:hover .overlay {
  opacity: 1;
}

.cover-button {
  width: 2vw;
  height: 2vw;
  border-radius: 25%;
  opacity: 0.75;
}

.footer {
  width: 100%;
  text-align: center;
}

.footer-image {
  width: 40%;
}
</style>
