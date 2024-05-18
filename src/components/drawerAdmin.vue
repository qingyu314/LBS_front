<template>
  <el-drawer
      v-loading="loading"
      :model-value="drawer"
      :with-header="false"
      title="I am the title"
      @update:model-value="updateDrawer"
  >
    <el-card>
      <div class="dropdown-container">
        <el-dropdown>
          <span class="el-dropdown-link">
            <el-icon><MoreFilled/></el-icon>
          </span>
          <template #dropdown>
              <el-dropdown-item v-if="isSameUser(cmtFirst.userId) && !inEdit[0]">
                <el-button type="info" @click="editComment(cmtFirst.comment, -1)">编辑</el-button>
              </el-dropdown-item>
              <el-dropdown-item>
                <el-button type="danger" @click="deleteWhole()">删除</el-button>
              </el-dropdown-item>
          </template>
        </el-dropdown>
      </div>

      <el-form
          :label-position="labelPosition"
          :model="cmtFirst"
          label-width="auto"
          style="max-width: 600px"
      >
        <el-form-item>
          <el-text size="large">{{ cmtFirst.username }}</el-text>
        </el-form-item>
        <el-form-item>
          <template v-if="inEdit[0]">
            <el-input v-model="storeComment[0]"></el-input>
          </template>
          <template v-else>
            <el-text>{{ cmtFirst.comment }}</el-text>
          </template>

        </el-form-item>
        <el-form-item v-if="isSameUser(cmtFirst.userId) && inEdit[0]">
          <el-button @click="saveComment(cmtFirst.cmtId, storeComment[0], -1)">保存</el-button>
          <el-button type="danger" @click="discardEdit(-1)">丢弃</el-button>
        </el-form-item>
        <el-form-item>
          <el-image :src="info.imgUrl"/>
        </el-form-item>
      </el-form>
    </el-card>
    <el-card v-for="(item,index) in cmtList" style="max-width: 600px">
      <div class="dropdown-container">
        <el-dropdown>
          <span class="el-dropdown-link">
            <el-icon><MoreFilled/></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-item v-if="isSameUser(item.userId) && !inEdit[index+1]">
              <el-button type="info" @click="editComment(item.comment, index)">编辑</el-button>
            </el-dropdown-item>
            <el-dropdown-item>
              <el-button type="danger" @click="deleteComment(item.cmtId)">删除</el-button>
            </el-dropdown-item>
          </template>
        </el-dropdown>
      </div>
      <el-form
          :label-position="labelPosition"
          :model="item"
          label-width="auto"
          style="max-width: 600px"
      >
        <el-form-item>
          <el-text size="large">{{ item.username }}</el-text>
        </el-form-item>
        <el-form-item>
          <template v-if="inEdit[index+1]">
            <el-input v-model="storeComment[index+1]"></el-input>
          </template>
          <template v-else>
            <el-text>{{ item.comment }}</el-text>
          </template>
        </el-form-item>
        <el-form-item v-if="isSameUser(item.userId) && inEdit[index+1]">
          <el-button @click="saveComment(item.cmtId, storeComment[index+1], index)">保存</el-button>
          <el-button type="danger" @click="discardEdit(index)">丢弃</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <template #footer style="display: inline-block">
      <div class="comment-input-container">
        <el-input v-model="newComment" placeholder="请输入评论内容"></el-input>
        <el-button v-if="newComment" v-show="showSubmitButton" @click="submitComment">发表评论</el-button>
      </div>
    </template>
  </el-drawer>
</template>

<script lang="ts" setup>
import {ref, onMounted, watch} from 'vue';
import {MoreFilled} from '@element-plus/icons-vue'
import request from "@/utils/request";
import {ElMessage, type FormProps} from "element-plus";
// 一些定义---------------------------------------------------------------
const labelPosition = ref<FormProps['labelPosition']>('left')

interface Info {
  cmtId: number,
  userId: number;
  imageId: number;
  imgUrl: string;
}

const props = defineProps<{
  drawer: boolean,
  info: Info
}>();
const info = props.info;
const emit = defineEmits(['update:drawer', 'syncBackendChanges']);

const loading = ref(false);

const updateDrawer = (value: boolean) => {
  emit('update:drawer', value);
};

// 显示评论
interface Comment {
  cmtId: number,
  userId: number,
  username: string,
  comment: string,
}

