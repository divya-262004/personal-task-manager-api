import express from "express"
import  authMiddleWare  from "../middleware/authMiddleware.js"
import {
    validateCreateTask,
    validateUpdateTask,
    validateTaskQuery
} from "../middleware/taskValidation.js";

import {
    createTaskController,
    getTasksController,
    getTaskByIdController,
    updateTaskController,
    deleteTaskController
} from "../controllers/taskController.js"

const router = express.Router();

router.use(authMiddleWare);

router.post("/", validateCreateTask,createTaskController);
router.get("/",validateTaskQuery,getTasksController);
router.get("/:id", getTaskByIdController);
router.patch("/:id", validateUpdateTask, updateTaskController);
router.delete("/:id", deleteTaskController);

export default router;
