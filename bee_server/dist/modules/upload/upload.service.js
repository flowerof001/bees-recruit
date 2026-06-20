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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var UploadService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const uuid_1 = require("uuid");
let UploadService = UploadService_1 = class UploadService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(UploadService_1.name);
        this.maxFileSize = 10 * 1024 * 1024;
        this.allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        this.allowedDocTypes = ['application/pdf', 'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        this.uploadDir = this.configService.get('UPLOAD_DIR', path.join(process.cwd(), 'uploads'));
        this.baseUrl = this.configService.get('UPLOAD_BASE_URL', process.env.UPLOAD_BASE_URL || 'http://localhost:3000/uploads');
        if (!fs.existsSync(this.uploadDir)) {
            fs.mkdirSync(this.uploadDir, { recursive: true });
        }
    }
    async uploadAvatar(file, userId) {
        this.validateImage(file);
        const result = await this.saveFile(file, `avatars/${userId}`);
        this.logger.log(`头像上传: ${result.url}`);
        return result;
    }
    async uploadResumeAttachment(file, userId) {
        this.validateDocument(file);
        const result = await this.saveFile(file, `resumes/${userId}`);
        this.logger.log(`简历附件上传: ${result.url}`);
        return result;
    }
    async uploadCompanyLogo(file, tenantId) {
        this.validateImage(file);
        const result = await this.saveFile(file, `companies/${tenantId}`);
        this.logger.log(`企业Logo上传: ${result.url}`);
        return result;
    }
    async deleteFile(key) {
        const filePath = path.join(this.uploadDir, key);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            this.logger.log(`文件已删除: ${key}`);
        }
    }
    async saveFile(file, subDir) {
        const dir = path.join(this.uploadDir, subDir);
        if (!fs.existsSync(dir))
            fs.mkdirSync(dir, { recursive: true });
        const ext = path.extname(file.originalname);
        const filename = `${(0, uuid_1.v4)()}${ext}`;
        const filePath = path.join(dir, filename);
        const key = `${subDir}/${filename}`;
        fs.writeFileSync(filePath, file.buffer);
        return {
            url: `${this.baseUrl}/${key}`,
            key,
            size: file.size,
            mimeType: file.mimetype,
            originalName: file.originalname,
        };
    }
    validateImage(file) {
        if (file.size > this.maxFileSize)
            throw new common_1.BadRequestException('文件大小不能超过 10MB');
        if (!this.allowedImageTypes.includes(file.mimetype)) {
            throw new common_1.BadRequestException('仅支持 JPG、PNG、GIF、WebP 格式');
        }
    }
    validateDocument(file) {
        if (file.size > this.maxFileSize)
            throw new common_1.BadRequestException('文件大小不能超过 10MB');
        if (!this.allowedDocTypes.includes(file.mimetype)) {
            throw new common_1.BadRequestException('仅支持 PDF、DOC、DOCX 格式');
        }
    }
};
exports.UploadService = UploadService;
exports.UploadService = UploadService = UploadService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], UploadService);
//# sourceMappingURL=upload.service.js.map