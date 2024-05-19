<template>
  <div @click="jumpUser(userId)" class="post-user">
    <el-avatar :size="size" shape="circle" class="post-avatar" :style="{ backgroundColor: avatarColor, fontSize: avatarFontSize }">
      {{ usernameInitial }}
    </el-avatar>
    <el-text class="post-username" :style="{ fontSize: usernameFontSize }">{{ username }}</el-text>
  </div>
</template>

<script lang="ts" setup>
import { computed, defineProps, defineEmits } from 'vue';
import router from "@/router";

// 定义传入的 props
const props = defineProps<{
  username: string;
  userId: number;
  size: number;
}>();

// 定义触发的事件
const emit = defineEmits(['jumpUser']);

// 计算用户名的首字母
const usernameInitial = computed(() => props.username.charAt(0).toUpperCase());

// 生成头像背景颜色
const getAvatarColor = (username: string) => {
  const colors = [
    '#f56a00', '#7265e6', '#ffbf00', '#00a2ae', '#d32f2f',
    '#5e35b1', '#039be5', '#00acc1', '#00897b', '#43a047',
    '#7cb342', '#c0ca33', '#fdd835', '#ffb300', '#fb8c00',
    '#f4511e', '#d81b60', '#8e24aa', '#3e2723', '#ff5722',
    '#795548', '#9e9e9e', '#607d8b', '#2e7d32', '#1976d2',
  ];
  const charCode = username.charCodeAt(0) + username.charCodeAt(username.length - 1);
  return colors[charCode % colors.length];
};

// 计算头像背景颜色
const avatarColor = computed(() => getAvatarColor(props.username));

// 计算头像字体大小
const avatarFontSize = computed(() => `${props.size / 2}px`);

// 计算用户名字体大小
const usernameFontSize = computed(() => `${props.size / 1.5}px`);

// 跳转到用户详情页
const jumpUser = (userId: number) => {
  if (userId == parseInt(localStorage.getItem("id") as string, 10)) {
    router.push('/info')
  } else {
    router.push('/userDetail/' + String(userId))
  }
};
</script>

<style scoped>
.post-user {
  display: flex;
  align-items: flex-end;
  gap: 0;
  cursor: pointer;
}

.post-avatar {
  color: #fff;
}

.post-username {
  font-weight: bold;
  text-align: left;
  margin-left: 10px;
}
</style>
