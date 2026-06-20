import { UploadService } from './upload.service';
export declare class UploadController {
    private uploadService;
    constructor(uploadService: UploadService);
    uploadAvatar(file: any, userId: string): Promise<import("./upload.service").UploadedFile>;
    uploadResume(file: any, userId: string): Promise<import("./upload.service").UploadedFile>;
    uploadLogo(file: any, tenantId: string): Promise<import("./upload.service").UploadedFile>;
    deleteFile(key: string): Promise<{
        success: boolean;
    }>;
}
