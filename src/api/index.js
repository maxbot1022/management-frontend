import request from './request'

// 项目相关 API
export const projectApi = {
  // 创建项目
  create: (data) => request.post('/project/create', data),
  // 更新项目
  update: (id, data) => request.post(`/project/update/${id}`, data),
  // 删除项目
  delete: (id) => request.post(`/project/delete/${id}`),
  // 获取项目详情
  detail: (id) => request.get(`/project/detail/${id}`),
  // 获取项目列表
  list: (params) => request.get('/project/list', { params }),
  // 获取所有项目
  all: () => request.get('/project/all')
}

// 文件上传 API
export const fileApi = {
  // 通用上传
  upload: (file, folder) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', folder)
    return request.post('/file/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  // 上传图片
  uploadImage: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return request.post('/file/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  // 上传视频
  uploadVideo: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return request.post('/file/upload/video', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  // 上传文本
  uploadText: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return request.post('/file/upload/text', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  }
}

// 任务相关 API
export const taskApi = {
  // ========== 小说任务 ==========
  createNovelTask: (data) => request.post('/task/novel/create', data),
  createNovelTasksFromWholeText: (data) => request.post('/task/novel/createFromWholeText', data),
  submitNovelTask: (id) => request.post(`/task/novel/submit/${id}`),
  listNovelTasks: (projectId) => request.get(`/task/novel/list/${projectId}`),

  // ========== 图片任务 ==========
  createImageTask: (data) => request.post('/task/image/create', data),
  submitImageTask: (id) => request.post(`/task/image/submit/${id}`),
  listImageTasks: (projectId) => request.get(`/task/image/list/${projectId}`),
  markCharacterPhoto: (id, data) => request.post(`/task/image/markCharacter/${id}`, data),
  getCharacterPhotos: (projectId) => request.get(`/task/image/characters/${projectId}`),

  // ========== 视频任务 ==========
  createVideoTask: (data) => request.post('/task/video/create', data),
  submitVideoTask: (id) => request.post(`/task/video/submit/${id}`),
  listVideoTasks: (projectId) => request.get(`/task/video/list/${projectId}`)
}
