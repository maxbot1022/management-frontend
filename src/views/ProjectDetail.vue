<template>
  <div class="project-detail" v-if="project">
    <el-page-header @back="$router.push('/projects')" :title="project.name" />
    
    <el-descriptions :column="2" border style="margin-top: 20px;">
      <el-descriptions-item label="项目ID">{{ project.id }}</el-descriptions-item>
      <el-descriptions-item label="状态">
        <el-tag :type="getStatusType(project.status)">{{ getStatusText(project.status) }}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="描述" :span="2">{{ project.description || '暂无描述' }}</el-descriptions-item>
      <el-descriptions-item label="创建时间">{{ project.createTime }}</el-descriptions-item>
      <el-descriptions-item label="更新时间">{{ project.updateTime }}</el-descriptions-item>
    </el-descriptions>

    <!-- 任务统计 -->
    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="8">
        <el-card>
          <template #header><span>小说整理任务</span></template>
          <div class="task-count">{{ novelTasks.length }}</div>
          <el-button type="primary" @click="$router.push('/novel')">去创建</el-button>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card>
          <template #header><span>图片制作任务</span></template>
          <div class="task-count">{{ imageTasks.length }}</div>
          <el-button type="primary" @click="$router.push('/image')">去创建</el-button>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card>
          <template #header><span>视频制作任务</span></template>
          <div class="task-count">{{ videoTasks.length }}</div>
          <el-button type="primary" @click="$router.push('/video')">去创建</el-button>
        </el-card>
      </el-col>
    </el-row>

    <!-- 任务列表 -->
    <el-tabs v-model="activeTab" style="margin-top: 20px;">
      <el-tab-pane label="小说整理" name="novel">
        <el-table :data="novelTasks">
          <el-table-column prop="taskName" label="任务名称" />
          <el-table-column prop="status" label="状态">
            <template #default="scope">
              <el-tag :type="getTaskStatusType(scope.row.status)">{{ getTaskStatusText(scope.row.status) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="创建时间" />
        </el-table>
      </el-tab-pane>

      <el-tab-pane label="图片制作" name="image">
        <el-table :data="imageTasks">
          <el-table-column prop="taskName" label="任务名称" />
          <el-table-column prop="status" label="状态">
            <template #default="scope">
              <el-tag :type="getTaskStatusType(scope.row.status)">{{ getTaskStatusText(scope.row.status) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="创建时间" />
        </el-table>
      </el-tab-pane>

      <el-tab-pane label="视频制作" name="video">
        <el-table :data="videoTasks">
          <el-table-column prop="taskName" label="任务名称" />
          <el-table-column prop="status" label="状态">
            <template #default="scope">
              <el-tag :type="getTaskStatusType(scope.row.status)">{{ getTaskStatusText(scope.row.status) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="创建时间" />
        </el-table>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { projectApi, taskApi } from '../api'

const route = useRoute()
const projectId = route.params.id
const project = ref(null)
const activeTab = ref('novel')
const novelTasks = ref([])
const imageTasks = ref([])
const videoTasks = ref([])

onMounted(() => {
  loadProject()
  loadTasks()
})

const loadProject = async () => {
  try {
    const res = await projectApi.detail(projectId)
    project.value = res.data
  } catch (error) {
    ElMessage.error('加载项目详情失败')
  }
}

const loadTasks = async () => {
  try {
    const [novelRes, imageRes, videoRes] = await Promise.all([
      taskApi.listNovelTasks(projectId),
      taskApi.listImageTasks(projectId),
      taskApi.listVideoTasks(projectId)
    ])
    novelTasks.value = novelRes.data
    imageTasks.value = imageRes.data
    videoTasks.value = videoRes.data
  } catch (error) {
    console.error('加载任务失败', error)
  }
}

const getStatusType = (status) => {
  const types = { 0: 'info', 1: 'warning', 2: 'success', 3: 'info' }
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = { 0: '草稿', 1: '进行中', 2: '已完成', 3: '已归档' }
  return texts[status] || '未知'
}

const getTaskStatusType = (status) => {
  const types = { 0: 'info', 1: 'warning', 2: 'success', 3: 'danger' }
  return types[status] || 'info'
}

const getTaskStatusText = (status) => {
  const texts = { 0: '待处理', 1: '处理中', 2: '已完成', 3: '失败' }
  return texts[status] || '未知'
}
</script>

<style scoped>
.task-count {
  font-size: 36px;
  font-weight: bold;
  color: #409EFF;
  margin: 20px 0;
}
</style>
