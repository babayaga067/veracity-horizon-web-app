"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("./database/mongodb");
const constant_1 = require("./configs/constant");
const app_1 = __importDefault(require("./app"));
async function bootstrap() {
    await (0, mongodb_1.connectToMongoDB)();
    const server = app_1.default.listen(constant_1.PORT, () => {
        // eslint-disable-next-line no-console
        console.log(`Server running on port ${constant_1.PORT}`);
    });
    server.on("error", (err) => {
        console.error(`Server error: ${err.message}`);
        process.exit(1);
    });
}
bootstrap().catch((err) => {
    console.error("Bootstrap error:", err);
    process.exit(1);
});
//# sourceMappingURL=index.js.map