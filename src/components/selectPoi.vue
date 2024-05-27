<template>
  <div style="margin:10px 20px;">
    <el-button-group>
      <el-button @click="() => getPOI()">获取所有信息</el-button>
      <el-button v-if="isAdmin()" @click="add">添加POI(记得先标点)</el-button>
    </el-button-group>
  </div>

  <el-radio-group v-model="mode" style="margin-left: 20px">
    <el-radio :value="false" size="large">半径搜索</el-radio>
    <el-radio :value="true" size="large">关键字搜索</el-radio>
  </el-radio-group>
  <div v-if="!mode" class="demo-date-picker">
    <div style="width: 60%">
      <el-slider v-model="distance" :max="4000" :disabled="mode" show-input/>
    </div>
    <div style="margin-left: 30px">
      <el-button @click="()=>getPoiByRad(props.point)" :disabled="mode" :icon="Filter">半径查找</el-button>
    </div>
  </div>
  <div v-else class="demo-date-picker">
    <div>
      <el-checkbox v-model="enableCode" :disabled="!mode"/>
      <el-select
          v-model="selectCode"
          :disabled="!enableCode || !mode"
          clearable
          placeholder="选择省份"
          style="width: 240px"
      >
        <el-option
            v-for="item in provinces"
            :key="item.value"
            :label="item.label"
            :value="item.value"
        />
      </el-select>
    </div>
    <div>
      <el-checkbox v-model="enableType" :disabled="!mode"/>
      <el-select
          v-model="selectType"
          :disabled="!enableType || !mode"
          clearable
          placeholder="选择类型"
          style="width: 240px"
      >
        <el-option
            v-for="item in typeList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
        />
      </el-select>
    </div>
    <div>
      <el-checkbox v-model="enableDepart" :disabled="!mode"/>
      <el-select
          v-model="selectDepart"
          :disabled="!enableDepart || !mode"
          clearable
          placeholder="选择所属系"
          style="width: 240px"
      >
        <el-option
            v-for="item in departList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
        />
      </el-select>
    </div>
    <div>
      <el-checkbox v-model="enableDate" :disabled="!mode"/>
      <el-date-picker
          v-model="chosenDate"
          :disabled="!enableDate || !mode"
          format="YYYY/MM/DD"
          placeholder="选择日期"
          size="default"
          type="date"
          value-format="YYYYMMDD"
      />
    </div>
    <el-button @click="searchPoi" :disabled="!mode" :icon="Filter">关键字查找</el-button>


  </div>
  <el-dialog
      v-model="dialogVisible"
      title="上传贴图"
      width="50%"
  >
    <el-form :model="poiForm">
      <el-form-item label="code">
        <el-input v-model="poiForm.code"/>
      </el-form-item>
      <el-form-item label="name">
        <el-input v-model="poiForm.name"/>
      </el-form-item>
      <el-form-item label="locate">
        <el-input v-model="poiForm.locate" disabled/>
      </el-form-item>
      <el-form-item label="size">
        <el-input-number v-model="poiForm.size" :precision="2" :step="0.1"/>
      </el-form-item>
      <el-form-item label="protectObject">
        <el-input v-model="poiForm.protectObject"/>
      </el-form-item>
      <el-form-item label="type">
        <el-select
            v-model="poiForm.type"
            clearable
            placeholder="选择类型"
            style="width: 240px"
        >
          <el-option
              v-for="item in typeList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="level">
        <el-input v-model="poiForm.level" disabled/>
      </el-form-item>
      <el-form-item label="setTime">
        <el-date-picker
            v-model="poiForm.setTime"
            format="YYYY/MM/DD"
            placeholder="Pick a day"
            size="default"
            type="date"
            value-format="YYYYMMDD"
        />
      </el-form-item>
      <el-form-item label="department">
        <el-select
            v-model="poiForm.department"
            clearable
            placeholder="选择所属系"
            style="width: 240px"
        >
          <el-option
              v-for="item in departList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="coordinate(lng, lat)">
        <el-col :span="11">
          <el-input v-model="poiForm.longitude" disabled/>
        </el-col>
        <el-col :span="2">
          <span>, </span>
        </el-col>
        <el-col :span="11">
          <el-input v-model="poiForm.latitude" disabled/>
        </el-col>
      </el-form-item>
    </el-form>
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
</template>

