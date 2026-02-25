# 小说转视频管理平台 - 前端

基于 Vue 3 + Element Plus 的管理后台界面。

## 功能模块

- **工作台** - 项目统计、快捷入口
- **项目管理** - 项目创建、编辑、删除
- **小说整理** - 上传小说文本，AI整理分镜
- **图片制作** - 生成角色图片，支持定妆照标记
- **视频制作** - 基于图片首帧生成视频

## 技术栈

- Vue 3
- Vue Router 4
- Pinia
- Element Plus
- Axios

## 项目结构

```
management-frontend/
├── src/
│   ├── api/           # API接口封装
│   ├── components/    # 公共组件
│   ├── views/         # 页面视图
│   ├── router/        # 路由配置
│   ├── store/         # 状态管理
│   └── utils/         # 工具函数
├── public/
└── package.json
```

## 开发运行

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建生产包
npm run build
```

## 配置说明

在 `vite.config.js` 中配置后端 API 代理：

```javascript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8080',
      changeOrigin: true
    }
  }
}
```

## 部署

构建后的文件在 `dist` 目录，使用 Nginx 部署：

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        root /path/to/management-frontend/dist;
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://localhost:8080;
    }
}
```
