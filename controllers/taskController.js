import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  syncTaskWithGoogleCalendar,
} from '../services/taskService.js';

export const createTaskController = async (req, res, next) => {
  try {
    const {
      title,
      description,
      priority,
      dueDate,
      status,
    } = req.body;

    const task = await createTask({
      title,
      description,
      priority,
      dueDate,
      status,
      userId: req.userId,
    });

    return res.status(201).json({
      message: 'Task created successfully',
      task,
    });
  } catch (error) {
    next(error);
  }
};

export const getTasksController = async (req, res, next) => {
  try {
    const {
      priority,
      status,
      dueDateFrom,
      dueDateTo,
      sortBy,
      order,
      page=1,
      limit=10,
    } = req.validatedQuery;
    const result=await getTasks(
        req.userId,
        {
          priority,
          status,
          dueDateFrom,
          dueDateTo,
          sortBy,
          order,
          page,
          limit,
        },
    );

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getTaskByIdController = async (req, res, next) => {
  try {
    const {id} = req.validatedParams;

    const task = await getTaskById(
        id,
        req.userId,
    );

    return res.status(200).json({
      task,
    });
  } catch (error) {
    next(error);
  }
};

export const updateTaskController = async (req, res, next) => {
  try {
    const {id} = req.validatedParams;

    const allowedFields = [
      'title',
      'description',
      'priority',
      'dueDate',
      'status',
    ];

    const taskData = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        taskData[field] = req.body[field];
      }
    }

    const task = await updateTask(
        id,
        req.userId,
        taskData,
    );

    return res.status(200).json({
      message: 'Task updated successfully',
      task,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTaskController = async (req, res, next) => {
  try {
    const {id} = req.validatedParams;

    await deleteTask(
        id,
        req.userId,
    );

    return res.status(204).end();
  } catch (error) {
    next(error);
  }
};

export const syncTaskWithGoogleCalendarController = async (
    req,
    res,
    next,
) => {
  try {
    const {id} = req.params;

    const task = await syncTaskWithGoogleCalendar(
        id,
        req.userId,
    );

    return res.status(200).json({
      message: 'Task synchronized with Google Calendar successfully',
      task,
    });
  } catch (error) {
    return next(error);
  }
};
