<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

// 使用 ref 创建一个响应式变量来跟踪倒计时时间
const countdown = ref(5)
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

<template>
  <div>
    <p>404 找不到界面</p>
    <p>{{ countdown }} 秒后返回首页</p>
    <router-link to="/map">立即返回首页</router-link>
  </div>
</template>

<style scoped>
/* 这里可以添加一些样式 */
</style>
