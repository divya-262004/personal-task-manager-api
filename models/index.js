import User from "./user.js";
import Task from "./task.js";

User.hasMany(Task, {
    foreignKey: "userId"
});

Task.belongsTo(User, {
    foreignKey: "userId"
});

export { User, Task };