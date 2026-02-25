<template>
  <div class="dashboard">
    <!-- 统计卡片 -->
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-icon" style="background: #409EFF;">
            <el-icon><Folder /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.projects }}</div>
            <div class="stat-label">项目总数</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-icon" style="background: #67C23A;">
            <el-icon><Document /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.novelTasks }}</div>
            <div class="stat-label">小说任务</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-icon" style="background: #E6A23C;">
            <el-icon><Picture /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.imageTasks }}</div>
            <div class="stat-label">图片任务</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-icon" style="background: #F56C6C;">
            <el-icon><VideoCamera /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.videoTasks }}</div>
            <div class="stat-label">视频任务</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 快速操作 -->
    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>快速操作</span>
          </template>
          <div class="quick-actions">
            <el-button type="primary" @click="$router.push('/projects')">
              <el-icon><Plus /></el-icon>新建项目
            </el-button>
            <el-button type="success" @click="$router.push('/novel')">
              <el-icon><Document /></el-icon>整理小说
            </el-button>
            <el-button type="warning" @click="$router.push('/image')">
              <el-icon><Picture /></el-icon>生成图片
            </el-button>
            <el-button type="danger" @click="$router.push('/video')">
              <el-icon><VideoCamera /></el-icon>生成视频
            </el-button>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>工作流说明</span>
          </template>
          <div class="workflow">
            <el-steps :active="4" simple>
              <el-step title="上传小说" icon="Document" />
              <el-step title="AI整理" icon="MagicStick" />
              <el-step title="生成图片" icon="Picture" />
              <el-step title="生成视频" icon="VideoCamera" />
            </el-steps>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 最近项目 -->
    <el-card style="margin-top: 20px;">
      <template #header>
        <span>最近项目</span>
        <el-button link @click="$router.push('/projects')">查看全部</el-button>
      </template>
      <el-table :data="recentProjects" style="width: 100%">
        <el-table-column prop="name" label="项目名称" />
        <el-table-column prop="description" label="描述" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { projectApi } from '../api'

const stats = ref({
  projects: 0,
  novelTasks: 0,
  imageTasks: 0,
  videoTasks: 0
})

const recentProjects = ref([])

onMounted(async () => {
  try {
    const res = await projectApi.all()
    recentProjects.value = res.data.slice(0, 5)
    stats.value.projects = res.data.length
  } catch (error) {
    console.error('加载数据失败', error)
  }
})

const getStatusType = (status) => {
  const types = { 0: 'info', 1: 'warning', 2: 'success', 3: 'info' }
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = { 0: '草稿', 1: '进行中', 2: '已完成', 3: '已归档' }
  return texts[status] || '未知'
}
</script>

<style scoped>
.stat-card {
  display: flex;
  align-items: center;
  padding: 10px;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 28px;
}

.stat-info {
  margin-left: 15px;
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 5px;
}

.quick-actions {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.quick-actions .el-button {
  padding: 20px 30px;
}

.workflow {
  padding: 20px 0;
}
</style>
