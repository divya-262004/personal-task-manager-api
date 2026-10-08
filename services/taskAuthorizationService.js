import {Task, TaskCollaborator} from '../models/index.js';
import AppError from '../utils/AppError.js';

const getTaskAccess=async (taskId, userId)=>{
  const task=await Task.findByPk(taskId);

  if (!task) {
    throw new AppError('Task not found', 404);
  }

  if (task.userId===userId) {
    return {
      task,
      role: 'owner',
    };
  }

  const collaborator= await TaskCollaborator.findOne({
    where: {
      taskId,
      userId,
    },
  });

  if (!collaborator) {
    throw new AppError('You dont have access to this task', 403);
  }

  return {
    task,
    role: collaborator.role,
  };
};

const requireTaskRole= async (
    taskId,
    userId,
    allowedRoles,
)=>{
  const {task, role}=await getTaskAccess(taskId, userId);

  if (!allowedRoles.includes(role)) {
    throw new AppError('You dont have permission to perform this action', 403);
  }

  return {
    task,
    role,
  };
};

export {getTaskAccess, requireTaskRole};
