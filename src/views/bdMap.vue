<template>
  <div style="display: flex">
    <el-menu
        :collapse="isCollapse"
        style="min-height: calc(100vh - 50px);"
    >
      <div style="margin: 10px auto auto 10px">
        <el-button :icon="Fold" plain type="info" @click="changeMode"></el-button>
      </div>
      <el-menu-item index="1">
        <el-icon><Location/></el-icon>
        <template #title>
          <el-button plain type="info" @click="getLoc">自身位置</el-button>
        </template>
      </el-menu-item>

      <el-menu-item index="2">
        <el-icon><Notification/></el-icon>
        <template #title>
          <el-button plain type="info" @click="add">添加贴图</el-button>
        </template>
      </el-menu-item>

      <el-menu-item index="3">
        <el-icon><ChatDotSquare/></el-icon>
        <template #title>
          <el-button plain type="info" @click="dotShow">查看贴图</el-button>
        </template>
      </el-menu-item>
      <el-sub-menu index="4">
        <template #title>
          <el-icon><Setting/></el-icon>
          <span>地图设置</span>
        </template>
        <mapOption v-model="mapSetting"/>
      </el-sub-menu>
      <el-menu-item index="5">
        <el-icon><Guide /></el-icon>
        <template #title>
          <span @click="router.push('/poi')">POI跳转</span>
        </template>
      </el-menu-item>
    </el-menu>

    <div style="flex: 1">
      <div v-if="!isLoadingLoc && !isError" class="location-container">

          <div class="location-details">
            <el-text size="large" type="primary">定位:</el-text>
            <el-text>
              城市 - {{ location.address?.province }}-{{ location.address?.city }}-{{ location.address?.district }}-{{ location.address?.street }}
              <br/>
              <span>定位精度 - {{ location.accuracy }}m</span>
            </el-text>
          </div>

          <div class="coordinates">
            <span>纬度 - {{ location.point?.lat }}</span>
            <br/>
            <span>经度 - {{ location.point?.lng }}</span>
          </div>

        <span>定位精度 - {{ location.accuracy }}m</span>
      </div>
      <div v-else-if="isError" class="location-container">
        <el-text size="large" type="danger">
          出错了，{{ status }}
        </el-text>
      </div>
      <div v-else class="location-container">
        <el-text type="info">
          定位中...
        </el-text>
      </div>

      <BMap
          ref="map"
          :center="location.point || undefined"
          :enableContinuousZoom="mapSetting.enableContinuousZoom"
          :enableDoubleClickZoom="mapSetting.enableDoubleClickZoom"
          :enableDragging="mapSetting.enableDragging"
          :enableInertialDragging="mapSetting.enableInertialDragging"
          :enableKeyboard="mapSetting.enableKeyboard"
          :enablePinchToZoom="mapSetting.enablePinchToZoom"
          :enableScrollWheelZoom="mapSetting.enableScrollWheelZoom"
          :enableTraffic="mapSetting.enableTraffic"
          :heading="0"
          :mapType="mapSetting.type"
          :minZoom="3"
          :tilt="45"
          :zoom="19"
          height="700px"
          v-bind="$attrs"

          @click="handleClick"
          @initd="handleInitd"
      >
        <template v-if="!isLoadingLoc">
          <BMarker :position="location.point"></BMarker>
          <BCircle
              :center="location.point"
              :fillOpacity="0.5"
              :radius="location.accuracy"
              :strokeOpacity="0.8"
              fillColor="#0099ff"
              strokeColor="#0099ff"
              strokeStyle="solid"
          />
        </template>
        <!--      标点-->
        <template v-if="!isLoadingGeo && !isEmpty">
          <BMarker :position="point"></BMarker>
          <BLabel
              :content="`地址: ${result?.address} 所属商圈:${result?.business} 最匹配地点: ${
            result?.surroundingPois[0]?.title || '无'
          }`"
              :position="result.point"
              style="color: #333; font-size: 9px"
          />
        </template>
        <BMarker
            v-for="(item, index) in cardList"
            :position="item.position"
            enableClicking
            @click="() => clickDot(item)"
        />
        <BInfoWindow
            v-model:show="show"
            :offset="{
        x: 0,
        y: -10
      }"
            :position="position"
            enableAutoPan
            enableCloseOnClick
        >
          <el-form label-width="auto" style="max-width: 600px">
            <el-form-item label="Name">
              <el-text @click="jumpUser(showItem.userId)">{{ showItem.username }}</el-text>
            </el-form-item>
            <el-form-item label="评论">
              <el-text>{{ showItem.comment }}</el-text>
            </el-form-item>
            <el-form-item label="图片">
              <el-image :src="showItem.imgUrl"/>
            </el-form-item>
          </el-form>

        </BInfoWindow>
      </BMap>
      <el-dialog
          v-model="dialogVisible"
          title="上传贴图"
          width="50%"
      >
        <el-form-item label="评论">
          <el-input v-model="cmtUpload" placeholder="请输入您的评论" type="textarea"/>
        </el-form-item>
        <el-upload
            ref="uploadRef"
            v-model:file-list="fileList"
            :auto-upload="false"
            :before-upload="beforeUpload"
            :data="dataForm"
            :headers="authHeaders"
            :on-preview="handlePictureCardPreview"
            :on-remove="handleRemove"
            :on-success="handleSuccess"
            action="http://192.168.43.105:9091/secure/file/upload"
            drag="true"
            list-type="picture-card"
            multiple
        >
          <el-icon>
            <Plus/>
          </el-icon>
        </el-upload>

        <el-dialog v-model="previewVisible">
          <img :src="dialogImageUrl" alt="Preview Image" w-full/>
        </el-dialog>
        <template #footer>
          <el-button style="width: 150px; height: 50px" type="primary" @click="submitUpload">上传</el-button>
        </template>

      </el-dialog>
    </div>
  </div>
</template>

<script lang="ts" setup>

import {ChatDotSquare, Fold, Location, Notification, Plus, Setting, Guide} from "@element-plus/icons-vue";
import {onMounted, ref, type UnwrapRef, watch} from "vue";
import {
  BCircle,
  BInfoWindow,
  BLabel,
  BMap,
  BMarker,
  type MapProps,
  type MapType,
  type PointGeocoderResult,
  useBrowserLocation,
  usePointGeocoder,
} from "vue3-baidu-map-gl";
import request from "@/utils/request";
import {ElMessage, type FormProps, type UploadInstance, type UploadProps, type UploadUserFile} from "element-plus";
import router from "@/router";
import MapOption from "@/components/mapOption.vue";
// 初始化-------------------------------------------------------------------------
let authHeaders = {
  Authorization: sessionStorage.getItem("token")
}
const map = ref()
interface allSettings {
  enableDragging: boolean,
  enableInertialDragging: boolean,
  enableScrollWheelZoom: boolean,
  enableContinuousZoom: boolean,
  enableResizeOnCenter: boolean,
  enableDoubleClickZoom: boolean,
  enableKeyboard: boolean,
  enablePinchToZoom: boolean,
  enableAutoResize: boolean,
  enableTraffic: boolean,
  type: MapType
}
let mapSetting = ref<allSettings>({
  enableDragging: true,
  enableInertialDragging: true,
  enableScrollWheelZoom: true,
  enableContinuousZoom: true,
  enableResizeOnCenter: true,
  enableDoubleClickZoom: false,
  enableKeyboard: true,
  enablePinchToZoom: true,
  enableAutoResize: true,
  enableTraffic: false,
  type: 'BMAP_NORMAL_MAP'
})

// 改变侧边栏展示模式-------------------------------------------------------------------------------------------
const isCollapse = ref<boolean>(true)
const changeMode = () => {
  isCollapse.value = !isCollapse.value
}
// 浏览器定位----------------------------------------------------------------------------------------------------------------
let point = ref({lng: 116.30793520652882, lat: 40.05861561613348})
const {get: getLoc, location, isLoading: isLoadingLoc, isError, status} = useBrowserLocation(null, () => {
  map.value.resetCenter()
})

function handleInitd() {
  getLoc()
}

// 标点----------------------------------------------------------------------------------------------------------------
const markerPoint = point
const dataForm = ref({
  id: parseInt(sessionStorage.getItem("id"), 10),
  latitude: markerPoint.value.lat,
  longitude: markerPoint.value.lng,
})
const cmtUpload = ref<string>('')
const {get: getGeo, result, isLoading: isLoadingGeo, isEmpty} = usePointGeocoder<PointGeocoderResult>(null, () => {
  console.log(result.value)
})

function handleClick(e) {
  markerPoint.value = e.latlng
  console.log(markerPoint.value)
  dataForm.value.latitude = markerPoint.value.lat
  dataForm.value.longitude = markerPoint.value.lng
  getGeo(e.latlng)
}

// 监视------------------------------------------------------------------------------------------------------------
watch(location, (newLocation, oldLocation) => {
  if (newLocation) {
    point.value = newLocation.point
    getGeo(newLocation.point)
    markerPoint.value = newLocation.point
  }
})
// 上传相关--------------------------------------------------------------------------------------------------
// 注意：这里的form可能要删除，功能可能和dataForm重合
const fileList = ref<UploadUserFile[]>([])
const dialogImageUrl = ref('')
const previewVisible = ref(false)
let dialogVisible = ref(false)

// 添加贴图按钮--------------------------------------------------------------------------------------------
const add = () => {
  cmtUpload.value = '';
  fileList.value = [];
  dialogVisible.value = true;
}

const handleRemove: UploadProps['onRemove'] = (uploadFile, uploadFiles) => {
  console.log(uploadFile, uploadFiles)
}
const handlePictureCardPreview: UploadProps['onPreview'] = (uploadFile) => {
  dialogImageUrl.value = uploadFile.url!
  previewVisible.value = true
}
const beforeUpload: UploadProps['beforeUpload'] = (rawFile) => {
  if (rawFile.type !== 'image/jpeg' && rawFile.type !== 'image/png' && rawFile.type !== 'image/bmp' && rawFile.type !== 'image/gif') {
    ElMessage.error('上传的图片必须要是 JPG/PNG/BMP/GIF 格式!')
    return false
  }
  return true
}

function handleSuccess(response: any) {
  console.log(cmtUpload.value)
  request.post('/secure/file/comment/add', {
    userid: parseInt(sessionStorage.getItem("id"), 10),
    contain: cmtUpload.value,
    imageid: response.data,
  })
}

const uploadRef = ref<UploadInstance>()
const submitUpload = () => {
  console.log(fileList.value)
  uploadRef.value!.submit()
}

// 一个范围内的贴图查询-----------------------------------------------------------------------------------------------------------------
let distance = ref(100000)
const url = ref('')

interface cardItem {
  userId: string,
  username: string,
  comment: string,
  imgUrl: string,
  position: { lat: number, lng: number }
}

const cardList = ref<cardItem[]>([])
const labelPosition = ref<FormProps['labelPosition']>('left')
const dotShow = () => {
  getImgSec()
}
const getImgSec = () => {
  cardList.value = []
  request.get('secure/file/locate', {  // 确保URL与后端设置的路由一致
    params: {
      longitude: point.value.lng,
      latitude: point.value.lat,
      radius: distance.value
    },
  }).then(res => {
    for (let i = 0; i < res.data.length; i++) {
      let resObj = res.data[i];
      let cardForm = {
        comment: '',
        userId: resObj.userId,
        username: '',
        imgUrl: '',
        position: {lat: 0, lng: 0},
      }
      let cnt = 0

      request.get('secure/user/' + res.data[i].userId).then((res1) => {
        cardForm.username = res1.data.username
        cardForm.position = {lat: resObj.latitude, lng: resObj.longitude}
      }).then(() => {
        request.get('secure/file/image', {
          params: {
            imageId: resObj.id
          },
          responseType: 'blob'
        }).then(res2 => {
          const urlCreator = window.URL || window.webkitURL;
          url.value = urlCreator.createObjectURL(res2.data);  // 创建一个临时URL用于图片显示
          cardForm.imgUrl = url.value
        }).then(() => {
          request.get('secure/file/comments', {
            params: {
              imageid: resObj.id
            }
          }).then((res3) => {
            if (res3.data && res3.data.length > 0 && res3.data[0].contain !== undefined) {
              cardForm.comment = res3.data[0].contain;
            } else {
              cardForm.comment = '无评论';
            }
          }).catch((error) => {
            console.error('Error fetching comments:', error);
            cardForm.comment = '无评论';
          }).then(() => {
            cardList.value.push(cardForm)
            cnt++
          })
        })
      })
    }
  }).then(() => {
    console.log(cardList.value)
  })
}
// 在地图上显示贴图卡片----------------------------------------------------------------------------------------------------
const position = ref()
const show = ref<boolean>(false)
const showItem = ref({
  userId: 0,
  username: '',
  comment: '',
  imgUrl: '',
  position: {lat: 0, lng: 0},
})

function clickDot(item: UnwrapRef<typeof cardList>[0]) {
  position.value = item.position
  showItem.value = JSON.parse(JSON.stringify(item))
  if (!show.value) show.value = true
}

// 跳转到用户详情页----------------------------------------------------------------------------------
function jumpUser(id: number) {
  if (id == parseInt(sessionStorage.getItem("id"), 10)) {
    router.push('/info')
  } else {
    router.push('/userDetail/' + String(id))
  }
}
// 进入楼层
const enterComments = (imageId: number) => {

}
onMounted(() => {
  console.log(sessionStorage.getItem("username"))
})
</script>
<style scoped>
.location-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.location-details, .coordinates {
  margin-top: 20px;
}
</style>