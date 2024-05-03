<template>
  <div style="height:50px; line-height: 50px; border-bottom: 1px solid #ccc; display: flex;">
    <div style="width: 200px; padding-left: 30px; font-weight: bold; color: skyblue;">用 户 操 作</div>
    <div style="flex: 1;"></div>
    <div style="width: 100px;">
      <el-dropdown style="display: contents;">
          <span class="el-dropdown-link">
            <el-icon><UserFilled /></el-icon>
<!--            {{ Name }}-->
            ***
            <el-icon class="el-icon--right">
              <arrow-down/>
            </el-icon>
          </span>
        <template #dropdown>
          <el-dropdown-menu>

            <el-dropdown-item @click="$router.push('/info')">
              <el-icon class="el-icon--left"><document /></el-icon>
              账号信息
            </el-dropdown-item>
            <el-dropdown-item @click="$router.push('/login')">
              <el-icon class="el-icon--left"><SwitchButton /></el-icon>
              退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>
<script lang="ts" setup>
import {ArrowDown, Document, SwitchButton, UserFilled} from "@element-plus/icons-vue";

// let Name = JSON.parse(sessionStorage.getItem("user")||{}).data.nickName;


</script>

<style scoped>

</style>