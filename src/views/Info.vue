<template>
  <div style="width: 100%; height: 100vh; background: aliceblue; overflow: hidden;">
    <el-card style="width: 60%; margin: 20px auto;">
      <div class="profile-card">
        <div class="profile-header">
          <img class="cover-photo" src="/public/profile.png" alt="Cover Photo" />
        </div>
        <div class="profile-content">
          <el-icon :size="80">
            <User />
          </el-icon>
          <div class="user-info">
            <h1 class="username">{{ form.username }}</h1>
            <span>{{ form.introduction || '暂无个人介绍' }}</span>
          </div>
          <el-button type="primary" @click="edit">编辑个人资料</el-button>
        </div>
        <div v-if="editing" class="edit-form">
          <el-form-item label="用户名" class="form-item">
            <el-input v-model="form.username" class="input-right" />
          </el-form-item>
          <el-form-item label="原密码" class="form-item">
            <el-input v-model="form.oldPassword" show-password class="input-right" />
          </el-form-item>
          <el-form-item label="新密码" class="form-item">
            <el-input v-model="form.password" show-password class="input-right" :disabled="!form.oldPassword" />
          </el-form-item>
          <el-form-item label="确认新密码" class="form-item">
            <el-input v-model="form.confirmPassword" show-password class="input-right" :disabled="!form.oldPassword" />
          </el-form-item>
          <el-form-item label="个人介绍" class="form-item">
            <el-input v-model="form.introduction" class="input-right" />
          </el-form-item>
          <div class="form-actions">
            <el-button type="primary" @click="update">保存</el-button>
            <el-button @click="cancel">取消</el-button>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { User } from "@element-plus/icons-vue";
import { reactive, ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import request from "@/utils/request";

let editing = ref(false);
let form = reactive({
  id: sessionStorage.getItem("id"), // 假设用户ID存储在sessionStorage中
  username: sessionStorage.getItem("username"),
  oldPassword: '',
  password: '',
  confirmPassword: '',
  introduction: ''
});

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
});

function edit() {
  editing.value = true;
}

function cancel() {
  editing.value = false;
  form.oldPassword = '';
  form.password = '';
  form.confirmPassword = '';
}

function update() {
  const storedPassword = sessionStorage.getItem("password");

  if (form.oldPassword && form.oldPassword !== storedPassword) {
    ElMessage({
      type: "error",
      message: "原密码不正确"
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

.upload-button {
  position: absolute;
  top: 10px;
  right: 10px;
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
</style>
