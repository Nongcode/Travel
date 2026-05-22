# Bước 1: Môi trường cài đặt và Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Bước 2: Tạo môi trường chạy thật (Production) siêu nhẹ
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Chỉ copy những file thiết yếu từ Bước 1 sang
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

# Lệnh khởi động ứng dụng
CMD ["npm", "run", "start"]