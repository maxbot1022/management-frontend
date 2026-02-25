import { createRouter, createWebHistory } from 'vue-router'
import Layout from '../views/Layout.vue'

const routes = [
  {
    path: '/',
    component: Layout,
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: () => import('../views/Dashboard.vue'),
        meta: { title: '工作台' }
      },
      {
        path: 'projects',
        name: 'Projects',
        component: () => import('../views/Projects.vue'),
        meta: { title: '项目管理' }
      },
      {
        path: 'project/:id',
        name: 'ProjectDetail',
        component: () => import('../views/ProjectDetail.vue'),
        meta: { title: '项目详情' }
      },
      {
        path: 'novel',
        name: 'Novel',
        component: () => import('../views/Novel.vue'),
        meta: { title: '小说整理' }
      },
      {
        path: 'image',
        name: 'Image',
        component: () => import('../views/Image.vue'),
        meta: { title: '图片制作' }
      },
      {
        path: 'video',
        name: 'Video',
        component: () => import('../views/Video.vue'),
        meta: { title: '视频制作' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
