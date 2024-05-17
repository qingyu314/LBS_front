<template>
  <div class="is-background">
    <div class="container">
      <div class="box signup">
        <Logo text="诗 远 行" :fontSize="40"/>
        <el-form ref="formRef" :model="form" :rules="signupRules" label-width="auto">
          <el-form-item prop="username">
            <el-input v-model="form.username" :prefix-icon="User"/>
          </el-form-item>
          <el-form-item prop="password">
            <el-input v-model="form.password" :prefix-icon="Lock" show-password/>
          </el-form-item>
          <el-form-item prop="confirm">
            <el-input v-model="form.confirm" :prefix-icon="Key" show-password/>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" style="width: 100%" @click="signup">注册</el-button>
          </el-form-item>
          <el-form-item>
            <el-button style="width: 100%" click="toggleForm" name="gologin">返回</el-button>
          </el-form-item>
        </el-form>
      </div>
      <div class="box login">
        <Logo text="诗 远 行" :fontSize="40"/>
        <el-form ref="formRef" :model="form" :rules="loginRules" label-width="auto">
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
            <el-text size="large" tag="ins" style="cursor: pointer" click="toggleForm" name="gosignup">点击注册</el-text>
          </div>
        </el-form>
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

<script lang="ts" setup>import {User, Lock, Key} from "@element-plus/icons-vue";
import request from "@/utils/request";
import {onMounted, reactive, ref} from "vue";
import {ElMessage} from "element-plus";
import {useRouter} from "vue-router";
import Logo from "@/components/Logo.vue";

let form = reactive({
  username: '',
  password: '',
  confirm: ''
})
const formRef = ref()
let router = useRouter()

let loginRules = {
  username: [
    {required: true, message: '请输入用户名', trigger: 'blur'},
  ],
  password: [
    {required: true, message: '请输入密码', trigger: 'blur'},
  ]
}

let signupRules = {
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

onMounted(() => {
  let loginbox = document.querySelector(".login");
  let signupbox = document.querySelector(".signup");
  let gos = document.getElementsByName("gosignup")[0];
  let gol = document.getElementsByName("gologin")[0];
  // 点击去注册，触发事件
  gos.addEventListener("click", () => {
    loginbox.style.transform = "rotateY(180deg)";
    signupbox.style.transform = "rotateY(0deg)";
    loginbox.style.zIndex = "1";
    signupbox.style.zIndex = "2";
  form.username = '';
  form.password = '';
  form.confirm = '';
  });
  // 点击去登录，触发事件
  gol.addEventListener("click", () => {
    signupbox.style.transform = "rotateY(-180deg)";
    loginbox.style.transform = "rotateY(0deg)";
    signupbox.style.zIndex = "1";
    loginbox.style.zIndex = "2";
  form.username = '';
  form.password = '';
  form.confirm = '';
  });
})

function login() {
  formRef.value.validate((valid: boolean) => {
    if (valid) {
      request.post("/user/login", {username: form.username, password: form.password}).then(res => {
        if (res.data.code === '0') {
          ElMessage({
            type: "success",
            message: "登录成功"
          })
          sessionStorage.setItem("token", res.data.data)
          const base64Url = res.data.data.split('.')[1]; // 获取 JWT 的第二部分，即 payload
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          }).join(''));
          sessionStorage.setItem("id", JSON.parse(jsonPayload).id)
          sessionStorage.setItem("username", JSON.parse(jsonPayload).userName)
          sessionStorage.setItem("password", form.password)
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

function signup() {
  formRef.value.validate((valid: boolean) => {
    if (valid) {
      if (form.password !== form.confirm) {
        ElMessage({
          type: "error",
          message: "两次输入密码不一致"
        })
        return
      }
      request.post("/user/save", {username: form.username, password: form.password}).then(res => {
        if (res.data.code === '0') {
          ElMessage({
            type: "success",
            message: "注册成功"
          })
          toggleForm();
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
.container {
  z-index: 1;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -80%);
  width: 400px;
  height: 500px;
}

.box {
  position: absolute;
  top: 0px;
  left: 0px;
  width: 400px;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  background: white;
  display: flex;
  flex-direction: column;
  padding: 10px;
  gap:10px;
  user-select: none;
  backface-visibility: hidden;
  transition: all .5s;
}

.signup {
  transform: rotateY(-180deg);
}

.is-background {
  /* 100%窗口高度 */
  height: 100vh;
  /* 弹性布局 居中 */
  display: flex;
  justify-content: center;
  align-items: center;
  /* 渐变背景 */
  background: linear-gradient(160deg, #dceafe, #91cdf1);
  /* 溢出隐藏 */
  overflow: hidden;
}

ul li {
  position: absolute;
  border: 1px solid #fff;
  background-color: #fff;
  width: 30px;
  height: 30px;
  list-style: none;
  opacity: 0;
}

.square li {
  top: 60vh;
  left: 60vw;
  /* 执行动画：动画名 时长 线性的 无限次播放 */
  animation: square 10s linear infinite;
}

.square li:nth-child(2) {
  top: 80vh;
  left: 10vw;
  /* 设置动画延迟时间 */
  animation-delay: 2s;
}

.square li:nth-child(3) {
  top: 80vh;
  left: 85vw;
  /* 设置动画延迟时间 */
  animation-delay: 4s;
}

.square li:nth-child(4) {
  top: 5vh;
  left: 70vw;
  /* 设置动画延迟时间 */
  animation-delay: 6s;
}

.square li:nth-child(5) {
  top: 10vh;
  left: 10vw;
  /* 设置动画延迟时间 */
  animation-delay: 8s;
}

.circle li {
  bottom: 0;
  left: 20vw;
  /* 执行动画 */
  animation: circle 10s linear infinite;
}

.circle li:nth-child(2) {
  left: 35vw;
  /* 设置动画延迟时间 */
  animation-delay: 2s;
}

.circle li:nth-child(3) {
  left: 55vw;
  /* 设置动画延迟时间 */
  animation-delay: 6s;
}

.circle li:nth-child(4) {
  left: 75vw;
  /* 设置动画延迟时间 */
  animation-delay: 4s;
}

.circle li:nth-child(5) {
  left: 90vw;
  /* 设置动画延迟时间 */
  animation-delay: 8s;
}

/* 定义动画 */
@keyframes square {
  0% {
    transform: scale(0) rotateY(0deg);
    opacity: 1;
  }
  100% {
    transform: scale(5) rotateY(1000deg);
    opacity: 0;
  }
}

@keyframes circle {
  0% {
    transform: scale(0) rotateY(0deg);
    opacity: 1;
    bottom: 0;
    border-radius: 0;
  }
  100% {
    transform: scale(5) rotateY(1000deg);
    opacity: 0;
    bottom: 90vh;
    border-radius: 50%;
  }
}
</style>