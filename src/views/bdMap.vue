<template>
  <el-row class="tac">
    <el-col :span="12">
      <el-menu
          style="width: 350px; min-height: calc(100vh - 50px);"
          class="el-menu-vertical-demo"
      >
        <el-menu-item index="1">
          <el-button type="info" plain :icon="Location" @click="getLoc">自身位置</el-button>
        </el-menu-item>

        <el-menu-item index="2">
          <el-button type="info" plain :icon="Notification" @click="add">添加贴图</el-button>
        </el-menu-item>

        <el-menu-item index="3">
          <el-button type="info" plain :icon="ChatDotSquare" @click="cmtShow">查看贴图</el-button>
        </el-menu-item>
        <el-menu-item>
          <el-checkbox v-model="mapSetting.enableScrollWheelZoom" label="鼠标缩放"/>

        </el-menu-item>
        <el-menu-item>
          <el-checkbox v-model="mapSetting.enableDragging" label="拖拽"/>

        </el-menu-item>
        <el-menu-item>
          <el-checkbox v-model="mapSetting.enableInertialDragging" label="惯性拖拽"/>

        </el-menu-item>

        <el-menu-item>
          <el-checkbox v-model="mapSetting.enablePinchToZoom" label="双指缩放地图"/>

        </el-menu-item>

        <el-menu-item>
          <el-checkbox v-model="mapSetting.enableKeyboard" label="键盘操作"/>

        </el-menu-item>

        <el-menu-item>
          <el-checkbox v-model="mapSetting.enableDoubleClickZoom" label="双击缩放，左键双击放大、右键双击缩小"/>

        </el-menu-item>

        <el-menu-item>
          <el-checkbox v-model="mapSetting.enableContinuousZoom" label="双击平滑缩放效果"/>

        </el-menu-item>

        <el-menu-item>
          <el-checkbox v-model="mapSetting.enableTraffic" label="显示交通路况"/>

        </el-menu-item>
      </el-menu>
    </el-col>
  </el-row>

  <div style="flex: 1">
    <div class="state" v-if="!isLoadingLoc && !isError">
      <el-text size="large" type="primary">定位:</el-text>
      <br />
      <el-text>
        城市 - {{ location.address?.province }}-{{ location.address?.city }}-{{ location.address?.district }}-{{
          location.address?.street
        }}
      </el-text>
      <div style="margin-top: 20px">
        <span>纬度 - {{ location.point?.lat }}</span>
        <br />
        <span>经度 - {{ location.point?.lng }}</span>
      </div>

      <br />
      <span>定位精度 - {{ location.accuracy }}m</span>
    </div>
    <div class="state" v-else-if="isError && isErrConv">
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

    <br />
    <br />
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
      <template v-if="!isLoadingLoc && isLoadConv">
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
    </BMap>
    <el-dialog
      v-model="dialogVisible"
      title="上传贴图"
      width="50%"
      >
      <el-upload
          v-model:file-list="fileList"
          action="http://192.168.137.1:9091/file/upload"
          list-type="picture-card"
          ref="uploadRef"
          :on-preview="handlePictureCardPreview"
          :on-remove="handleRemove"
          :before-upload="beforeUpload"
          :data="dataForm"
          :auto-upload="false"
          multiple
      >
        <el-icon><Plus /></el-icon>
      </el-upload>

      <el-dialog v-model="previewVisible">
        <img w-full :src="dialogImageUrl" alt="Preview Image" />
      </el-dialog>
      <template #footer>
        <el-button style="width: 150px; height: 50px" type="primary" @click="submitUpload">上传</el-button>
      </template>

    </el-dialog>
    <el-drawer v-if="!isLoadingCard" v-model="drawer" title="贴图列表" :direction="'rtl'" style="width: 700px;">

      <el-card v-for="item in cardList" style="max-width: 480px">
        <el-form
            :label-position="labelPosition"
            label-width="auto"
            :model="item"
            style="max-width: 600px"
        >
          <el-form-item label="Name">
            <el-text>{{ item.username }}</el-text>
          </el-form-item>
          <el-form-item label="介绍">
            <el-text>{{ item.introduction }}</el-text>
          </el-form-item>
          <el-form-item label="表单">
            <el-text>{{ item.imageNum }}</el-text>
          </el-form-item>
          <el-form-item label="图片">
            <el-image style="width: 100px; height: 100px" :src="item.imgUrl"/>
          </el-form-item>
        </el-form>
      </el-card>
    </el-drawer>
    <el-drawer v-else v-model="drawer" title="贴图列表" :direction="'rtl'" style="width: 700px;">
      <span>加载中...</span>
    </el-drawer>
  </div>
</template>

<script lang="ts" setup>
import {ChatDotSquare, Notification, Location, Plus} from "@element-plus/icons-vue";
import {onMounted, ref} from "vue";
import {
  BMap,
  useBrowserLocation,
  type MapProps,
  type MapType,
  usePointGeocoder,
  CoordinatesFromType, CoordinatesToType, usePointConvertor,
  type PointGeocoderResult, BLocation, BLabel, BMarker, BCircle, BInfoWindow,
} from "vue3-baidu-map-gl";
import request from "@/utils/request";
import {
  ElMessage, type FormProps,
  type UploadInstance,
  type UploadProps,
  type UploadUserFile
} from "element-plus";

