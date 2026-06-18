import { Injectable, OnModuleInit } from '@nestjs/common';

// 本地开发模式：内存数据库模拟
@Injectable()
export class PrismaService implements OnModuleInit {
  private store = new Map<string, any[]>();
  private idCounters = new Map<string, number>();

  async onModuleInit() {
    console.log('📦 内存数据库已就绪 (开发模式)');
  }

  private nextId(collection: string): string {
    const count = (this.idCounters.get(collection) || 0) + 1;
    this.idCounters.set(collection, count);
    return `${collection.slice(0, 4)}_${count}`;
  }

  private getCollection(name: string): any[] {
    if (!this.store.has(name)) this.store.set(name, []);
    return this.store.get(name)!;
  }

  // 通用方法
  user = this.createCollection('user');
  tenant = this.createCollection('tenant');
  tenantMember = this.createCollection('tenantMember');
  job = this.createCollection('job');
  resume = this.createCollection('resume');
  application = this.createCollection('application');
  conversation = this.createCollection('conversation');
  message = this.createCollection('message');
  subscriptionPlan = this.createCollection('subscriptionPlan');
  subscription = this.createCollection('subscription');
  payment = this.createCollection('payment');
  notification = this.createCollection('notification');
  admin = this.createCollection('admin');
  platform = this.createCollection('platform');
  loginLog = this.createCollection('loginLog');
  deviceSession = this.createCollection('deviceSession');
  passwordReset = this.createCollection('passwordReset');
  auditLog = this.createCollection('auditLog');
  systemConfig = this.createCollection('systemConfig');
  invoice = this.createCollection('invoice');

