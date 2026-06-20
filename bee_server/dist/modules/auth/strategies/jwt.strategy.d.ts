import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../prisma/prisma.service';
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    private prisma;
    constructor(configService: ConfigService, prisma: PrismaService);
    validate(payload: any): Promise<{
        id: string;
        username: string;
        role: string;
        adminRole: string;
        phone?: undefined;
        nickname?: undefined;
    } | {
        id: any;
        phone: any;
        role: any;
        nickname: any;
        username?: undefined;
        adminRole?: undefined;
    }>;
}
export {};
