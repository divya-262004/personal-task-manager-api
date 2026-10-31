import User from './User.js';
import Task from './Task.js';
import TaskCollaborator from './TaskCollaborator.js';
import TaskAttachment from './TaskAttachment.js';
import TaskReminder from './TaskReminder.js';
import GoogleCalendarConnection from './GoogleCalendarConnection.js';
import DailyDigest from './DailyDigest.js';

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

Task.hasMany(TaskAttachment, {
  foreignKey: 'taskId',
  as: 'attachments',
});

TaskAttachment.belongsTo(Task, {
  foreignKey: 'taskId',
  as: 'task',
});

Task.hasMany(TaskReminder, {
  foreignKey: 'taskId',
  as: 'reminders',
});

TaskReminder.belongsTo(Task, {
  foreignKey: 'taskId',
  as: 'task',
});

User.hasMany(TaskReminder, {
  foreignKey: 'userId',
  as: 'reminders',
});

TaskReminder.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

User.hasOne(GoogleCalendarConnection, {
  foreignKey: 'userId',
  onDelete: 'CASCADE',
});

GoogleCalendarConnection.belongsTo(User, {
  foreignKey: 'userId',
});

User.hasMany(DailyDigest, {
  foreignKey: 'userId',
  as: 'dailyDigests',
});

DailyDigest.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

export {
  User,
  Task,
  TaskCollaborator,
  TaskAttachment,
  TaskReminder,
  GoogleCalendarConnection,
  DailyDigest,
};
