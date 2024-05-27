<template>
  <div style="display: flex">
    <el-menu
        :collapse="isCollapse"
        style="min-height: calc(100vh - 50px);"
    >
      <div style="margin: 10px auto auto 10px">
        <el-button :icon="Fold" plain type="primary" @click="changeMode"></el-button>
      </div>
      <el-menu-item index="1">
        <el-icon>
          <Location/>
        </el-icon>
        <template #title>
          <el-button plain type="primary" @click="getLoc">自身位置</el-button>
        </template>
      </el-menu-item>

      <el-menu-item index="2">
        <el-icon>
          <Notification/>
        </el-icon>
        <template #title>
          <el-button plain type="primary" @click="add">添加贴图</el-button>
        </template>
      </el-menu-item>

      <el-menu-item index="3">
        <el-icon>
          <ChatDotSquare/>
        </el-icon>
        <template #title>
          <el-dropdown>
            <span class="el-dropdown-link">
              <el-button plain type="primary" @click="()=>getImgSec()">查看贴图</el-button>
              <el-icon class="el-icon--right">
                <arrow-down/>
              </el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item style="height: 200px">
                  <el-slider v-model="distance" :max="40000" show-input vertical/>
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
          <span @click="router.push('/poi')" style="cursor: pointer">自然保护区</span>
        </template>
      </el-menu-item>
    </el-menu>

    <div style="flex: 1;position: relative">
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
          height="100vh"
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
              :height="auto"
              :offset="{
                x: 0,
                y: -10
              }"
              :position="position"
              enableAutoPan
              enableCloseOnClick
              class="post-window"
          >
            <div class="post-container">
              <el-image :src="showItem.imgUrl" class="post-image"
                        @click="enterComments(showItem.imageId, showItem.cmtId, showItem.userId, showItem.imgUrl)"/>
              <div class="post-text">{{ showItem.comment }}</div>
              <div class="post-bottom">
                <UserAvatar :username="showItem.username" :userId="showItem.userId" :size="35"/>
                <div style="flex: 1"></div>
                <el-button text v-if="isAdmin()" @click="()=>deleteWhole(showItem.imageId)" :icon="Delete"/>
              </div>
            </div>
          </BInfoWindow>
        </template>
      </BMap>

      <div v-if="useOuterPoint" class="location-container">
        <div class="location-header">
          <el-icon>
            <Location/>
          </el-icon>
          <span class="location-header">当前位置</span></div>
        <span>
            {{ result?.addressComponents.province }}-{{
            result?.addressComponents.city
          }}-{{ result?.addressComponents.district }}-{{ result?.addressComponents.street }}
          </span>
        <span>纬度：{{ result?.point.lat }}</span>
        <span>经度：{{ result?.point.lng }}</span>
      </div>
      <div v-else-if="!isLoadingLoc && !isError" class="location-container">
        <div class="location-header">
          <el-icon>
            <Location/>
          </el-icon>
          <span class="location-header">定位</span>
        </div>
        <span>{{ location.address?.province }}-{{ location.address?.city }}-{{
            location.address?.district
          }}-{{ location.address?.street }}</span>
        <span>定位精度：{{ location.accuracy }}m</span>
        <span>纬度：{{ location.point?.lat }}</span>
        <span>经度：{{ location.point?.lng }}</span>
      </div>
      <div v-else-if="isError" class="location-container">
        <div class="location-header">
          <el-icon>
            <Location/>
          </el-icon>
          <span class="location-header">出错了</span>
        </div>
        <span>{{status}}</span>
      </div>
      <div v-else class="location-container">
        <div class="location-header">
          <el-icon>
            <Location/>
          </el-icon>
          <span class="location-header">定位中</span>
        </div>
      </div>

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
            :limit="1"
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
      <div v-if="!isAdmin()">
        <cmtDrawer v-model:drawer="drawer" v-bind:info="drawerInfo" @syncBackendChanges="handleSyncBackendChanges"/>
      </div>
      <div v-else>
        <drawer-admin v-model:drawer="drawer" v-bind:info="drawerInfo" @syncBackendChanges="handleSyncBackendChanges"/>
      </div>
    </div>

  </div>