const cmtList = ref<Comment[]>([]);
const cmtFirst = ref<Comment>({
  cmtId: info?.cmtId,
  userId: info?.userId,
  username: '',
  comment: '无评论',
});
const getCmtById = async () => {
  cmtList.value = [];
  loading.value = true;

  try {
    const res = await request.get('/secure/file/comments', {
      params: {
        imageid: info?.imageId,
      }
    });
    console.log(res.data)
    if (res.data && res.data.length > 0 && res.data[0].contain !== undefined) {
      cmtFirst.value.cmtId = res.data[0].id;
      cmtFirst.value.comment = res.data[0].contain
      const res0 = await request.get('secure/user/' + info?.userId);
      cmtFirst.value.username = res0.data.username;
      const tmpRes = res.data.slice(1);

      const comments = await Promise.all(tmpRes.map(async (comment) => {
        console.log(comment)
        const res1 = await request.get('secure/user/' + comment.userid);
        return {
          cmtId: comment.id,
          userId: comment.userid,
          username: res1.data.username,
          comment: comment.contain
        };
      }));

      cmtList.value = comments;
    } else {
      const res1 = await request.get('secure/user/' + info?.userId);
      cmtFirst.value.username = res1.data.username;
    }
  } catch (error) {
    // 处理错误
    console.error('Failed to get comments:', error);
  } finally {
    loading.value = false;
    inEdit.value = new Array<boolean>(cmtList.value.length + 1).fill(false);
    storeComment.value = new Array<string>(cmtList.value.length + 1).fill('');
  }
};

// 发送评论-------------------------------------------------------------------------------------------------
const newComment = ref('');
const submitComment = () => {
  // 向后端发送评论内容
  request.post('/secure/file/comment/add', {
    userid: parseInt(sessionStorage.getItem("id") as string, 10),
    imageid: info?.imageId,
    contain: newComment.value
  }).then(() => {
    // 发表评论成功后，可以刷新评论列表等操作
    getCmtById();

    // 清空评论输入框
    newComment.value = '';
  }).catch(error => {
    // 处理发表评论失败的情况
    console.error('Failed to submit comment:', error);
  });
};

const showSubmitButton = ref(false)
watch(newComment, (newValue) => {
  // 当输入框内容发生变化时，控制按钮的显示与隐藏
  showSubmitButton.value = newValue !== '';
});
onMounted(() => {
  getCmtById();
})
// id相同可修改-----------------------------------------------------------------------------------------------
const inEdit = ref<boolean[]>([]);
const isSameUser = (userId: number) => {
  return parseInt(sessionStorage.getItem("id") as string, 10) === userId;
};

const storeComment = ref<string[]>([])
const editComment = (comment: string, index: number) => {
  inEdit.value[index + 1] = true
  storeComment.value[index + 1] = comment
};

const deleteComment = (id: number) => {
  request.delete(`/secure/file/comment/delete`, {
    params: {
      commentId: id,
    }
  }).then((res) => {
    if (res.data.code === '0') {
      ElMessage({
        type: 'success',
        message: '删除成功',
        plain: true
      })
      getCmtById()
    } else {
      ElMessage({
        type: 'error',
        message: res.data.msg,
        plain: true
      })
    }
  })
}
const discardEdit = (index: number) => {
  storeComment.value[index + 1] = ''
  inEdit.value[index + 1] = false
};

const saveComment = (commentId: number, newComment: string, index: number) => {
  request.put(`/secure/file/comment/update`, null, {
    params: {
      commentId: commentId,
      userId: parseInt(sessionStorage.getItem("id") as string, 10),
      newContain: newComment
    }
  }).then(() => {
    console.log(123456)
    getCmtById();
  }).catch(error => {
    console.error('Failed to save comment:', error);
  }).finally(() => {
    inEdit.value[index + 1] = false;
    if (index == -1) {
      // 在需要同步后台更改的地方
      emit('syncBackendChanges',true,info?.imageId);
    }
  });
};
// 对整个帖子的操作----------------------------------------------------------------------------------------------------
const deleteWhole = () => {
  request.delete(`/secure/file/image/delete`, {
    params: {
      imageId: info?.imageId,
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
    emit('syncBackendChanges');
    updateDrawer(false);
  })
}


</script>
<style scoped>
.comment-input-container {
  display: flex;
  align-items: center; /* 垂直居中 */
}

.comment-input-container .el-input {
  flex: 1; /* 输入框占据剩余空间 */
  margin-right: 10px; /* 右侧留出一些间距 */
}

.el-dropdown-link {
  cursor: pointer;
  color: var(--el-color-primary);
  display: flex;
  align-items: center;
}

.dropdown-container {
  position: relative;
  float: right; /* 将元素浮动到右侧 */
  margin-top: 5px; /* 调整垂直位置 */
  margin-right: 10px; /* 调整水平位置 */
}
</style>