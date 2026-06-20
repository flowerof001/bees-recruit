import { ConfigService } from '@nestjs/config';
export interface UploadedFile {
    url: string;
    key: string;
    size: number;
    mimeType: string;
    originalName: string;
}
export declare class UploadService {
    private configService;
    private readonly logger;
    private readonly uploadDir;
    private readonly baseUrl;
    private readonly maxFileSize;
    private readonly allowedImageTypes;
    private readonly allowedDocTypes;
    constructor(configService: ConfigService);
    uploadAvatar(file: any, userId: string): Promise<UploadedFile>;
    uploadResumeAttachment(file: any, userId: string): Promise<UploadedFile>;
    uploadCompanyLogo(file: any, tenantId: string): Promise<UploadedFile>;
    deleteFile(key: string): Promise<void>;
    private saveFile;
    private validateImage;
    private validateDocument;
}
