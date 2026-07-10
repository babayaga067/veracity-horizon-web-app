"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserMongoRepository = void 0;
const user_model_1 = require("../models/user.model");
class UserMongoRepository {
    async getUserById(id) {
        return await user_model_1.UserModel.findOne({ _id: id });
    }
    async getUserByEmail(email) {
        return await user_model_1.UserModel.findOne({ email });
    }
    async getUserByUsername(username) {
        return await user_model_1.UserModel.findOne({ username });
    }
    async createUser(user) {
        return await user_model_1.UserModel.create(user);
    }
    async getAll(page = 1, limit = 10, search = "") {
        const query = {};
        if (search) {
            query.$or = [
                { firstName: { $regex: search, $options: "i" } },
                { lastName: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
            ];
        }
        const total = await user_model_1.UserModel.countDocuments(query);
        const totalPages = Math.ceil(total / limit) || 1;
        const skip = (page - 1) * limit;
        const users = await user_model_1.UserModel.find(query).skip(skip).limit(limit);
        return { users, total, totalPages };
    }
    async update(id, user) {
        return await user_model_1.UserModel.findByIdAndUpdate(id, user, { returnDocument: "after" });
    }
    async delete(id) {
        const deleted = await user_model_1.UserModel.findByIdAndDelete(id);
        return !!deleted;
    }
}
exports.UserMongoRepository = UserMongoRepository;
//# sourceMappingURL=user.repository.js.map