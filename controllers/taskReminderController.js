import {
  createTaskReminder,
  getTaskReminders,
  updateTaskReminder,
} from '../services/taskReminderService.js';

const createReminderController= async (req, res, next)=>{
  try {
    const taskId=Number(req.params.taskId);
    const userId=req.userId;
    const {minutesBefore}=req.body;

    const reminder= await createTaskReminder(
        taskId,
        userId,
        minutesBefore,
    );

    return res.status(201).json({
      message: 'Task reminder created successfully',
      data: reminder,
    });
  } catch (error) {
    return next(error);
  }
};

const getTaskReminderController=async (req, res, next)=>{
  try {
    const {taskId}=req.params;
    const userId=req.userId;

    const reminders=await getTaskReminders(
        Number(taskId),
        userId,
    );

    return res.status(200).json({
      message: 'Task reminders fetched successfully',
      data: reminders,
    });
  } catch (error) {
    return next(error);
  }
};

const updateTaskReminderController=async (req, res, next)=>{
  try {
    const {reminderId}=req.params;
    const {minutesBefore}=req.body;
    const userId=req.userId;

    const reminder=await updateTaskReminder(
        Number(reminderId),
        userId,
        minutesBefore,
    );

    return res.status(200).json({
      message: 'Task reminder updated successfully',
      data: reminder,
    });
  } catch (error) {
    return next(error);
  }
};
export {
  createReminderController,
  getTaskReminderController,
  updateTaskReminderController,
};
