"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parsePagination = parsePagination;
exports.paginatedResult = paginatedResult;
function parsePagination(query) {
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(query.pageSize, 10) || 20));
    return { skip: (page - 1) * pageSize, take: pageSize, page, pageSize };
}
function paginatedResult(items, total, page, pageSize) {
    return {
        items,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
    };
}
//# sourceMappingURL=pagination.js.map