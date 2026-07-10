"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpException = void 0;
class HttpException extends Error {
    // any additional properties
    constructor(status, message) {
        super(message);
        this.status = status;
    }
}
exports.HttpException = HttpException;
//# sourceMappingURL=http-exception.js.map