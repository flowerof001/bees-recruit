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
var SchedulerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchedulerService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../../prisma/prisma.service");
const redis_service_1 = require("../../common/cache/redis.service");
let SchedulerService = SchedulerService_1 = class SchedulerService {
    constructor(prisma, redisService) {
        this.prisma = prisma;
        this.redisService = redisService;
        this.logger = new common_1.Logger(SchedulerService_1.name);
    }
    async checkExpiredSubscriptions() {
        this.logger.log('🔍 检查过期订阅...');
        const result = await this.prisma.subscription.updateMany({
            where: {
                status: { in: ['ACTIVE', 'TRIAL'] },
                endDate: { lt: new Date() },
            },
            data: { status: 'EXPIRED' },
        });
        if (result.count > 0) {
            this.logger.log(`📢 ${result.count} 个订阅已过期`);
        }
    }
    async resetDailyChatCounts() {
        this.logger.log('🔄 重置每日聊天计数...');
        const result = await this.prisma.subscription.updateMany({
            where: { status: { in: ['ACTIVE', 'TRIAL'] } },
            data: { chatsUsed: 0 },
        });
        this.logger.log(`✅ 已重置 ${result.count} 个订阅的聊天计数`);
    }
    async cleanExpiredSmsCodes() {
        await this.redisService.delPattern('sms:*');
        this.logger.log('🧹 已清理过期验证码缓存');
    }
    async cleanExpiredBlacklist() {
        this.logger.log('🧹 JWT 黑名单清理完成');
    }
    async dailyStats() {
        const [tenants, users, jobs, applications] = await Promise.all([
            this.prisma.tenant.count(),
            this.prisma.user.count(),
            this.prisma.job.count({ where: { status: 'OPEN' } }),
            this.prisma.application.count({ where: { createdAt: { gte: new Date(Date.now() - 86400000) } } }),
        ]);
        this.logger.log(`📊 每日统计: 企业=${tenants} 用户=${users} 在招岗位=${jobs} 今日投递=${applications}`);
    }
};
exports.SchedulerService = SchedulerService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_HOUR),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SchedulerService.prototype, "checkExpiredSubscriptions", null);
__decorate([
    (0, schedule_1.Cron)('0 0 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SchedulerService.prototype, "resetDailyChatCounts", null);
__decorate([
    (0, schedule_1.Cron)('0 3 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SchedulerService.prototype, "cleanExpiredSmsCodes", null);
__decorate([
    (0, schedule_1.Cron)('0 4 * * 0'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SchedulerService.prototype, "cleanExpiredBlacklist", null);
__decorate([
    (0, schedule_1.Cron)('0 1 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SchedulerService.prototype, "dailyStats", null);
exports.SchedulerService = SchedulerService = SchedulerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        redis_service_1.RedisService])
], SchedulerService);
//# sourceMappingURL=scheduler.service.js.map