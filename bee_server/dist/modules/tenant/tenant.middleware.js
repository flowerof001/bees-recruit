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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantMiddleware = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const jwt = __importStar(require("jsonwebtoken"));
function getHeader(req, name) {
    const val = req.headers[name];
    return Array.isArray(val) ? val[0] : val;
}
function getQuery(req, name) {
    const val = req.query[name];
    return typeof val === 'string' ? val : undefined;
}
function getParam(req, name) {
    const val = req.params?.[name];
    return typeof val === 'string' ? val : undefined;
}
let TenantMiddleware = class TenantMiddleware {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async use(req, _res, next) {
        const tenantId = getParam(req, 'tenantId')
            || getHeader(req, 'x-tenant-id')
            || getQuery(req, 'tenantId');
        if (!tenantId) {
            const token = getHeader(req, 'authorization');
            if (token?.startsWith('Bearer ')) {
                try {
                    const decoded = jwt.decode(token.slice(7));
                    if (decoded?.sub) {
                        const member = await this.prisma.tenantMember.findFirst({
                            where: { userId: decoded.sub },
                            select: { tenantId: true, tenant: true },
                        });
                        if (member) {
                            req.tenantId = member.tenantId;
                            req.tenant = member.tenant;
                        }
                    }
                }
                catch { }
            }
            return next();
        }
        const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
        if (!tenant)
            throw new common_1.BadRequestException('企业不存在');
        if (tenant.status === 'SUSPENDED')
            throw new common_1.UnauthorizedException('企业已被停用');
        req.tenantId = tenantId;
        req.tenant = tenant;
        next();
    }
};
exports.TenantMiddleware = TenantMiddleware;
exports.TenantMiddleware = TenantMiddleware = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TenantMiddleware);
//# sourceMappingURL=tenant.middleware.js.map