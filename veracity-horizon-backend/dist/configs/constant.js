"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SECRET_KEY = exports.MONGODB_URL = exports.PORT = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.PORT = Number(process.env.PORT) || 5000;
exports.MONGODB_URL = process.env.MONGODB_URL || (() => {
    throw new Error("MONGODB_URL environment variable is required");
})();
if (!process.env.SECRET_KEY) {
    throw new Error("SECRET_KEY environment variable is required");
}
exports.SECRET_KEY = process.env.SECRET_KEY;
//# sourceMappingURL=constant.js.map