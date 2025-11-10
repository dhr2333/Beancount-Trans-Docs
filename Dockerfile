# 构建阶段
FROM node:25-alpine AS builder

WORKDIR /app

# 复制包管理文件
COPY package*.json ./

# 安装依赖
RUN npm ci

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 生产阶段 - 使用 Nginx
FROM nginx:alpine

# 复制 nginx 配置文件
COPY conf/nginx.conf /etc/nginx/conf.d/default.conf

# 从构建阶段复制构建好的文件
COPY --from=builder /app/build /usr/share/nginx/html/docs

# 暴露端口
EXPOSE 80

# 启动 nginx
CMD ["nginx", "-g", "daemon off;"]