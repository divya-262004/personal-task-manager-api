import {
  createCollaboratorService,
  removeCollaboratorService,
} from '../services/taskCollaboratorService.js';

const createCollaboratorController= async (req, res, next)=>{
  try {
    const collaborator=await createCollaboratorService(
        req.params.id,
        req.userId,
        req.body.userId,
        req.body.role,
    );

    res.status(201).json({
      message: 'Collaborator added successfully',
      data: collaborator,
    });
  } catch (error) {
    next(error);
  }
};

const removeCollaboratorController= async (req, res, next)=>{
  try {
    const collaborator=await removeCollaboratorService(
        req.params.id,
        req.userId,
        req.params.userId,
    );

    res.status(201).json({
      message: 'Collaborator removed successfully',
      data: collaborator,
    });
  } catch (error) {
    next(error);
  }
};
export {createCollaboratorController, removeCollaboratorController};