<script lang="ts" setup>
import {onMounted, ref, watch} from "vue";
import request from "@/utils/request";
import type {Point} from "vue3-baidu-map-gl";
import {ElMessage, type UploadInstance, type UploadProps, type UploadUserFile} from "element-plus";
import {Plus, Filter} from "@element-plus/icons-vue"

const enableCode = ref(false)
const enableType = ref(false)
const enableDepart = ref(false)
const enableDate = ref(false)
const selectCode = ref<string | undefined>('')
const selectType = ref<string | undefined>('')
const selectDepart = ref<string | undefined>('')
const chosenDate = ref<string | undefined>('')

export interface poiItem {
  code: string;
  department: string;
  latitude: number;
  level: string;
  locate: string;
  longitude: number;
  name: string;
  protectObject: string;
  setTime: string; // 你可以根据需要将时间类型更改为 Date 类型
  size: number;
  type: string;
  imageid: number;
}

interface Option {
  value: string;
  label: string;
}

const props = defineProps<{
  point: Point,
  result: string
}>()
const emit = defineEmits(['callbackShow'])
const isAdmin = () => {
  return parseInt(localStorage.getItem("id") as string, 10) == 1
}

const poiData = ref<poiItem[]>([])
const resPoi = ref<poiItem[]>([])
const isSearch = ref(false)
let authHeaders = {
  Authorization: localStorage.getItem("token")
}
// 获取所有POI信息----------------------------------------------------------------------------------------------------
const getPOI = () => {
  poiData.value = [];
  request.get('secure/user/poi/all').then((res) => {
    poiData.value = res.data;
    console.log(poiData.value);

    typeList.value = getAllTypes(poiData.value)
    departList.value = getAllDepartments(poiData.value)

    emit('callbackShow', poiData.value);
    isSearch.value = false
  })
};
// 选择模式-----------------------------------------------------------------------------------------------------------
const mode = ref<boolean>(false)
// 根据半径查询-------------------------------------------------------------------------------------------------------
const distance = ref<number>(100)
const prevPoint = ref<Point>({lng: 0, lat: 0})
const getPoiByRad = (point: Point = props.point) => {
  request.get('secure/user/getLocation', {
    params:{
      latitude: point.lat,
      longitude: point.lng,
      radius: distance.value * 1000
    }
  }).then((res) => {
    console.log(res)
    resPoi.value = res.data
    prevPoint.value = JSON.parse(JSON.stringify(point))
    isSearch.value = true
    emit('callbackShow', resPoi.value)
  })


}


// 根据关键字选择------------------------------------------------------------------------------------------------------
const provinces = [
  {value: '京', label: '北京市'},
  {value: '津', label: '天津市'},
  {value: '沪', label: '上海市'},
  {value: '渝', label: '重庆市'},
  {value: '冀', label: '河北省'},
  {value: '豫', label: '河南省'},
  {value: '云', label: '云南省'},
  {value: '辽', label: '辽宁省'},
  {value: '黑', label: '黑龙江省'},
  {value: '湘', label: '湖南省'},
  {value: '皖', label: '安徽省'},
  {value: '鲁', label: '山东省'},
  {value: '新', label: '新疆维吾尔自治区'},
  {value: '苏', label: '江苏省'},
  {value: '浙', label: '浙江省'},
  {value: '赣', label: '江西省'},
  {value: '鄂', label: '湖北省'},
  {value: '桂', label: '广西壮族自治区'},
  {value: '甘', label: '甘肃省'},
  {value: '晋', label: '山西省'},
  {value: '蒙', label: '内蒙古自治区'},
  {value: '陕', label: '陕西省'},
  {value: '吉', label: '吉林省'},
  {value: '闽', label: '福建省'},
  {value: '贵', label: '贵州省'},
  {value: '粤', label: '广东省'},
  {value: '青', label: '青海省'},
  {value: '藏', label: '西藏自治区'},
  {value: '川', label: '四川省'},
  {value: '宁', label: '宁夏回族自治区'},
  {value: '琼', label: '海南省'},
  {value: '台', label: '台湾省'},
  {value: '港', label: '香港特别行政区'},
  {value: '澳', label: '澳门特别行政区'}
];

