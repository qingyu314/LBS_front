<template>
  <div style="width: 100%; height: 100vh;background: aliceblue; overflow: hidden">
    <div style="width: 400px; margin: 150px auto; display: flex; flex-direction: column; gap: 20px">
      <el-text type="info" style="font-size: 30px;user-select: none">欢迎注册！</el-text>
      <el-form :model="form" ref="formRef" :rules="rules" label-width="auto" style="max-width: 600px">
        <el-form-item prop="username">
          <el-input :prefix-icon="User" v-model="form.username" />
        </el-form-item>
        <el-form-item prop="password">
          <el-input :prefix-icon="Lock" v-model="form.password" show-password />
        </el-form-item>
        <el-form-item prop="confirm">
          <el-input :prefix-icon="Key" v-model="form.confirm" show-password />
        </el-form-item>
        <el-form-item>
          <el-button style="width: 100%" type="primary" @click="register">注册</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {User, Lock, Key} from "@element-plus/icons-vue";
import request from "@/utils/request";
import {reactive, ref} from "vue";
import {ElMessage} from "element-plus";
import {useRouter} from "vue-router";

let form=reactive({
  username: '',
  password: '',
  confirm: ''
})
const formRef = ref()
let router=useRouter()
let rules= {
  username: [
    {required: true, message: '请输入用户名', trigger: 'blur'},
  ],
  password: [
    {required: true, message: '请输入密码', trigger: 'blur'},
    {min: 6, max: 15, message: '长度在6和15之间！', trigger: 'blur'},
  ],
  confirm: [
    {required: true, message: '请确认密码', trigger: 'blur'},
    {min: 6, max: 15, message: '长度在6和15之间！', trigger: 'blur'},
  ]
}
function register() {
  formRef.value.validate((valid:boolean) => {
    if (valid) {
      if (form.password !== form.confirm) {
        ElMessage({
          type: "error",
          message: "两次输入密码不一致"
        })
        return
      }
      request.post("/member", form).then(res => {
        if (res.data.code === '0') {
          ElMessage({
            type: "success",
            message: "注册成功"
          })
          router.push({path: '/login'})
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