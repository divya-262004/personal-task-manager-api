
import {Task, User, TaskCollaborator} from '../models/index.js';
import AppError from '../utils/AppError.js';
import {requireTaskRole} from './taskAuthorizationService.js';

const createCollaboratorService = async (
    taskId,
    requesterId,
    collaboratorId,
    role)=>{
  const task=await Task.findByPk(taskId);
  if (!task) {
    throw new AppError('Task not found', 404);
  }

  if (task.userId!==requesterId) {
    throw new AppError('Only the task owner can add collaborator', 403);
  }

  if (task.userId===collaboratorId) {
    throw new AppError('Task owner cannot be added as a collaborator', 400);
  }
  const collaboratorUser=await User.findByPk(collaboratorId);

  if (!collaboratorUser) {
    throw new AppError('User not found', 404);
  }

  const existingCollaborator=await TaskCollaborator.findOne({
    where: {
      taskId,
      userId: collaboratorId,
    },
  });

  if (existingCollaborator) {
    throw new AppError('User is already a collaborator', 409);
  }

  const collaborator=await TaskCollaborator.create({
    taskId,
    userId: collaboratorId,
    role,
  });
  return collaborator;
};


const removeCollaboratorService=async (
    taskId,
    requesterId,
    collaboratorId,
)=>{
  await requireTaskRole(taskId, requesterId, ['owner']);

  const collaborator=await TaskCollaborator.findOne({
    where: {
      taskId,
      userId: collaboratorId,
    },
  });

  if (!collaborator) {
    throw new AppError('Collaborator not found', 404);
  }

  await collaborator.destroy();
};
export {createCollaboratorService, removeCollaboratorService};
