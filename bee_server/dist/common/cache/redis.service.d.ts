import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
export declare class RedisService implements OnModuleInit, OnModuleDestroy {
    private configService;
    private readonly logger;
    private client;
    private prefix;
    constructor(configService: ConfigService);
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    getClient(): Redis | null;
    private key;
    set(key: string, value: any, ttlSeconds?: number): Promise<void>;
    get<T = any>(key: string): Promise<T | null>;
    del(key: string): Promise<void>;
    delPattern(pattern: string): Promise<void>;
    incr(key: string, ttlSeconds?: number): Promise<number>;
    sadd(key: string, ...members: string[]): Promise<void>;
    sismember(key: string, member: string): Promise<boolean>;
    srem(key: string, ...members: string[]): Promise<void>;
    publish(channel: string, message: string): Promise<void>;
}
