import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import { PrismaService } from './prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.setGlobalPrefix('api/v1');
  app.enableCors({ origin: true, credentials: true });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }));
  app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads/' });

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('小蜜蜂招工平台 API')
    .setDescription('BeeRecruit SaaS Platform')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // 健康检查
  const httpAdapter = app.getHttpAdapter();
  httpAdapter.get('/health', (req: any, res: any) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString(), uptime: process.uptime() });
  });

  // 开发模式：种子数据
  const prisma = app.get(PrismaService);
  try {
    // 管理员
    const hash = await bcrypt.hash('admin123', 10);
    await prisma.admin.create({ data: { id: 'seed-admin-1', username: 'admin', passwordHash: hash, role: 'SUPER_ADMIN' } });
    // 套餐
    await prisma.subscriptionPlan.createMany({ data: [
      { id: 'FREE', name: 'FREE', nameCN: '免费版', priceMonthly: 0, priceYearly: 0, maxJobs: 3, maxRecruiters: 1, maxChatsPerDay: 10, features: ['发布3个岗位','1位招聘者','每日10次沟通'], recommended: false, isActive: true },
      { id: 'PRO', name: 'PRO', nameCN: '专业版', priceMonthly: 29900, priceYearly: 299000, maxJobs: 20, maxRecruiters: 5, maxChatsPerDay: 100, features: ['发布20个岗位','5位招聘者','每日100次沟通','优先展示'], recommended: true, isActive: true },
      { id: 'ENTERPRISE', name: 'ENTERPRISE', nameCN: '企业版', priceMonthly: 99900, priceYearly: 999000, maxJobs: 200, maxRecruiters: 50, maxChatsPerDay: 1000, features: ['发布200个岗位','50位招聘者','无限沟通','API对接','专属客服'], recommended: false, isActive: true },
    ]});
    // 平台
    await prisma.platform.create({ data: { id: 'default', name: '小蜜蜂招工平台' } });
    console.log('🌱 种子数据已加载 (admin/admin123, 3个套餐)');
  } catch (e) {
    // 种子数据可能已存在
  }

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🐝 小蜜蜂招工平台已启动: http://localhost:${port}`);
  console.log(`📖 API 文档: http://localhost:${port}/api/docs`);
}
bootstrap();
