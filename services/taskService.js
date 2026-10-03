import { Task } from "../models/index.js";
import AppError from "../utils/AppError.js";
import { Op, literal } from "sequelize";

export const createTask = async ({
    title,
    description,
    priority,
    dueDate,
    status,
    userId
}) => {
    const task = await Task.create({
        title,
        description,
        priority,
        dueDate,
        status,
        userId
    });

    return task;
};

export const getTasks = async (
    userId,
    {
        priority,
        status,
        dueDateFrom,
        dueDateTo,
        sortBy,
        order,
        page = 1,
        limit = 10
    } = {}
) => {
    const where = {
        userId
    };

    if (priority) {
        where.priority = priority;
    }

    if (status) {
        where.status = status;
    }

    if (dueDateFrom || dueDateTo) {
        where.dueDate = {};

        if (dueDateFrom) {
            where.dueDate[Op.gte] = dueDateFrom;
        }

        if (dueDateTo) {
            where.dueDate[Op.lte] = dueDateTo;
        }
    }

    let orderBy = [["dueDate", "ASC"]];

    if (sortBy === "dueDate") {
        orderBy = [
            [
                "dueDate",
                order === "desc" ? "DESC" : "ASC"
            ]
        ];
    }

    if (sortBy === "priority") {
        orderBy = [
            [
                literal(`
                    CASE
                        WHEN "priority" = 'low' THEN 1
                        WHEN "priority" = 'medium' THEN 2
                        WHEN "priority" = 'high' THEN 3
                    END
                `),
                order === "desc" ? "DESC" : "ASC"
            ]
        ];
    }

    const pageNumber = Number(page);
    const pageSize = Number(limit);
    const offset = (pageNumber - 1) * pageSize;

    const result = await Task.findAndCountAll({
        where,
        order: orderBy,
        limit: pageSize,
        offset
    });

    return {
        tasks: result.rows,
        totalTasks: result.count,
        currentPage: pageNumber,
        totalPages: Math.ceil(result.count / pageSize),
        limit: pageSize
    };
};

export const getTaskById = async (taskId, userId) => {
    const task = await Task.findOne({
        where: {
            id: taskId,
            userId
        }
    });

    if (!task) {
        throw new AppError("Task not found", 404);
    }

    return task;
};

export const updateTask = async (
    taskId,
    userId,
    taskData
) => {
    const task = await Task.findOne({
        where: {
            id: taskId,
            userId
        }
    });

    if (!task) {
        throw new AppError("Task not found", 404);
    }

    await task.update(taskData);

    return task;
};

export const deleteTask = async (
    taskId,
    userId
) => {
    const task = await Task.findOne({
        where: {
            id: taskId,
            userId
        }
    });

    if (!task) {
        throw new AppError("Task not found", 404);
    }

    await task.destroy();
};