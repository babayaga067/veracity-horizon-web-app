"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const user_route_1 = __importDefault(require("./routes/user.route"));
const user_route_2 = __importDefault(require("./routes/admin/user.route"));
const auction_route_1 = __importDefault(require("./routes/auction.route"));
const http_exception_1 = require("./exceptions/http-exception");
const apihelper_util_1 = require("./utils/apihelper.util");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const app = (0, express_1.default)();
// CORS setup
const corsOptions = {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
    credentials: true,
};
app.use((0, cors_1.default)(corsOptions));
// Middleware
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Serve uploaded images statically
const UPLOAD_DIR = process.env.UPLOAD_DIR || path_1.default.join(process.cwd(), "uploads");
if (!fs_1.default.existsSync(UPLOAD_DIR)) {
    fs_1.default.mkdirSync(UPLOAD_DIR, { recursive: true });
}
app.use("/api/v1/images", express_1.default.static(UPLOAD_DIR, {
    setHeaders: (res) => res.setHeader("Cache-Control", "public, max-age=31536000, immutable")
}));
// Routes
app.use("/api/v1/auth", user_route_1.default);
app.use("/api/v1/admin", user_route_2.default);
app.use("/api/v1/auctions", auction_route_1.default);
// Root routes
app.get("/", (req, res) => {
    return res.send("Hello, Veracity Horizon Auction App!");
});
// Global 404 handler
app.use((req, res) => {
    return res.status(404).json({ message: "API not found" });
});
// Global error handler
app.use((err, req, res, next) => {
    console.error("Error:", err);
    if (err instanceof http_exception_1.HttpException) {
        return apihelper_util_1.ApiResponseHelper.error(res, err.message, err.status);
    }
    return apihelper_util_1.ApiResponseHelper.error(res, "Internal Server Error", 500);
});
exports.default = app;
//# sourceMappingURL=app.js.map