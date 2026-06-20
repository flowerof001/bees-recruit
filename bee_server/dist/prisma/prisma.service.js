"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var PrismaService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
let PrismaService = PrismaService_1 = class PrismaService extends client_1.PrismaClient {
    constructor() {
        super({ log: ['error', 'warn'] });
        this.logger = new common_1.Logger(PrismaService_1.name);
    }
    async onModuleInit() {
        const dbUrl = process.env.DATABASE_URL;
        if (!dbUrl) {
            this.logger.warn('⚠️ DATABASE_URL 未设置，跳过数据库连接。请在 Render 环境变量中配置后重新部署。');
            return;
        }
        try {
            await this.$connect();
            this.logger.log('📦 Prisma 已连接 PostgreSQL');
        }
        catch (err) {
            this.logger.error('❌ 数据库连接失败，服务将以降级模式运行');
            this.logger.error(err.message);
        }
    }
    async onModuleDestroy() {
        try {
            await this.$disconnect();
        }
        catch (_) {
        }
    }
};
exports.PrismaService = PrismaService;
exports.PrismaService = PrismaService = PrismaService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], PrismaService);
//# sourceMappingURL=prisma.service.js.map