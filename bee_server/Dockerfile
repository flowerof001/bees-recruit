FROM node:22-alpine
WORKDIR /app
RUN apk add --no-cache openssl
COPY package*.json ./
RUN npm ci --omit=dev --legacy-peer-deps
COPY prisma ./prisma
RUN npx prisma generate
COPY dist ./dist
COPY entrypoint.sh ./
RUN chmod +x entrypoint.sh
EXPOSE 3000
CMD ["./entrypoint.sh"]
