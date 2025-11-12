# 使用官方 Node.js 镜像作为构建阶段
FROM node:20-alpine AS build

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 pnpm-lock.yaml（如果使用 pnpm）
# 如果你使用的是 npm 或 yarn，请相应调整
COPY package*.json ./

# 安装依赖
RUN npm ci --silent

# 复制源代码
COPY . .

# 构建生产版本
RUN npm run build

# 使用轻量级 Nginx 镜像作为运行阶段
FROM nginx:alpine

# 删除默认的 nginx 配置
RUN rm -rf /usr/share/nginx/html/*

# 从构建阶段复制打包好的静态文件
COPY --from=build /app/dist /usr/share/nginx/html

# 复制自定义 nginx 配置（可选，用于支持 history 模式路由）
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 暴露 80 端口
EXPOSE 80

# 启动 nginx
CMD ["nginx", "-g", "daemon off;"]