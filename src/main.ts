import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/es/locale/lang/zh-cn'

import baiduMap from 'vue3-baidu-map-gl'
import './assets/css/global.css'

const app = createApp(App)

app.use(router)
app.use(createPinia())
app.use(ElementPlus, {locale: zhCn})

app.use(baiduMap, {
    ak: '4LpKDpaZc508H3cogo6riakgiX9KqyYV',
    plugins: ['TrackAnimation']
})

app.mount('#app')
