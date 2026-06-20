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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResumeService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let ResumeService = class ResumeService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, dto) {
        if (dto.isDefault) {
            await this.prisma.resume.updateMany({ where: { userId }, data: { isDefault: false } });
        }
        return this.prisma.resume.create({ data: { ...dto, userId } });
    }
    async getMyResumes(userId) {
        return this.prisma.resume.findMany({
            where: { userId },
            orderBy: { updatedAt: 'desc' },
        });
    }
    async getById(resumeId, userId) {
        const resume = await this.prisma.resume.findFirst({ where: { id: resumeId, userId } });
        if (!resume)
            throw new common_1.NotFoundException('简历不存在');
        return resume;
    }
    async update(resumeId, userId, dto) {
        if (dto.isDefault) {
            await this.prisma.resume.updateMany({ where: { userId }, data: { isDefault: false } });
        }
        return this.prisma.resume.updateMany({
            where: { id: resumeId, userId },
            data: dto,
        });
    }
    async delete(resumeId, userId) {
        return this.prisma.resume.deleteMany({ where: { id: resumeId, userId } });
    }
};
exports.ResumeService = ResumeService;
exports.ResumeService = ResumeService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ResumeService);
//# sourceMappingURL=resume.service.js.map