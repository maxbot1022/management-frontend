<template>
  <div class="image-page">
    <div class="page-header">
      <h2>图片制作</h2>
      <el-button type="primary" @click="showCreateDialog = true">
        <el-icon><Plus /></el-icon>新建生图任务
      </el-button>
    </div>

    <!-- 创建任务对话框 -->
    <el-dialog v-model="showCreateDialog" title="新建图片生成任务" width="700px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="选择项目" required>
          <el-select v-model="form.projectId" placeholder="请选择项目" style="width: 100%">
            <el-option v-for="p in projects" :key="p.id" :label="p.name" :value="p.id" />
          </el-select>
        </el-form-item>

        <el-form-item label="任务名称" required>
          <el-input v-model="form.taskName" placeholder="请输入任务名称" />
        </el-form-item>

        <el-form-item label="参考图片">
          <el-upload
            class="upload-demo"
            action="#"
            :auto-upload="false"
            :on-change="handleFileChange"
            accept="image/*"
            :limit="1"
            list-type="picture-card"
          >
            <el-icon><Plus /></el-icon>
          </el-upload>
          <p class="upload-tip">上传参考图可以生成风格一致的图片（用于角色一致性）</p>
        </el-form-item>

        <el-form-item label="尺寸">
          <el-radio-group v-model="form.size">
            <el-radio-button label="1024x1024">1:1 方形</el-radio-button>
            <el-radio-button label="1024x1536">2:3 竖版</el-radio-button>
            <el-radio-button label="1536x1024">3:2 横版</el-radio-button>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="提示词" required>
          <el-input 
            v-model="form.prompt" 
            type="textarea" 
            :rows="4"
            placeholder="描述你想要生成的图片内容，如：一位穿着古装的年轻女子，站在樱花树下，面带微笑..."
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="createTask" :loading="loading">创建</el-button>
      </template>
    </el-dialog>

    <!-- 任务列表 -->
    <el-card>
      <template #header><span>图片任务列表</span></template>
      
      <el-row :gutter="20">
        <el-col :span="6" v-for="task in tasks" :key="task.id">
          <el-card class="image-task-card" shadow="hover">
            <div class="image-preview">
              <img v-if="task.resultUrl" :src="task.resultUrl" alt="生成结果" />
              <div v-else class="no-image">
                <el-icon><Picture /></el-icon>
                <p>{{ getStatusText(task.status) }}</p>
              </div>
            </div>
            
            <div class="task-info">
              <h4>{{ task.taskName }}</h4>
              <el-tag :type="getStatusType(task.status)" size="small">
                {{ getStatusText(task.status) }}
              </el-tag>
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
                @click="markAsCharacter(task)"
              >设为定妆照</el-button>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </el-card>

    <!-- 设为定妆照对话框 -->
    <el-dialog v-model="showCharacterDialog" title="设为角色定妆照" width="400px">
      <el-form :model="characterForm" label-width="80px">
        <el-form-item label="角色名称">
          <el-input v-model="characterForm.name" placeholder="如：女主角、男主角..." />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCharacterDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmMarkCharacter">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { projectApi, taskApi, fileApi } from '../api'

const projects = ref([])
const tasks = ref([])
const showCreateDialog = ref(false)
const showCharacterDialog = ref(false)
const loading = ref(false)
const currentFile = ref(null)
const currentTask = ref(null)

const form = ref({
  projectId: '',
  taskName: '',
  prompt: '',
  size: '1024x1024'
})

const characterForm = ref({
  name: ''
})

onMounted(() => {
  loadProjects()
  loadTasks()
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
      const res = await taskApi.listImageTasks(p.id)
      allTasks.push(...res.data)
    }
    tasks.value = allTasks
  } catch (error) {
    console.error('加载任务失败', error)
  }
}

const handleFileChange = (file) => {
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
    if (currentFile.value) {
      const uploadRes = await fileApi.uploadImage(currentFile.value)
      referenceImageUrl = uploadRes.data.url
    }

    const sizeArr = form.value.size.split('x')
    await taskApi.createImageTask({
      projectId: form.value.projectId,
      taskName: form.value.taskName,
      prompt: form.value.prompt,
      referenceImageUrl,
      width: parseInt(sizeArr[0]),
      height: parseInt(sizeArr[1])
    })

    ElMessage.success('创建成功')
    showCreateDialog.value = false
    form.value = { projectId: '', taskName: '', prompt: '', size: '1024x1024' }
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
    await taskApi.submitImageTask(id)
    ElMessage.success('已提交生成')
    loadTasks()
  } catch (error) {
    ElMessage.error('提交失败')
  }
}

const markAsCharacter = (task) => {
  currentTask.value = task
  characterForm.value.name = ''
  showCharacterDialog.value = true
}

const confirmMarkCharacter = async () => {
  if (!currentTask.value) return
  try {
    await taskApi.markCharacterPhoto(currentTask.value.id, { 
      characterName: characterForm.value.name 
    })
    ElMessage.success('已设为定妆照')
    showCharacterDialog.value = false
    loadTasks()
  } catch (error) {
    ElMessage.error('操作失败')
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

.image-task-card {
  margin-bottom: 20px;
}

.image-preview {
  width: 100%;
  height: 200px;
  background: #f5f7fa;
  border-radius: 4px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-image {
  text-align: center;
  color: #909399;
}

.no-image .el-icon {
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

.task-actions {
  display: flex;
  gap: 10px;
}
</style>