</template>

<script lang="ts" setup>

import {
  ChatDotSquare,
  Fold,
  Location,
  Notification,
  Plus,
  Setting,
  Guide,
  ArrowDown,
  Delete
} from "@element-plus/icons-vue";
import {computed, onMounted, ref, type UnwrapRef, watch} from "vue";
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
import UserAvatar from "@/components/UserAvatar.vue";
import MapOption from "@/components/MapOption.vue";
import CmtDrawer from "@/components/CmtDrawer.vue";

import '/src/assets/css/bdMapPage.css'
import DrawerAdmin from "@/components/DrawerAdmin.vue";
// 初始化-------------------------------------------------------------------------
let authHeaders = {
  Authorization: localStorage.getItem("token")
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
const locOption: UseBrowserLocationOptions = {
  enableHighAccuracy: true, // 设置为true以启用高精度定位
  enableSDKLocation: true
};
let point = ref<Point>({lng: 116.30793520652882, lat: 40.05861561613348})
let centerPoint = ref<Point | null>(null)
const {get: getLoc, location, isLoading: isLoadingLoc, isError, status} = useBrowserLocation(locOption, () => {
  useOuterPoint.value = false
  centerPoint.value = location.value.point
  point.value = location.value.point
  dataForm.value.latitude = point.value.lat
  dataForm.value.longitude = point.value.lng
  map.value.resetCenter()
})

function handleInitd() {
  // debugger
  if (useOuterPoint.value) {
    centerPoint.value = selectedPoint.value
    point.value = selectedPoint.value
    map.value.resetCenter()
    getGeo(centerPoint.value)
    // debugger
    getImgSec(true, <number>selectedImgIdx.value)
    visible.value = false
  } else {
    getLoc()
  }
}

// 标点----------------------------------------------------------------------------------------------------------------
const dataForm = ref({
  id: parseInt(localStorage.getItem("id") as string, 10),
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
    userid: parseInt(localStorage.getItem("id") as string, 10),
    contain: cmtUpload.value || '无评论',
    imageid: response.data,
  })
}

const uploadRef = ref<UploadInstance>()
const submitUpload = () => {
  console.log(fileList.value)
  uploadRef.value!.submit()
  dialogVisible.value = false
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
      position.value = showItem.value.position;
      debugger
      showDot.value = false
    } else {
      if (!option) {
        position.value = cardList.value[0].position;
        showItem.value = JSON.parse(JSON.stringify(cardList.value[0]));
      } else {
        const imgIdx = cardList.value.findIndex(card => card.imageId === imageId)
        position.value = cardList.value[imgIdx].position;
        showItem.value = JSON.parse(JSON.stringify(cardList.value[imgIdx]));
      }
      showDot.value = true
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
  } else {
    getImgSec(param1, param2);
  }

};
// 管理员在infoWindow删帖----------------------------------------------------------------------------------------------
const isAdmin = () => {
  return parseInt(localStorage.getItem("id") as string, 10) == 1
}
const deleteWhole = (imageId: number) => {
  request.delete(`/secure/file/image/delete`, {
    params: {
      imageId: imageId,
    }
  }).then(res => {
    if (res.data.code === '0') {
      ElMessage({
        type: 'success',
        message: '删除成功',
      })
    } else {
      ElMessage({
        type: 'error',
        message: res.data.msg,
      })
    }
  }).finally(() => {
    getImgSec()
  })
}
// 从外部获取坐标进入界面-------------------------------------------------------------------------------------------
const route = useRoute();
const useOuterPoint = ref<boolean>(false)
const selectedPoint = ref({
  lat: 0,
  lng: 0,
})
const selectedImgIdx = ref<number | null>(0)
onMounted(() => {
  const {lat, lng, index} = route.query;
  if (lat && lng) {
    // debugger
    useOuterPoint.value = true
    selectedPoint.value = {
      lat: parseFloat(lat as string),
      lng: parseFloat(lng as string)
    };
    selectedImgIdx.value = parseInt(index, 10)
  } else {
    useOuterPoint.value = false
  }
});
</script>
<style scoped>

</style>