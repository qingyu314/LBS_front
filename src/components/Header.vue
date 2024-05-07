<template>
  <div style="height:50px; line-height: 50px; border-bottom: 1px solid #ccc; display: flex;">
    <el-text type="primary"
             style="width: 200px; padding-left: 30px; font-size: 20px; font-weight: bold; user-select: none">用 户 操 作
    </el-text>
    <div style="flex: 1;"></div>
    <div style="width: 130px;margin:auto">
      <el-dropdown style="display: contents;">
          <div class="el-dropdown-link" style="display: flex;justify-content: center;gap: 6px">
            <el-icon><UserFilled/></el-icon>
            <el-text style="user-select: none">
            {{ Name }}
            </el-text>
            <el-icon><arrow-down/></el-icon>
          </div>
        <template #dropdown>
          <el-dropdown-menu>

            <el-dropdown-item @click="$router.push('/info')">
              <el-icon class="el-icon--left">
                <document/>
              </el-icon>
              账号信息
            </el-dropdown-item>
            <el-dropdown-item @click="$router.push('/login')">
              <el-icon class="el-icon--left">
                <SwitchButton/>
              </el-icon>
              退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
  <router-view></router-view>
</template>
<script lang="ts" setup>
import {ArrowDown, Document, SwitchButton, UserFilled} from "@element-plus/icons-vue";

let Name = sessionStorage.getItem("username") == null ? "未登录" : sessionStorage.getItem("username")

</script>

<style scoped>

</style>