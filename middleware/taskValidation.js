export const validateCreateTask = (req, res, next) => {
    const {
        title,
        priority,
        dueDate,
        status
    } = req.body;

    if (!title || !priority || !dueDate || !status) {
        return res.status(400).json({
            message: "Title, priority, dueDate, status are required"
        });
    }

    if (
        typeof title !== "string" ||
        title.trim().length === 0
    ) {
        return res.status(400).json({
            message: "Title must be a non-empty string"
        });
    }

    const validPriorities = [
        "low",
        "medium",
        "high"
    ];

    if (!validPriorities.includes(priority)) {
        return res.status(400).json({
            message: "Priority must be low, medium, or high"
        });
    }

    const validStatuses = [
        "pending",
        "completed"
    ];

    if (!validStatuses.includes(status)) {
        return res.status(400).json({
            message: "Status must be pending or completed"
        });
    }

    if (Number.isNaN(Date.parse(dueDate))) {
        return res.status(400).json({
            message: "dueDate must be a valid date"
        });
    }

    return next();
};

export const validateUpdateTask = (req, res, next) => {
    const {
        title,
        priority,
        dueDate,
        status
    } = req.body;

    const validPriorities = [
        "low",
        "medium",
        "high"
    ];

    const validStatuses = [
        "pending",
        "completed"
    ];

    if (
        title !== undefined &&
        (
            typeof title !== "string" ||
            title.trim().length === 0
        )
    ) {
        return res.status(400).json({
            message: "Title must be a non-empty string"
        });
    }

    if (
        priority !== undefined &&
        !validPriorities.includes(priority)
    ) {
        return res.status(400).json({
            message: "Priority must be low, medium, or high"
        });
    }

    if (
        status !== undefined &&
        !validStatuses.includes(status)
    ) {
        return res.status(400).json({
            message: "Status must be pending or completed"
        });
    }

    if (
        dueDate !== undefined &&
        Number.isNaN(Date.parse(dueDate))
    ) {
        return res.status(400).json({
            message: "dueDate must be a valid date"
        });
    }

    return next();
};

export const validateTaskQuery = (req, res, next) => {
    const {
        priority,
        status,
        dueDateFrom,
        dueDateTo,
        sortBy,
        order,
        page,
        limit
    } = req.query;

    const validPriorities = [
        "low",
        "medium",
        "high"
    ];

    const validStatuses = [
        "pending",
        "completed"
    ];

    const validSortFields = [
        "dueDate",
        "priority"
    ];

    const validOrders = [
        "asc",
        "desc"
    ];

    if (
        priority !== undefined &&
        !validPriorities.includes(priority)
    ) {
        return res.status(400).json({
            message: "Priority must be low, medium, or high"
        });
    }

    if (
        status !== undefined &&
        !validStatuses.includes(status)
    ) {
        return res.status(400).json({
            message: "Status must be pending or completed"
        });
    }

    if (
        dueDateFrom !== undefined &&
        Number.isNaN(Date.parse(dueDateFrom))
    ) {
        return res.status(400).json({
            message: "dueDateFrom must be a valid date"
        });
    }

    if (
        dueDateTo !== undefined &&
        Number.isNaN(Date.parse(dueDateTo))
    ) {
        return res.status(400).json({
            message: "dueDateTo must be a valid date"
        });
    }

    if (
        sortBy !== undefined &&
        !validSortFields.includes(sortBy)
    ) {
        return res.status(400).json({
            message: "sortBy must be dueDate or priority"
        });
    }

    if (
        order !== undefined &&
        !validOrders.includes(order)
    ) {
        return res.status(400).json({
            message: "order must be asc or desc"
        });
    }

    if (
        page !== undefined &&
        (
            !Number.isInteger(Number(page)) ||
            Number(page) < 1
        )
    ) {
        return res.status(400).json({
            message: "page must be a positive integer"
        });
    }

    if (
        limit !== undefined &&
        (
            !Number.isInteger(Number(limit)) ||
            Number(limit) < 1
        )
    ) {
        return res.status(400).json({
            message: "limit must be a positive integer"
        });
    }

    if (
        dueDateFrom &&
        dueDateTo &&
        new Date(dueDateFrom) > new Date(dueDateTo)
    ) {
        return res.status(400).json({
            message: "dueDateFrom cannot be after dueDateTo"
        });
    }

    return next();
};