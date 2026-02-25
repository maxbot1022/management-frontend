<template>
  <div class="video-page">
    <div class="page-header">
      <h2>视频制作</h2>
      <el-button type="primary" @click="showCreateDialog = true">
        <el-icon><Plus /></el-icon>新建视频任务
      </el-button>
    </div>

    <!-- 创建任务对话框 -->
    <el-dialog v-model="showCreateDialog" title="新建视频生成任务" width="700px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="选择项目" required>
          <el-select v-model="form.projectId" placeholder="请选择项目" style="width: 100%">
            <el-option v-for="p in projects" :key="p.id" :label="p.name" :value="p.id" />
          </el-select>
        </el-form-item>

        <el-form-item label="任务名称" required>
          <el-input v-model="form.taskName" placeholder="请输入任务名称" />
        </el-form-item>

        <el-form-item label="首帧图片">
          <el-select v-model="form.imageTaskId" placeholder="选择已生成的图片作为首帧" style="width: 100%">
            <el-option 
              v-for="img in imageTasks" 
              :key="img.id" 
              :label="img.taskName" 
              :value="img.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="参考视频">
          <el-upload
            class="upload-demo"
            action="#"
            :auto-upload="false"
            :on-change="handleVideoChange"
            accept="video/*"
            :limit="1"
          >
            <el-button type="primary"><el-icon><Upload /></el-icon>上传参考视频</el-button>
          </el-upload>
          <p class="upload-tip">上传参考视频可以生成动作风格一致的视频</p>
        </el-form-item>

        <el-form-item label="时长">
          <el-radio-group v-model="form.duration">
            <el-radio-button :label="5">5秒</el-radio-button>
            <el-radio-button :label="10">10秒</el-radio-button>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="提示词" required>
          <el-input 
            v-model="form.prompt" 
            type="textarea" 
            :rows="4"
            placeholder="描述视频内容，如：人物缓缓转身，衣袂飘动，背景樱花飘落..."
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="createTask" :loading="loading">创建</el-button>
      </template>
    </el-dialog>

    <!-- 视频任务列表 -->
    <el-card>
      <template #header><span>视频任务列表</span></template>
      
      <el-row :gutter="20">
        <el-col :span="8" v-for="task in tasks" :key="task.id">
          <el-card class="video-task-card" shadow="hover">
            <div class="video-preview">
              <video v-if="task.resultUrl" controls :src="task.resultUrl"></video>
              <div v-else class="no-video">
                <el-icon><VideoCamera /></el-icon>
                <p>{{ getStatusText(task.status) }}</p>
              </div>
            </div>
            
            <div class="task-info">
              <h4>{{ task.taskName }}</h4>
              <el-tag :type="getStatusType(task.status)" size="small">
                {{ getStatusText(task.status) }}
              </el-tag>
            </div>

            <div class="task-meta">
              <span>时长: {{ task.duration || 5 }}秒</span>
            </div>

            <div class="task-actions">
              <el-button 
                v-if="task.status === 0"
                type="primary" 
                size="small"
                @click="submitTask(task.id)"
              >开始生成</el-button>
              
              <el-button 
                v-if="task.status === 2"
                type="success" 
                size="small"
                @click="downloadVideo(task)"
              >下载视频</el-button>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { projectApi, taskApi, fileApi } from '../api'

const projects = ref([])
const tasks = ref([])
const imageTasks = ref([])
const showCreateDialog = ref(false)
const loading = ref(false)
const currentFile = ref(null)

const form = ref({
  projectId: '',
  taskName: '',
  prompt: '',
  imageTaskId: '',
  duration: 5
})

onMounted(() => {
  loadProjects()
  loadTasks()
})

// 监听项目选择，加载该项目的图片任务
watch(() => form.value.projectId, async (newVal) => {
  if (newVal) {
    try {
      const res = await taskApi.listImageTasks(newVal)
      imageTasks.value = res.data.filter(t => t.status === 2) // 只显示已完成的图片
    } catch (error) {
      console.error('加载图片任务失败', error)
    }
  }
})

const loadProjects = async () => {
  try {
    const res = await projectApi.all()
    projects.value = res.data
  } catch (error) {
    ElMessage.error('加载项目失败')
  }
}

const loadTasks = async () => {
  try {
    const allTasks = []
    for (const p of projects.value) {
      const res = await taskApi.listVideoTasks(p.id)
      allTasks.push(...res.data)
    }
    tasks.value = allTasks
  } catch (error) {
    console.error('加载任务失败', error)
  }
}

const handleVideoChange = (file) => {
  currentFile.value = file.raw
}

const createTask = async () => {
  if (!form.value.projectId || !form.value.taskName || !form.value.prompt) {
    ElMessage.warning('请填写必要信息')
    return
  }

  loading.value = true
  try {
    let referenceImageUrl = ''
    let referenceVideoUrl = ''

    // 如果选择了图片任务，获取图片URL
    if (form.value.imageTaskId) {
      const selectedImg = imageTasks.value.find(t => t.id === form.value.imageTaskId)
      if (selectedImg) {
        referenceImageUrl = selectedImg.resultUrl
      }
    }

    // 上传参考视频
    if (currentFile.value) {
      const uploadRes = await fileApi.uploadVideo(currentFile.value)
      referenceVideoUrl = uploadRes.data.url
    }

    await taskApi.createVideoTask({
      projectId: form.value.projectId,
      taskName: form.value.taskName,
      prompt: form.value.prompt,
      referenceImageUrl,
      referenceVideoUrl,
      duration: form.value.duration
    })

    ElMessage.success('创建成功')
    showCreateDialog.value = false
    form.value = { projectId: '', taskName: '', prompt: '', imageTaskId: '', duration: 5 }
    currentFile.value = null
    loadTasks()
  } catch (error) {
    ElMessage.error('创建失败')
  } finally {
    loading.value = false
  }
}

const submitTask = async (id) => {
  try {
    await taskApi.submitVideoTask(id)
    ElMessage.success('已提交生成')
    loadTasks()
  } catch (error) {
    ElMessage.error('提交失败')
  }
}

const downloadVideo = (task) => {
  if (task.resultUrl) {
    window.open(task.resultUrl, '_blank')
  }
}

const getStatusType = (status) => {
  const types = { 0: 'info', 1: 'warning', 2: 'success', 3: 'danger' }
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = { 0: '待处理', 1: '处理中', 2: '已完成', 3: '失败' }
  return texts[status] || '未知'
}
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.upload-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
}

.video-task-card {
  margin-bottom: 20px;
}

.video-preview {
  width: 100%;
  height: 200px;
  background: #000;
  border-radius: 4px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.video-preview video {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.no-video {
  text-align: center;
  color: #909399;
}

.no-video .el-icon {
  font-size: 48px;
  margin-bottom: 10px;
}

.task-info {
  margin: 15px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.task-info h4 {
  margin: 0;
}

.task-meta {
  color: #909399;
  font-size: 12px;
  margin-bottom: 10px;
}

.task-actions {
  display: flex;
  gap: 10px;
}
</style>
