<template>
  <div style="width: 100%; overflow: hidden;">
    <el-card style="width: 60%; margin: 20px auto; border-radius: 8px">
      <div class="profile-card">
        <div class="profile-header">
          <img class="cover-photo" src="/profile_2.png" alt="Cover Photo"/>
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
      </div>
      <div class="image-record">
        <div class="image-container" v-for="image in images" :key="image.id">
          <el-card style="border-radius: 8px">
            <img :src="image.url" :alt="'Image ' + image.id" class="image"/>
          </el-card>
        </div>
      </div>
    </el-card>
  </div>
  <div class="footer">
    <img src="/footer.png" alt="Footer Image" class="footer-image"/>
  </div>
</template>

<script setup>
import {ref, onMounted, reactive} from 'vue';
import {ElMessage} from 'element-plus';
import request from "@/utils/request";
import {useRoute} from 'vue-router';
import {User} from "@element-plus/icons-vue";

let images = ref([]);
const route = useRoute();
let form = reactive({
  username: '未知用户',
  introduction: '暂无个人介绍',
});

onMounted(() => {
  const userId = route.params.id;
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
            imageId: imageObj.id
          },
          responseType: 'blob'
        }).then(response => {
          const url = URL.createObjectURL(response.data);
          images.value.push({id: imageObj.id, url});
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
</script>

<style scoped>
.profile-card {
  width: 100%;
}

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

.image-record {
  column-count: 2;
  column-gap: 10px;
}

.image-container {
  text-align: center;
  border-radius: 16px;
  grid-row-start: auto;
  margin-bottom: 20px;
  break-inside: avoid;
}

.image {
  width: 100%;
  height: auto;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 5px;
}

.footer {
  width: 100%;
  text-align: center;
}

.footer-image {
  width: 25%;
}
</style>
