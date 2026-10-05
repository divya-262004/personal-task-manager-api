import { Task } from "../models/index.js";
import AppError from "../utils/AppError.js";
import { Op } from "sequelize";

import { 
    clearTaskCache,
    createTaskCacheKey,
    getCache, 
    setCache 
    } 
    from "../utils/cache.js";

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

    clearTaskCache(userId);

    return task;
};

export const getTasks = async ( userId, filters) => {

    const cachKey=createTaskCacheKey(userId, filters);
    const cachResult=getCache(cachKey);

    if(cachResult){
        return cachResult;
    }

    const where = {
        userId
    };

    if (filters.priority) {
        where.priority = filters.priority;
    }

    if (filters.status) {
        where.status = filters.status;
    }

    if (filters.dueDateFrom || filters.dueDateTo) {
        where.dueDate = {};

        if (filters.dueDateFrom) {
            where.dueDate[Op.gte] = filters.dueDateFrom;
        }

        if (filters.dueDateTo) {
            where.dueDate[Op.lte] =filters.dueDateTo;
        }
    }

    let orderBy = [];

    if (filters.sortBy === "dueDate") {
        orderBy = [
            [
                "dueDate",
                filters.order === "desc" ? "DESC" : "ASC"
            ]
        ];
    }

    if (filters.sortBy === "priority") {
        orderBy = [
                ["priority", filters.order === "desc" ? "DESC" : "ASC" ]
            ];
    }

    const pageNumber = Number(filters.page);
    const pageSize = Number(filters.limit);
    const offset = (pageNumber - 1) * pageSize;

    const {count, rows} = await Task.findAndCountAll({
        where,
        order: orderBy,
        limit: pageSize,
        offset
    });

    const result= {
        tasks: rows,
        totalTasks: count,
        currentPage: pageNumber,
        totalPages: Math.ceil(count / pageSize),
        limit: pageSize
    };

    setCache(cachKey, result);

    return result;

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

    clearTaskCache(userId);

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
    clearTaskCache(userId);
};