import transporter from '../connection/email.js';
import config from '../config/config.js';
import logger from '../utils/logger.js';

const sendTaskReminderEmail= async ({
  to,
  taskTitle,
  dueDate,
})=>{
  try {
    await transporter.sendMail({
      from: config.email.user,
      to,
      subject: `Task Reminder: ${taskTitle}`,
      text: `Reminder for your task: ${taskTitle}
        Due Date: ${new Date(dueDate).toLocaleString()}`,
    });
  } catch (error) {
    logger.error('Failed to send task reminder email', {
      message: error.message,
    });

    throw error;
  }
};

export const sendDailyTaskDigestEmail = async ({
  email,
  digestDate,
  dueToday,
  overdue,
  highPriority,
}) => {
  const formatTasks = (tasks) => {
    if (tasks.length === 0) {
      return 'None';
    }

    return tasks.map((task) => {
      const formattedDueDate = new Date(task.dueDate)
          .toLocaleString('en-IN', {
            timeZone: 'Asia/Kolkata',
            dateStyle: 'medium',
            timeStyle: 'short',
          });
      const priorityLabel = task.priority === 'high' ?
      '[HIGH PRIORITY] ' : '';

      return `- ${priorityLabel}${task.title} (Due: ${formattedDueDate})`;
    }).join('\n');
  };

  try {
    const text = `
Your Daily Task Digest
Date: ${digestDate}

OVERDUE TASKS
${formatTasks(overdue)}

TASKS DUE TODAY
${formatTasks(dueToday)}

HIGH-PRIORITY PENDING TASKS
${formatTasks(highPriority)}
`;

    await transporter.sendMail({
      from: config.email.user,
      to: email,
      subject: `Your Daily Task Digest - ${digestDate}`,
      text,
    });
  } catch (error) {
    logger.error('Failed to send daily task digest email', {
      message: error.message,
    });

    throw error;
  }
};

export default sendTaskReminderEmail;
