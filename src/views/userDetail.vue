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
      </div>
    </template>
    <div class="image-record">
      <div class="image-container" v-for="image in images" :key="image.id">
        <el-card shadow="hover" body-style="padding: 10px" @mouseover="showButtons(image.id)"
                 @mouseleave="hideButtons(image.id)" @click="goToMap(image)">
          <el-image :src="image.url" lazy class="image"/>
          <div class="overlay" v-if="image.showButtons">
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
import {User} from "@element-plus/icons-vue";
import {reactive, ref, onMounted} from 'vue';
import {ElMessage} from 'element-plus';
import request from "@/utils/request";
import {useRoute} from 'vue-router';
import router from "@/router";

import '/src/assets/css/userPage.css'

let images = ref([]);
let form = reactive({
  username: '未知用户',
  introduction: '暂无个人介绍',
});

onMounted(() => {
  const userId = useRoute().params.id;
  request.get(`/secure/user/${userId}`).then(res => {
    if (res.data) {
      form.username = res.data.username;
      form.introduction = res.data.introduction;
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
            imageId: imageObj.id,
          },
          responseType: 'blob'
        }).then(response => {
          const url = URL.createObjectURL(response.data);
          images.value.push({
            id: imageObj.id,
            latitude: imageObj.latitude,
            longitude: imageObj.longitude, url
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
