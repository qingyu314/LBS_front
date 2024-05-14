<template>
  <div style="width: 100%; height: 100vh;background: aliceblue; overflow: hidden">
    <div style="width: 400px; margin: 150px auto; display: flex; flex-direction: column; gap: 20px">
      <el-text type="info" style="font-size: 30px;user-select: none">欢迎登录！</el-text>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="auto" style="max-width: 600px">
        <el-form-item prop="username">
          <el-input v-model="form.username" :prefix-icon="User"/>
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="form.password" :prefix-icon="Lock" show-password/>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" style="width: 100%" @click="login">登录</el-button>
        </el-form-item>
        <div style="display: flex;justify-content: center;gap: 10px">
          <el-text size="large" style="user-select: none">没有账号？</el-text>
          <el-text size="large" tag="ins" style="cursor: pointer" @click="$router.push('/register')">点击注册</el-text>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {Lock, User} from "@element-plus/icons-vue";
import request from "@/utils/request";
import {reactive, ref} from "vue";
import {ElMessage} from "element-plus";
import {useRouter} from "vue-router";

let form = ref({
  username: '',
  password: ''
})

let router=useRouter();

const formRef = ref()

let rules = {
  username: [
    {required: true, message: '请输入用户名', trigger: 'blur'},
  ],
  password: [
    {required: true, message: '请输入密码', trigger: 'blur'},
  ]
}

function login() {
  console.log(form)
  formRef.value.validate((valid:boolean) => {
    if (valid) {
      request.post("/user/login", form.value).then(res => {
        if (res.data.code === '0') {
          ElMessage({
            type: "success",
            message: "登录成功"
          })
          sessionStorage.setItem("token", res.data.data)
          const base64Url = res.data.data.split('.')[1]; // 获取 JWT 的第二部分，即 payload
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
              return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          }).join(''));
          sessionStorage.setItem("id", JSON.parse(jsonPayload).id)
          sessionStorage.setItem("username", JSON.parse(jsonPayload).userName)
          sessionStorage.setItem("password", form.value.password)
          router.push({path: '/map'})
        } else {
          ElMessage({
            type: "error",
            message: res.data.msg
          })
        }
      })
    }
  })
}
</script>

<style scoped>

</style>