const typeList = ref<Option[]>([])
const departList = ref<Option[]>([])


// 函数用于获取所有可能的 type 值，并以指定的格式返回
function getAllTypes(poiList: poiItem[]): { value: string, label: string }[] {
  const types = new Set<string>();

  for (const item of poiList) {
    types.add(item.type);
  }

  return Array.from(types).map(type => ({value: type, label: type}));
}

// 函数用于获取所有可能的 department 值，并以指定的格式返回
function getAllDepartments(poiList: poiItem[]): { value: string, label: string }[] {
  const departments = new Set<string>();

  for (const item of poiList) {
    departments.add(item.department);
  }

  return Array.from(departments).map(department => ({value: department, label: department}));
}

const searchPoi = () => {
  let code: string | undefined = selectCode.value
  let type: string | undefined = selectType.value
  let depart: string | undefined = selectDepart.value
  let date: string | undefined = chosenDate.value
  if(!enableCode.value)
    code = undefined
  if(!enableType.value)
    type = undefined
  if(!enableDepart.value)
    depart = undefined
  if(!enableDate.value)
    date = undefined
  request.get(`/secure/user/poi/get`, {
    params: {
      code: code,
      type: type,
      department: depart,
      settime: date
    }
  }).then(res => {
    resPoi.value = res.data;
    console.log(resPoi.value)
    isSearch.value = true
    emit('callbackShow', resPoi.value)

  })
}

// 添加poi-------------------------------------------------------------------------------------------------------------
const dialogVisible = ref(false);
const fileList = ref<UploadUserFile[]>([])
const dialogImageUrl = ref('')
const previewVisible = ref(false)
const initForm: poiItem = {
  code: '',
  department: '',
  latitude: 0,
  level: '国家级',
  locate: '',
  longitude: 0,
  name: '',
  protectObject: '',
  setTime: '',
  size: 0,
  type: '',
  imageid: 0,
};
const dataForm = ref({
  id: parseInt(localStorage.getItem("id") as string, 10),
  latitude: props.point.lat,
  longitude: props.point.lng,
})
const poiForm = ref<poiItem>(JSON.parse(JSON.stringify(initForm)))
const add = () => {
  console.log(dataForm)

  fileList.value = []
  poiForm.value = JSON.parse(JSON.stringify(initForm))
  poiForm.value.locate = props.result
  poiForm.value.longitude = props.point.lng
  poiForm.value.latitude = props.point.lat
  dialogVisible.value = true
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
  poiForm.value.imageid = response.data
  console.log(poiForm.value)
  request.post(`/secure/user/poi/add`, poiForm.value).then(res => {
    if (res.data.code === '0') {
      ElMessage({
        type: 'success',
        message: '添加成功',
      })
    } else {
      ElMessage({
        type: 'error',
        message: res.data.msg,
      })
    }
  })
  reloadShow()
}

const uploadRef = ref<UploadInstance>()
const submitUpload = () => {
  if (fileList.value.length > 0) {
    console.log(fileList.value)
    uploadRef.value!.submit()
  } else {
    request.post(`/secure/user/poi/add`, poiForm.value).then(res => {
      if (res.data.code === '0') {
        ElMessage({
          type: 'success',
          message: '添加成功',
        })
      } else {
        ElMessage({
          type: 'error',
          message: res.data.msg,
        })
      }
      reloadShow()
    })
  }
  dialogVisible.value = false

}

// 暴露给外面的接口----------------------------------------------------------------------------------------------------
const reloadShow = () => {
  if (!isSearch.value) {
    getPOI()
  } else if (!mode.value) {
    getPoiByRad(prevPoint.value)
  } else {
    searchPoi()
  }
}
defineExpose({
  reloadShow
})
</script>

<style scoped>
.select {
  display: flex;
}

.demo-date-picker {
  display: flex;
  width: 100%;
  margin: 10px 20px;
  gap: 20px;
}

.demo-date-picker > div {
  display: flex;
  gap: 10px;
}
</style>