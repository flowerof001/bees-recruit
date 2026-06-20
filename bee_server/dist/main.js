"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const path_1 = require("path");
const app_module_1 = require("./app.module");
const prisma_service_1 = require("./prisma/prisma.service");
const bcrypt = __importStar(require("bcryptjs"));
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.setGlobalPrefix('api/v1');
    app.enableCors({ origin: true, credentials: true });
    app.useGlobalPipes(new common_1.ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }));
    app.useStaticAssets((0, path_1.join)(process.cwd(), 'uploads'), { prefix: '/uploads/' });
    const httpAdapter = app.getHttpAdapter();
    httpAdapter.get('/', (req, res) => {
        res.redirect('/api/docs');
    });
    const config = new swagger_1.DocumentBuilder()
        .setTitle('小蜜蜂招工平台 API')
        .setDescription('BeeRecruit SaaS Platform')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/docs', app, document);
    httpAdapter.get('/health', (req, res) => {
        res.json({ status: 'ok', timestamp: new Date().toISOString(), uptime: process.uptime() });
    });
    const prisma = app.get(prisma_service_1.PrismaService);
    try {
        const hash = await bcrypt.hash('admin123', 10);
        await prisma.admin.create({ data: { id: 'seed-admin-1', username: 'admin', passwordHash: hash, role: 'SUPER_ADMIN' } });
        await prisma.subscriptionPlan.createMany({ data: [
                { id: 'FREE', name: 'FREE', nameCN: '免费版', priceMonthly: 0, priceYearly: 0, maxJobs: 3, maxRecruiters: 1, maxChatsPerDay: 10, features: ['发布3个岗位', '1位招聘者', '每日10次沟通'], recommended: false, isActive: true },
                { id: 'PRO', name: 'PRO', nameCN: '专业版', priceMonthly: 29900, priceYearly: 299000, maxJobs: 20, maxRecruiters: 5, maxChatsPerDay: 100, features: ['发布20个岗位', '5位招聘者', '每日100次沟通', '优先展示'], recommended: true, isActive: true },
                { id: 'ENTERPRISE', name: 'ENTERPRISE', nameCN: '企业版', priceMonthly: 99900, priceYearly: 999000, maxJobs: 200, maxRecruiters: 50, maxChatsPerDay: 1000, features: ['发布200个岗位', '50位招聘者', '无限沟通', 'API对接', '专属客服'], recommended: false, isActive: true },
            ] });
        await prisma.platform.create({ data: { id: 'default', name: '小蜜蜂招工平台' } });
        console.log('🌱 种子数据已加载 (admin/admin123, 3个套餐)');
    }
    catch (e) {
    }
    const port = process.env.PORT ?? 3000;
    await app.listen(port);
    console.log(`🐝 小蜜蜂招工平台已启动: http://localhost:${port}`);
    console.log(`📖 API 文档: http://localhost:${port}/api/docs`);
}
bootstrap();
//# sourceMappingURL=main.js.map