"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobModule = void 0;
const common_1 = require("@nestjs/common");
const job_service_1 = require("./job.service");
const job_controller_1 = require("./job.controller");
const application_service_1 = require("./application.service");
const application_controller_1 = require("./application.controller");
const subscription_module_1 = require("../subscription/subscription.module");
let JobModule = class JobModule {
};
exports.JobModule = JobModule;
exports.JobModule = JobModule = __decorate([
    (0, common_1.Module)({
        imports: [(0, common_1.forwardRef)(() => subscription_module_1.SubscriptionModule)],
        controllers: [job_controller_1.JobController, application_controller_1.ApplicationController],
        providers: [job_service_1.JobService, application_service_1.ApplicationService],
        exports: [job_service_1.JobService, application_service_1.ApplicationService],
    })
], JobModule);
//# sourceMappingURL=job.module.js.map