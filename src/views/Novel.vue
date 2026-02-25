<template>
  <div class="novel-page">
    <div class="page-header">
      <h2>小说整理</h2>
      <el-button type="primary" @click="showCreateDialog = true">
        <el-icon><Plus /></el-icon>新建整理任务
      </el-button>
    </div>

    <!-- 创建任务对话框 -->
    <el-dialog v-model="showCreateDialog" title="整本小说分段创建任务" width="700px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="选择项目" required>
          <el-select v-model="form.projectId" placeholder="请选择项目" style="width: 100%">
            <el-option 
              v-for="p in projects" 
              :key="p.id" 
              :label="p.name" 
              :value="p.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="任务名前缀" required>
          <el-input v-model="form.taskNamePrefix" placeholder="例如：斗破苍穹 第一卷" />
        </el-form-item>

        <el-form-item label="上传小说">
          <el-upload
            class="upload-demo"
            drag
            action="#"
            :auto-upload="false"
            :on-change="handleFileChange"
            accept=".txt"
            :limit="1"
          >
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">
              拖拽文件到此处或 <em>点击上传</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">支持 .txt 文本文件</div>
            </template>
          </el-upload>
        </el-form-item>

        <el-form-item label="整理要求">
          <el-input 
            v-model="form.prompt" 
            type="textarea" 
            :rows="4"
            placeholder="请输入整理要求，如：将小说整理成适合制作视频的分镜脚本，包含场景描述、人物动作、情绪等"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="createTask" :loading="loading">一键创建分段任务</el-button>
      </template>
    </el-dialog>

    <!-- 任务列表 -->
    <el-card>
      <template #header>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span>整理任务列表</span>
          <el-button
            type="primary"
            size="small"
            @click="batchSubmit"
            :disabled="!selectedTasks.length"
          >
            批量提交处理
          </el-button>
        </div>
      </template>
      
      <el-table :data="tasks" v-loading="loading" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="taskName" label="任务名称" />
        <el-table-column prop="projectId" label="所属项目">
          <template #default="scope">
            {{ getProjectName(scope.row.projectId) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">{{ getStatusText(scope.row.status) }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button 
              v-if="scope.row.status === 0"
              type="primary" 
              size="small"
              @click="submitTask(scope.row.id)"
            >
              开始整理
            </el-button>
            <el-button 
              v-if="scope.row.status === 2"
              type="success" 
              size="small"
              @click="viewResult(scope.row)"
            >
              查看结果
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 结果查看对话框 -->
    <el-dialog v-model="showResultDialog" title="整理结果" width="800px">
      <pre class="result-content">{{ currentResult }}</pre>
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
const showResultDialog = ref(false)
const loading = ref(false)
const currentFile = ref(null)
const currentResult = ref('')
const selectedTasks = ref([])

const form = ref({
  projectId: '',
  taskNamePrefix: '',
  prompt: ''
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
  loading.value = true
  try {
    // 获取所有项目的任务
    const allTasks = []
    for (const p of projects.value) {
      const res = await taskApi.listNovelTasks(p.id)
      allTasks.push(...res.data)
    }
    tasks.value = allTasks
  } catch (error) {
    console.error('加载任务失败', error)
  } finally {
    loading.value = false
  }
}

const handleFileChange = (file) => {
  currentFile.value = file.raw
}

const createTask = async () => {
  if (!form.value.projectId || !form.value.taskNamePrefix) {
    ElMessage.warning('请填写项目和任务名前缀')
    return
  }

  if (!currentFile.value) {
    ElMessage.warning('请上传整本小说 txt')
    return
  }

  loading.value = true
  try {
    // 1. 上传整本小说文本
    const uploadRes = await fileApi.uploadText(currentFile.value)
    const textUrl = uploadRes.data.url

    // 2. 调用后端接口，自动分段并批量创建任务
    const res = await taskApi.createNovelTasksFromWholeText({
      projectId: form.value.projectId,
      taskNamePrefix: form.value.taskNamePrefix,
      originalTextUrl: textUrl,
      prompt: form.value.prompt
    })

    const count = Array.isArray(res.data) ? res.data.length : 0
    ElMessage.success(`创建成功，共 ${count} 条分段任务`)
    showCreateDialog.value = false
    form.value = { projectId: '', taskNamePrefix: '', prompt: '' }
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
    await taskApi.submitNovelTask(id)
    ElMessage.success('已提交处理')
    loadTasks()
  } catch (error) {
    ElMessage.error('提交失败')
  }
}

const viewResult = (task) => {
  currentResult.value = task.resultJson || '暂无结果'
  showResultDialog.value = true
}

const handleSelectionChange = (rows) => {
  selectedTasks.value = rows
}

const batchSubmit = async () => {
  const pending = selectedTasks.value.filter(t => t.status === 0)
  if (!pending.length) {
    ElMessage.warning('请选择状态为待处理的任务')
    return
  }

  loading.value = true
  try {
    for (const t of pending) {
      await taskApi.submitNovelTask(t.id)
    }
    ElMessage.success(`已提交 ${pending.length} 条任务`)
    loadTasks()
  } catch (error) {
    console.error(error)
    ElMessage.error('批量提交失败')
  } finally {
    loading.value = false
  }
}

const getProjectName = (id) => {
  const p = projects.value.find(p => p.id === id)
  return p ? p.name : '-'
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

.result-content {
  background: #f5f7fa;
  padding: 20px;
  border-radius: 4px;
  max-height: 500px;
  overflow: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>
