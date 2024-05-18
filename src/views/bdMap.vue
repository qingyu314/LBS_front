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
        <el-icon>
          <Location/>
        </el-icon>
        <template #title>
          <el-button plain type="info" @click="getLoc">自身位置</el-button>
        </template>
      </el-menu-item>

      <el-menu-item index="2">
        <el-icon>
          <Notification/>
        </el-icon>
        <template #title>
          <el-button plain type="info" @click="add">添加贴图</el-button>
        </template>
      </el-menu-item>

      <el-menu-item index="3">
        <el-icon>
          <ChatDotSquare/>
        </el-icon>
        <template #title>
          <el-dropdown>
            <span class="el-dropdown-link">
              <el-button plain type="info" @click="()=>getImgSec()">查看贴图</el-button>
              <el-icon class="el-icon--right">
                <arrow-down/>
              </el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item style="height: 200px">
                  <el-slider v-model="distance" max="40000" show-input size="small" vertical/>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
      </el-menu-item>
      <el-sub-menu index="4">
        <template #title>
          <el-icon>
            <Setting/>
          </el-icon>
          <span>地图设置</span>
        </template>
        <mapOption v-model="mapSetting"/>
      </el-sub-menu>
      <el-menu-item index="5">
        <el-icon>
          <Guide/>
        </el-icon>
        <template #title>
          <span @click="router.push('/poi')">自然保护区</span>
        </template>
      </el-menu-item>
    </el-menu>

    <div style="flex: 1">
      <div v-if="useOuterPoint" class="location-container">
        <div class="location-details">
          <el-text size="large" type="primary">当前位置</el-text>
          <el-text>
            城市 - {{ result?.addressComponents.province }}-{{
              result?.addressComponents.city
            }}-{{ result?.addressComponents.district }}-{{ result?.addressComponents.street }}
            <br/>
          </el-text>
        </div>
        <div class="coordinates">
          <span>纬度 - {{ result?.point.lat }}</span>
          <br/>
          <span>经度 - {{ result?.point.lng }}</span>
        </div>
      </div>
      <div v-else-if="!isLoadingLoc && !isError" class="location-container">

        <div class="location-details">
          <el-text size="large" type="primary">定位:</el-text>
          <el-text>
            城市 - {{ location.address?.province }}-{{ location.address?.city }}-{{
              location.address?.district
            }}-{{ location.address?.street }}
            <br/>
            <span>定位精度 - {{ location.accuracy }}m</span>
          </el-text>
        </div>

        <div class="coordinates">
          <span>纬度 - {{ location.point?.lat }}</span>
          <br/>
          <span>经度 - {{ location.point?.lng }}</span>
        </div>

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
          :center="centerPoint || undefined"
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

          @click="clickMap"
          @initd="handleInitd"
      >
        <template v-if="!isLoadingLoc">
          <BMarker :icon="'loc_blue'" :position="location.point"></BMarker>
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
          <BMarker :position="point" :visible="visible"></BMarker>
          <BLabel
              :content="`地址: ${result?.address} 所属商圈:${result?.business} 最匹配地点: ${
            result?.surroundingPois[0]?.title || '无'
          }`"
              :position="<Point>result?.point"
              :visible="visible"
              style="color: #333; font-size: 9px"
          />
        </template>
        <!--        显示列表中的位置-->
        <template v-if="!loadImgDot">
          <BMarker
              v-for="(item, index) in cardList"
              :position="item.position"
              enableClicking
              @click="(event) => clickDot(item, event)"
          />
          <BInfoWindow
              v-model:show="showDot"
              :offset="{
                x: 0,
                y: -10
              }"
              :position="position"
              enableAutoPan
              enableCloseOnClick
          >
            <el-form v-if="!loadImgDot" label-width="auto" style="max-width: 600px">
              <el-form-item label="Name">
                <el-text @click="jumpUser(showItem.userId)">{{ showItem.username }}</el-text>
              </el-form-item>
              <el-form-item label="评论">
                <el-text>{{ showItem.comment }}</el-text>
              </el-form-item>
              <el-form-item label="图片">
                <el-image :src="showItem.imgUrl"/>
              </el-form-item>
              <el-form-item size="small">
                <el-button @click="enterComments(showItem.imageId, showItem.cmtId, showItem.userId, showItem.imgUrl)">
                  进入楼层
                </el-button>
              </el-form-item>
            </el-form>
          </BInfoWindow>
        </template>
        <BControl :offset="{ x: 0, y: 0 }" anchor="BMAP_ANCHOR_TOP_RIGHT"
                  style=" padding: 10px"
        >
          <span class="container">经度： {{ result?.point.lng }}</span>
          <span class="container">纬度： {{ result?.point.lat }}</span>
        </BControl>
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
            action="http://localhost:9091/secure/file/upload"
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
    <div v-if="drawer">
      <cmtDrawer v-model:drawer="drawer" v-bind:info="drawerInfo" @syncBackendChanges="handleSyncBackendChanges"/>
    </div>

  </div>
</template>

<script lang="ts" setup>

import {ChatDotSquare, Fold, Location, Notification, Plus, Setting, Guide, ArrowDown} from "@element-plus/icons-vue";
import {onMounted, ref, type UnwrapRef, watch} from "vue";
import {
  BCircle, BControl,
  BInfoWindow,
  BLabel,
  BMap,
  BMarker,
  type MapType, type Point,
  type PointGeocoderResult,
  useBrowserLocation, type UseBrowserLocationOptions,
  usePointGeocoder,
} from "vue3-baidu-map-gl";
import request from "@/utils/request";
import {ElMessage, type UploadInstance, type UploadProps, type UploadUserFile} from "element-plus";
import router from "@/router";
import {useRoute} from "vue-router";
import MapOption from "@/components/mapOption.vue";
import CmtDrawer from "@/components/cmtDrawer.vue";
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
interface pointClass {
  lat: number,
  lng: number
}

const locOption: UseBrowserLocationOptions = {
  enableHighAccuracy: true, // 设置为true以启用高精度定位
  enableSDKLocation: true
};
let point = ref<pointClass>({lng: 116.30793520652882, lat: 40.05861561613348})
let centerPoint = ref<pointClass | null>(null)
const {get: getLoc, location, isLoading: isLoadingLoc, isError, status} = useBrowserLocation(locOption, () => {
  useOuterPoint.value = false
  centerPoint.value = location.value.point
  map.value.resetCenter()
})

function handleInitd() {
  debugger
  if (useOuterPoint.value) {
    centerPoint.value = selectedPoint.value
    point.value = selectedPoint.value
    map.value.resetCenter()
    getGeo(centerPoint.value)
    debugger
    getImgSec(true, <number>selectedImgIdx.value)
    visible.value = false
  } else {
    getLoc()
  }
}

// 标点----------------------------------------------------------------------------------------------------------------
const dataForm = ref({
  id: parseInt(sessionStorage.getItem("id") as string, 10),
  latitude: point.value.lat,
  longitude: point.value.lng,
})
const cmtUpload = ref<string>('')
const visible = ref(false)
const {get: getGeo, result, isLoading: isLoadingGeo, isEmpty} = usePointGeocoder<PointGeocoderResult>(null, () => {
  console.log(result.value)
})

function clickMap(e) {
  if (!visible.value) visible.value = true
  console.log('BMap is Clicked')
  point.value = e.latlng
  console.log(point.value)
  dataForm.value.latitude = point.value.lat
  dataForm.value.longitude = point.value.lng
  getGeo(e.latlng)
}

// 监视------------------------------------------------------------------------------------------------------------
watch(location, (newLocation, oldLocation) => {
  if (newLocation) {
    getGeo(newLocation.point)
    point.value = newLocation.point
  }
})
// 上传相关--------------------------------------------------------------------------------------------------
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
    userid: parseInt(sessionStorage.getItem("id") as string, 10),
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
let distance = ref(10000)

interface cardItem {
  cmtId: number,
  userId: number,
  username: string,
  comment: string,
  imgUrl: string,
  imageId: number,
  position: { lat: number, lng: number }
}

const cardList = ref<cardItem[]>([])
const position = ref({
  lat: 0,
  lng: 0,
})
const showDot = ref<boolean>(false)// 在下面用到的
const loadImgDot = ref<boolean>(true)
const getImgSec = async (option: boolean = false, imageId: number = 0) => {
  showDot.value = false;
  loadImgDot.value = true
  cardList.value = []
  try {
    const res = await request.get('secure/file/locate', {
      params: {
        longitude: point.value.lng,
        latitude: point.value.lat,
        radius: distance.value
      },
    });
    console.log(res.data.length);
    console.log('length');

    const promises = res.data.map(async (resObj) => {
      let cardForm: cardItem = {
        cmtId: 0,
        comment: '',
        userId: resObj.userId,
        username: '',
        imgUrl: '',
        imageId: resObj.id,
        position: {lat: resObj.latitude, lng: resObj.longitude},
      };

      const res1 = await request.get('secure/user/' + resObj.userId);
      cardForm.username = res1.data.username;

      const res2 = await request.get('secure/file/image', {
        params: {
          imageId: resObj.id
        },
        responseType: 'blob'
      });
      const urlCreator = window.URL || window.webkitURL;
      const imageUrl = urlCreator.createObjectURL(res2.data);
      cardForm.imgUrl = imageUrl;

      const res3 = await request.get('secure/file/comments', {
        params: {
          imageid: resObj.id
        },
      });
      if (res3.data && res3.data.length > 0 && res3.data[0].contain !== undefined) {
        cardForm.cmtId = res.data[0].id;
        cardForm.comment = res3.data[0].contain;
      } else {
        cardForm.comment = '无评论';
      }

      cardList.value.push(cardForm);
    });

    await Promise.all(promises);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    console.log(cardList.value);
    if (cardList.value.length == 0) {
      showItem.value = {
        cmtId: 0,
        userId: 0,
        username: '',
        comment: '',
        imgUrl: '',
        imageId: 0,
        position: {lat: 0, lng: 0},
      }
      showDot.value = false;
      debugger
    } else {
      if (!option) {
        position.value = cardList.value[0].position;
        showItem.value = JSON.parse(JSON.stringify(cardList.value[0]));
      } else {
        const imgIdx = cardList.value.findIndex(card => card.imageId === imageId)
        position.value = cardList.value[imgIdx].position;
        showItem.value = JSON.parse(JSON.stringify(cardList.value[imgIdx]));
      }
      showDot.value = true;
    }
    loadImgDot.value = false;
  }
}
// 在地图上显示贴图卡片----------------------------------------------------------------------------------------------------
const showItem = ref<cardItem>({
  cmtId: 0,
  userId: 0,
  username: '',
  comment: '',
  imgUrl: '',
  imageId: 0,
  position: {lat: 0, lng: 0},
})

function clickDot(item: UnwrapRef<typeof cardList>[0], event: MouseEvent) {
  event.stopPropagation()
  position.value = item.position
  showItem.value = JSON.parse(JSON.stringify(item))
  showDot.value = true
}

// 跳转到用户详情页----------------------------------------------------------------------------------
function jumpUser(id: number) {
  if (id == parseInt(sessionStorage.getItem("id") as string, 10)) {
    router.push('/info')
  } else {
    router.push('/userDetail/' + String(id))
  }
}

// 进入楼层--------------------------------------------------------------------------------------------------------
const drawer = ref(false)
const drawerInfo = ref({
  cmtId: -1,
  userId: -1,
  imageId: -1,
  imgUrl: '',
})
const enterComments = (imageId: number, cmtId: number, userId: number, imgUrl: string) => {
  console.log(drawer.value)
  drawer.value = true
  drawerInfo.value.cmtId = cmtId
  drawerInfo.value.userId = userId
  drawerInfo.value.imageId = imageId
  drawerInfo.value.imgUrl = imgUrl
}
// 处理组件的响应参数回传-----------------------------------------------------------------------------------------------
const handleSyncBackendChanges = (param1, param2) => {
  // 检查参数是否为 undefined
  if (param1 === undefined || param1 === null) {
    getImgSec();
  }
  else{
    getImgSec(param1, param2);
  }

};
// 从外部获取坐标进入界面-------------------------------------------------------------------------------------------
const route = useRoute();
const useOuterPoint = ref<boolean>(false)
const selectedPoint = ref({
  lat: 0,
  lng: 0,
})
const selectedImgIdx = ref<number | null>(0)
onMounted(() => {
  const {lat, lng, int} = route.query;
  if (lat && lng) {
    debugger
    useOuterPoint.value = true
    selectedPoint.value = {
      lat: parseFloat(lat as string),
      lng: parseFloat(lng as string)
    };
    selectedImgIdx.value = parseInt(int,10)
  } else {
    useOuterPoint.value = false
  }
});
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

.container {
  background-color: rgba(0, 0, 0, 0.5); /* 半透明的黑色背景 */
  display: block; /* 让容器宽度自动调整 */
  padding: 10px; /* 可根据需要调整 */
  border-radius: 5px; /* 可根据需要调整，增加一些圆角 */
  color: white; /* 文字颜色为白色 */
}

</style>