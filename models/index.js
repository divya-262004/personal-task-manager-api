import User from './User.js';
import Task from './Task.js';
import TaskCollaborator from './TaskCollaborator.js';

User.hasMany(Task, {
  foreignKey: 'userId',
});

Task.belongsTo(User, {
  foreignKey: 'userId',
});

User.hasMany(TaskCollaborator, {
  foreignKey: 'userId',
});

TaskCollaborator.belongsTo(User, {
  foreignKey: 'userId',
});

Task.hasMany(TaskCollaborator, {
  foreignKey: 'taskId',
});

TaskCollaborator.belongsTo(Task, {
  foreignKey: 'taskId',
});

User.belongsToMany(Task, {
  through: TaskCollaborator,
  foreignKey: 'userId',
  otherKey: 'taskId',
});

Task.belongsToMany(User, {
  through: TaskCollaborator,
  foreignKey: 'taskId',
  otherKey: 'userId',
});

export {User, Task, TaskCollaborator};
