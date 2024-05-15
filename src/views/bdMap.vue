<template>
  <div style="display: flex">
    <el-row class="tac">
      <el-col :span="12">
        <el-menu
            style="width: 350px; min-height: calc(100vh - 50px);"
        >
          <el-menu-item index="1">
            <el-button type="info" plain :icon="Location" @click="getLoc">自身位置</el-button>
          </el-menu-item>

          <el-menu-item index="2">
            <el-button type="info" plain :icon="Notification" @click="add">添加贴图</el-button>
          </el-menu-item>

          <el-menu-item index="3">
            <el-button type="info" plain :icon="ChatDotSquare" @click="dotShow">查看贴图</el-button>
          </el-menu-item>
          <el-sub-menu>
            <template #title>
              <el-icon><Setting/></el-icon>
            </template>
            <mapOption v-model="mapSetting"/>
          </el-sub-menu>
        </el-menu>
      </el-col>
    </el-row>
    <div style="flex: 1">
      <div class="state" v-if="!isLoadingLoc && !isError">
        <el-text size="large" type="primary">定位:</el-text>
        <br/>
        <el-text>
          城市 - {{ location.address?.province }}-{{ location.address?.city }}-{{ location.address?.district }}-{{
            location.address?.street
          }}
        </el-text>
        <div style="margin-top: 20px">
          <span>纬度 - {{ location.point?.lat }}</span>
          <br/>
          <span>经度 - {{ location.point?.lng }}</span>
        </div>

        <br/>
        <span>定位精度 - {{ location.accuracy }}m</span>
      </div>
      <div class="state" v-else-if="isError">
        <el-text size="large" type="danger">
          出错了，{{ status }}
        </el-text>
      </div>
      <div class="state" v-else>
        <el-text type="info">
          定位中...
        </el-text>
      </div>
      <div>
        <el-select
            v-model="type"
            placeholder="Select"
            size="large"
            style="width: 240px"
        >
          <el-option
              v-for="item in typeData"
              :key="item.value"
              :label="item.label"
              :value="item.value"
          />
        </el-select>
      </div>

      <br/>
      <br/>
      <BMap
          v-bind="$attrs"
          height="700px"
          :heading="0"
          :tilt="45"
          :center="location.point || undefined"
          ref="map"
          :zoom="19"
          :minZoom="3"
          :mapType="type"
          :enableDragging="mapSetting.enableDragging"
          :enableInertialDragging="mapSetting.enableInertialDragging"
          :enableScrollWheelZoom="mapSetting.enableScrollWheelZoom"
          :enableContinuousZoom="mapSetting.enableContinuousZoom"
          :enableDoubleClickZoom="mapSetting.enableDoubleClickZoom"
          :enableKeyboard="mapSetting.enableKeyboard"
          :enablePinchToZoom="mapSetting.enablePinchToZoom"
          :enableTraffic="mapSetting.enableTraffic"

          @initd="handleInitd"
          @click="handleClick"
      >
        <template v-if="!isLoadingLoc">
          <BMarker :position="location.point"></BMarker>
          <BCircle
              strokeStyle="solid"
              strokeColor="#0099ff"
              :strokeOpacity="0.8"
              fillColor="#0099ff"
              :fillOpacity="0.5"
              :center="location.point"
              :radius="location.accuracy"
          />
        </template>
        <!--      标点-->
        <template v-if="!isLoadingGeo && !isEmpty">
          <BMarker :position="point"></BMarker>
          <BLabel
              style="color: #333; font-size: 9px"
              :position="result.point"
              :content="`地址: ${result?.address} 所属商圈:${result?.business} 最匹配地点: ${
            result?.surroundingPois[0]?.title || '无'
          }`"
          />
        </template>
        <BMarker
            v-for="(item, index) in cardList"
            :position="item.position"
            @click="() => clickDot(item)"
            enableClicking
        />
        <BInfoWindow
            v-model:show="show"
            :position="position"
            enableAutoPan
            enableCloseOnClick
            :offset="{
        x: 0,
        y: -10
      }"
        >
          <el-form label-width="auto" style="max-width: 600px">
            <el-form-item label="Name">
              <el-text @click="jumpUser">{{ showItem.username }}</el-text>
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
          <el-input placeholder="请输入您的评论" type="textarea" v-model="cmtUpload" />
        </el-form-item>
        <el-upload
            v-model:file-list="fileList"
            action="http://192.168.43.105:9091/secure/file/upload"
            list-type="picture-card"
            ref="uploadRef"
            drag="true"
            :headers="authHeaders"
            :on-preview="handlePictureCardPreview"
            :on-remove="handleRemove"
            :before-upload="beforeUpload"
            :on-success="handleSuccess"
            :data="dataForm"
            :auto-upload="false"
            multiple
        >
          <el-icon>
            <Plus/>
          </el-icon>
        </el-upload>

        <el-dialog v-model="previewVisible">
          <img w-full :src="dialogImageUrl" alt="Preview Image"/>
        </el-dialog>
        <template #footer>
          <el-button style="width: 150px; height: 50px" type="primary" @click="submitUpload">上传</el-button>
        </template>

      </el-dialog>
    </div>
  </div>
</template>

<script lang="ts" setup>

import {ChatDotSquare, Notification, Location, Plus, Setting} from "@element-plus/icons-vue";
import {onMounted, ref, watch, type UnwrapRef} from "vue";
import {
  BMap,
  useBrowserLocation,
  type MapProps,
  type MapType,
  usePointGeocoder,
  type PointGeocoderResult,
  BLabel,
  BMarker,
  BCircle,
  BInfoWindow,
} from "vue3-baidu-map-gl";
import request from "@/utils/request";
import {
  ElMessage, type FormProps,
  type UploadInstance,
  type UploadProps,
  type UploadUserFile
} from "element-plus";
import router from "@/router";
import MapOption from "@/components/mapOption.vue";
// 初始化-------------------------------------------------------------------------
let authHeaders = {
  Authorization: sessionStorage.getItem("token")
}
const map = ref()
let mapSetting = ref<MapProps>({
  enableDragging: true,
  enableInertialDragging: true,
  enableScrollWheelZoom: true,
  enableContinuousZoom: true,
  enableResizeOnCenter: true,
  enableDoubleClickZoom: false,
  enableKeyboard: true,
  enablePinchToZoom: true,
  enableAutoResize: true,
  enableTraffic: false
})
const type = ref<MapType>('BMAP_NORMAL_MAP')
const typeData = [
  {
    value: 'BMAP_NORMAL_MAP',
    label: 'BMAP_NORMAL_MAP',
  },
  {
    value: 'BMAP_EARTH_MAP',
    label: 'BMAP_EARTH_MAP',
  },
  {
    value: 'BMAP_SATELLITE_MAP',
    label: 'BMAP_SATELLITE_MAP',
  }
]
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
    console.log(2)
    console.log(newLocation.point)
    point.value = newLocation.point
    getGeo(newLocation.point)
    markerPoint.value = newLocation.point
    console.log(111)
    console.log(markerPoint.value)
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
  cmtUpload.value='';
  fileList.value=[];
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
      userid: 8,
      contain: "shabby",
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
  position: {lat: number, lng: number}
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
  }).then(()=>{
    console.log(cardList.value)
  })
}
// 在地图上显示贴图卡片----------------------------------------------------------------------------------------------------
const position = ref()
const show = ref<boolean>(false)
const showItem = ref({
  username: '',
  comment: '',
  imgUrl: '',
  position: {lat: 0, lng: 0},
})
function clickDot(item: UnwrapRef<typeof cardList>[0]) {
  position.value = item.position
  showItem.value = JSON.parse(JSON.stringify(item))
  if(!show.value) show.value = true
}
// 跳转到用户详情页
function jumpUser(id: number) {
  if(id == parseInt(sessionStorage.getItem("id"), 10)) {
    router.push('/info')
  }
  else{
    router.push('userDetail?id=' + id)
  }
}

onMounted(() => {
  console.log(sessionStorage.getItem("username"))
})
</script>