//初始化------------------------------------------------------------------------------------------------
const map = ref()
let mapSetting = ref<MapProps>({
  enableDragging: true,
  enableInertialDragging: true,
  enableScrollWheelZoom: false,
  enableContinuousZoom: true,
  enableResizeOnCenter: true,
  enableDoubleClickZoom: false,
  enableKeyboard: true,
  enablePinchToZoom: true,
  enableAutoResize: true,
  enableTraffic: false
})
function handleInitd() {
  getLoc()
}

//地图模式-------------------------------------------------------------------------------------------------
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

//浏览器定位-------------------------------------------------------------------------------------------------------------
let point = ref({ lng: 116.30793520652882, lat: 40.05861561613348 })
const { get: getLoc, location, isLoading: isLoadingLoc, isError, status } = useBrowserLocation(null, () => {
  convert([location.value.point], CoordinatesFromType['COORDINATES_GCJ02'], CoordinatesToType['COORDINATES_BD09'])

  point.value=resConv.value?resConv.value[0]:location.value.point
  getGeo(point.value)
  markerPoint.value = point.value
  console.log(111)
  console.log(point.value)
  map.value.resetCenter()
})
const { get: getGeo, result, isLoading: isLoadingGeo, isEmpty } = usePointGeocoder<PointGeocoderResult>(null, () => {
  console.log(result.value)
})

// 单击标点---------------------------------------------------------------------------------------------------------------------
const markerPoint = point
const dataForm = ref({
  id: 1,
  // id: Number(JSON.parse(sessionStorage.getItem("user")).data.userId),
  latitude: markerPoint.value.lat,
  longitude: markerPoint.value.lng

});
function handleClick(e) {
  markerPoint.value = e.latlng
  console.log(markerPoint.value)
  dataForm.value.latitude = markerPoint.value.lat
  dataForm.value.longitude = markerPoint.value.lng
  getGeo(e.latlng)
}

// 添加贴图----------------------------------------------------------------------------------------------------------
const form = ref({
  point:point.value,
  id: -1
})
const dialogVisible=ref(false)
const add=()=>{
  dialogVisible.value=true;
  form.value={
    point:point.value,
    id: 1
  }
}

// 上传相关-----------------------------------------------------------------------------------------------------------
const fileList = ref<UploadUserFile[]>([])
const dialogImageUrl = ref('')

const handleRemove: UploadProps['onRemove'] = (uploadFile, uploadFiles) => {
  console.log(uploadFile, uploadFiles)
}

const beforeUpload: UploadProps['beforeUpload'] = (rawFile) => {
  if (rawFile.type !== 'image/jpeg' && rawFile.type !== 'image/png' && rawFile.type !== 'image/bmp' && rawFile.type !== 'image/gif') {
    ElMessage.error('上传的图片必须要是 JPG/PNG/BMP/GIF 格式!')
    return false
  }
  return true
}

const uploadRef = ref<UploadInstance>()

const submitUpload = () => {
  console.log(fileList.value)
  uploadRef.value!.submit()
}

// 图片预览------------------------------------------------------------------------------------------------------------------------
const previewVisible = ref(false)
const handlePictureCardPreview: UploadProps['onPreview'] = (uploadFile) => {
  dialogImageUrl.value = uploadFile.url!
  previewVisible.value = true
}

// 一个范围内的贴图查询------------------------------------------------------------------------------------------------
let distance = ref(5000)
const url = ref('')
const drawer = ref(false)
const cardList = ref([])
const labelPosition = ref<FormProps['labelPosition']>('left')
const isLoadingCard = ref(false)
const cmtShow = () => {
  drawer.value = true
  getImgSec()
  form.value
}
const getImgSec = () => {
  cardList.value = []
  request.get('/file/locate', {  // 确保URL与后端设置的路由一致
    params: {
      longitude: point.value.lng,
      latitude: point.value.lat,
      radius: distance.value
    },
  }).then(res => {
    if(res.data.length > 0){isLoadingCard.value=true}
    console.log(111)
    console.log(res.data)
    for(let i=0; i<res.data.length; i++){
      let resObj = res.data[i];
      let cardForm = {
        username:'',
        introduction:'',
        imageNum: 0,
        imgUrl:''
      }
      let flag1 = false
      let flag2 = false
      let cnt = 0

      request.get('/user/'+res.data[i].userId).then((res1) => {
        console.log(res1.data)
        cardForm = res1.data
        flag1 = true
        if(flag1 && flag2){
          cardList.value.push(cardForm)
          cnt++
        }
      })
      request.get('/file/image', {
        params:{
          imageId : resObj.id
        },
        responseType: 'blob'
      }).then(res2 => {
        const urlCreator = window.URL || window.webkitURL;
        url.value = urlCreator.createObjectURL(res2.data);  // 创建一个临时URL用于图片显示
        cardForm.imgUrl = url.value
        console.log(url.value);
        flag1 = true
        if(flag1 && flag2){
          cardList.value.push(cardForm)
          cnt++
        }
      })
      if(cnt === res.data.length){isLoadingCard.value=false}
    }


  })
};

//坐标转换
const { convert, result:resConv, isLoading:isLoadConv, isError:isErrConv } = usePointConvertor()

onMounted(()=>{
  console.log(sessionStorage.getItem("user"))
})
</script>
