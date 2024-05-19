<template>
  <div class="is-background">
  <div class="container">
    <div class="error-message">
        <Logo text="诗 远 行" :fontSize="40"/>
      <h1>404</h1>
      <p>找不到页面</p>
      <p>{{ countdown }} 秒后返回首页</p>
      <router-link to="/map" class="home-link">立即返回首页</router-link>
    </div>
  </div>
    <div class="square">
      <ul>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
      </ul>
    </div>
    <div class="circle">
      <ul>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

import '/src/assets/css/background.css'
import Logo from "@/components/Logo.vue";

// 使用 ref 创建一个响应式变量来跟踪倒计时时间
const countdown = ref(10)
// 获取路由实例
const router = useRouter()

onMounted(() => {
  // 设置一个定时器，每秒递减倒计时
  const interval = setInterval(() => {
    countdown.value -= 1
    if (countdown.value <= 0) {
      // 当倒计时结束时，清除定时器并跳转到首页
      clearInterval(interval)
      router.push('/map')
    }
  }, 1000)
})
</script>

<style scoped>
.error-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: white;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.error-message h1 {
  font-size: 6rem;
  margin-bottom: 10px;
  animation: shake 2s infinite;
}

.error-message p {
  font-size: 1.2rem;
}

.home-link {
  display: inline-block;
  margin-top: 20px;
  padding: 10px 20px;
  color: #fff;
  background-color: #007BFF;
  border-radius: 5px;
  text-decoration: none;
  transition: background-color 0.3s;
}

.home-link:hover {
  background-color: #0056b3;
}

/* 动画效果 */
@keyframes shake {
  0%, 25% {
    transform: translateX(0);
  }
  2.5%, 7.5%, 12.5%, 17.5%, 22.5% {
    transform: translateX(-10px);
  }
  5%, 10%, 15%, 20% {
    transform: translateX(10px);
  }
}
</style>
