<template>
  <div class="projects">
    <div class="page-header">
      <el-button type="primary" @click="showCreateDialog = true">
        <el-icon><Plus /></el-icon>新建项目
      </el-button>
    </div>

    <el-row :gutter="20">
      <el-col :span="8" v-for="project in projects" :key="project.id">
        <el-card class="project-card" shadow="hover" @click="goToDetail(project.id)">
          <template #header>
            <div class="card-header">
              <span class="title">{{ project.name }}</span>
              <el-tag :type="getStatusType(project.status)" size="small">
                {{ getStatusText(project.status) }}
              </el-tag>
            </div>
          </template>
          
          <p class="description">{{ project.description || '暂无描述' }}</p>
          
          <div class="card-footer">
            <span class="time">{{ project.createTime }}</span>
            <el-button 
              type="danger" 
              link 
              size="small"
              @click.stop="deleteProject(project.id)"
            >
              删除
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 创建项目对话框 -->
    <el-dialog v-model="showCreateDialog" title="新建项目" width="500px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="项目名称" required>
          <el-input v-model="form.name" placeholder="请输入项目名称" />
        </el-form-item>
        <el-form-item label="项目描述">
          <el-input 
            v-model="form.description" 
            type="textarea" 
            :rows="3"
            placeholder="请输入项目描述"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="createProject" :loading="loading">创建</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { projectApi } from '../api'

const router = useRouter()
const projects = ref([])
const showCreateDialog = ref(false)
const loading = ref(false)
const form = ref({
  name: '',
  description: ''
})

onMounted(() => {
  loadProjects()
})

const loadProjects = async () => {
  try {
    const res = await projectApi.all()
    projects.value = res.data
  } catch (error) {
    ElMessage.error('加载项目失败')
  }
}

const createProject = async () => {
  if (!form.value.name) {
    ElMessage.warning('请输入项目名称')
    return
  }
  
  loading.value = true
  try {
    await projectApi.create(form.value)
    ElMessage.success('创建成功')
    showCreateDialog.value = false
    form.value = { name: '', description: '' }
    loadProjects()
  } catch (error) {
    ElMessage.error('创建失败')
  } finally {
    loading.value = false
  }
}

const deleteProject = async (id) => {
  try {
    await ElMessageBox.confirm('确定删除该项目吗？', '提示', {
      type: 'warning'
    })
    await projectApi.delete(id)
    ElMessage.success('删除成功')
    loadProjects()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const goToDetail = (id) => {
  router.push(`/project/${id}`)
}

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
.page-header {
  margin-bottom: 20px;
}

.project-card {
  margin-bottom: 20px;
  cursor: pointer;
  transition: transform 0.3s;
}

.project-card:hover {
  transform: translateY(-5px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  font-size: 16px;
  font-weight: bold;
}

.description {
  color: #606266;
  margin: 15px 0;
  min-height: 40px;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #ebeef5;
}

.time {
  font-size: 12px;
  color: #909399;
}
</style>
