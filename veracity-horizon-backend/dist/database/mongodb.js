"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectToMongoDB = connectToMongoDB;
const mongoose_1 = __importDefault(require("mongoose"));
const constant_1 = require("../configs/constant");
async function connectToMongoDB() {
    try {
        await mongoose_1.default.connect(constant_1.MONGODB_URL);
        // Connected successfully
    }
    catch (err) {
        // Re-throw so bootstrap can fail fast
        throw err;
    }
}
//# sourceMappingURL=mongodb.js.map