  private createCollection(name: string) {
    const self = this;
    const coll = this.getCollection(name);
    return {
      findUnique: async (args: any) => {
        const items = self.getCollection(name);
        if (args.where.id) return items.find((i: any) => i.id === args.where.id) || null;
        if (args.where.phone) return items.find((i: any) => i.phone === args.where.phone) || null;
        if (args.where.email) return items.find((i: any) => i.email === args.where.email) || null;
        if (args.where.slug) return items.find((i: any) => i.slug === args.where.slug) || null;
        if (args.where.username) return items.find((i: any) => i.username === args.where.username) || null;
        // compound keys like tenantId_userId
        const keys = Object.keys(args.where);
        return items.find((i: any) => keys.every(k => i[k] === args.where[k])) || null;
      },
      findFirst: async (args: any) => {
        const items = self.getCollection(name);
        let filtered = items;
        if (args?.where?.OR) {
          filtered = items.filter((i: any) =>
            args.where.OR.some((cond: any) =>
              Object.entries(cond).every(([k, v]: [string, any]) => {
                if (typeof v === 'object' && v?.contains) {
                  return String(i[k] || '').toLowerCase().includes(String(v.contains).toLowerCase());
                }
                return i[k] === v;
              })
            )
          );
        } else if (args?.where) {
          filtered = items.filter((i: any) =>
            Object.entries(args.where).every(([k, v]: [string, any]) => {
              if (k === 'OR') return true;
              if (typeof v === 'object' && v?.contains) {
                return String(i[k] || '').toLowerCase().includes(String(v.contains).toLowerCase());
              }
              if (typeof v === 'object' && v?.gte) return i[k] >= v.gte;
              if (typeof v === 'object' && v?.lte) return i[k] <= v.lte;
              if (typeof v === 'object' && v?.in) return v.in.includes(i[k]);
              return i[k] === v;
            })
          );
        }
        return filtered.length > 0 ? filtered[0] : null;
      },
      findMany: async (args: any) => {
        let items = [...self.getCollection(name)];
        if (args?.where?.OR) {
          items = items.filter((i: any) =>
            args.where.OR.some((cond: any) =>
              Object.entries(cond).every(([k, v]: [string, any]) => {
                if (typeof v === 'object' && v?.contains) {
                  return String(i[k] || '').toLowerCase().includes(String(v.contains).toLowerCase());
                }
                if (typeof v === 'object' && v?.has) return Array.isArray(i[k]) && i[k].includes(v.has);
                return i[k] === v;
              })
            )
          );
        } else if (args?.where) {
          items = items.filter((i: any) =>
            Object.entries(args.where).every(([k, v]: [string, any]) => {
              if (k === 'OR') return true;
              if (typeof v === 'object' && v?.contains) return String(i[k] || '').toLowerCase().includes(String(v.contains).toLowerCase());
              if (typeof v === 'object' && v?.gte) return i[k] >= v.gte;
              if (typeof v === 'object' && v?.lte) return i[k] <= v.lte;
              if (typeof v === 'object' && v?.in) return v.in.includes(i[k]);
              if (typeof v === 'object' && v?.not) return i[k] !== v.not;
              if (typeof v === 'object' && v?.has) return Array.isArray(i[k]) && i[k].includes(v.has);
              return i[k] === v;
            })
          );
        }
        if (args?.orderBy) {
          const key = Object.keys(args.orderBy)[0];
          const dir = args.orderBy[key];
          items.sort((a, b) => {
            const av = a[key] ?? ''; const bv = b[key] ?? '';
            return dir === 'desc' ? (bv > av ? 1 : -1) : (av > bv ? 1 : -1);
          });
        }
        if (args?.skip) items = items.slice(args.skip);
        if (args?.take) items = items.slice(0, args.take);
        // include _count
        if (args?.include?._count) {
          items = items.map((i: any) => ({
            ...i,
            _count: Object.fromEntries(
              Object.keys(args.include._count.select).map(k => [k, 0])
            ),
          }));
        }
        return items;
      },
      count: async (args?: any) => {
        let items = [...self.getCollection(name)];
        if (args?.where) {
          items = items.filter((i: any) =>
            Object.entries(args.where).every(([k, v]: [string, any]) => {
              if (typeof v === 'object' && v?.gte) return i[k] >= v.gte;
              if (typeof v === 'object' && v?.lt) return i[k] < v.lt;
              if (typeof v === 'object' && v?.in) return v.in.includes(i[k]);
              return i[k] === v;
            })
          );
        }
        return items.length;
      },
      create: async (args: any) => {
        const id = args.data.id || self.nextId(name);
        const item = { ...args.data, id, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
        if (args.include) {
          // handle nested creates (e.g., members)
          const nested = args.include;
          // simplified - just store the data
        }
        self.getCollection(name).push(item);
        return item;
      },
      createMany: async (args: any) => {
        for (const data of args.data) {
          const id = data.id || self.nextId(name);
          self.getCollection(name).push({ ...data, id, createdAt: new Date().toISOString() });
        }
        return { count: args.data.length };
      },
      update: async (args: any) => {
        const items = self.getCollection(name);
        const idx = items.findIndex((i: any) => i.id === args.where.id);
        if (idx >= 0) {
          items[idx] = { ...items[idx], ...args.data, updatedAt: new Date().toISOString() };
          return items[idx];
        }
        return null;
      },
      updateMany: async (args: any) => {
        const items = self.getCollection(name);
        let count = 0;
        for (let i = 0; i < items.length; i++) {
          const match = Object.entries(args.where).every(([k, v]: [string, any]) => {
            if (typeof v === 'object' && v?.in) return v.in.includes(items[i][k]);
            if (typeof v === 'object' && v?.lt) return new Date(items[i][k]) < v.lt;
            return items[i][k] === v;
          });
          if (match) {
            items[i] = { ...items[i], ...args.data, updatedAt: new Date().toISOString() };
            count++;
          }
        }
        return { count };
      },
      delete: async (args: any) => {
        const items = self.getCollection(name);
        const idx = items.findIndex((i: any) => {
          return Object.entries(args.where).every(([k, v]: [string, any]) => i[k] === v);
        });
        if (idx >= 0) { items.splice(idx, 1); return {}; }
        return null;
      },
      deleteMany: async (args: any) => {
        const items = self.getCollection(name);
        let count = 0;
        for (let i = items.length - 1; i >= 0; i--) {
          const match = Object.entries(args.where).every(([k, v]: [string, any]) => items[i][k] === v);
          if (match) { items.splice(i, 1); count++; }
        }
        return { count };
      },
      upsert: async (args: any) => {
        const existing = await (self as any)[name].findUnique({ where: args.where });
        if (existing) return await (self as any)[name].update({ where: args.where, data: args.update });
        return await (self as any)[name].create({ data: { ...args.create, ...args.where } });
      },
      aggregate: async (_args: any) => {
        return { _sum: { amount: 0 } };
      },
    };
  }
}
