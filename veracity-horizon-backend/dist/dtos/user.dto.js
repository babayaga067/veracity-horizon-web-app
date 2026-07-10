"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginUserDTO = exports.CreateUserDTO = void 0;
const user_type_1 = require("../types/user.type");
// DTO for creating a user (registration)
exports.CreateUserDTO = user_type_1.UserSchema.pick({
    firstName: true,
    lastName: true,
    email: true,
    username: true,
    password: true,
});
// DTO for login
exports.LoginUserDTO = user_type_1.UserSchema.pick({
    email: true,
    password: true,
});
//# sourceMappingURL=user.dto.js.map