<template>
  <header class="app-header">
    <Logo text="诗 远 行" :fontSize="30"/>
    <nav class="nav">
      <ul class="nav-list">
        <li class="nav-item">
          <el-text class="nav-link" @click="$router.push('/map')" style="cursor: pointer">首页</el-text>
        </li>
      </ul>
    </nav>
    <div style="flex: 1;"></div>
    <div style="width: 130px;margin:auto">
      <el-dropdown style="display: contents;">
          <div class="el-dropdown-link" style="display: flex;justify-content: center;gap: 6px">
            <el-icon size="18px"><UserFilled/></el-icon>
            <el-text style="user-select: none;font-size: 18px">
            {{ userState.username }}
            </el-text>
            <el-icon size="18px" ><arrow-down/></el-icon>
          </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="$router.push('/info')">
              <el-icon class="el-icon--left">
                <document/>
              </el-icon>
              账号信息
            </el-dropdown-item>
            <el-dropdown-item @click="logout">
              <el-icon class="el-icon--left">
                <SwitchButton/>
              </el-icon>
              退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </header>
  <router-view></router-view>
</template>

<script lang="ts" setup>
import {ArrowDown, Document, SwitchButton, UserFilled} from "@element-plus/icons-vue";
import { reactive, provide } from 'vue';
import Logo from '@/components/Logo.vue';

// 创建一个响应式对象来存储全局状态
const userState = reactive({
  username: localStorage.getItem("username") || '未登录',
});

// 使用 provide 提供全局状态
provide('userState', userState);

function logout() {
  // 清除 localStorage 中的用户相关数据
  localStorage.removeItem('id');
  localStorage.removeItem('username');
  localStorage.removeItem('password');
  localStorage.removeItem('introduction');

  // 成功注销后重定向到登录页面
  window.location.href = '/login';
}
</script>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  padding: 10px 20px;
  background-color: white;
  border-bottom: 1px solid #eaeaea;
}

.nav {
  width: 100px;
  display: flex;
  justify-content: center;
}

.nav-list {
  display: flex;
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-item {
  margin-right: 20px;
}

.nav-link {
  text-decoration: none;
  color: #666;
  font-size: 18px;
}

.nav-link:hover {
  color: #000;
}

.nav-link:focus,
.nav-link:active {
  color: #000;
}
</style>