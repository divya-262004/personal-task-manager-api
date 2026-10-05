
const swaggerSpec={
  openapi: '3.0.0',

  info: {
    title: 'Personal Task Manager API',
    version: '1.0.0',
    description: 'API documentation for the Personal Task Management API',
  },
  servers: [
    {
      url: 'http://localhost:3000',
    },
  ],
  tags: [
    {
      name: 'Authentication',
      description: 'User registration and login',
    },
    {
      name: 'Tasks',
      description: 'Task management operations',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  paths: {
    '/auth/register': {
      post: {
        tags: ['Authentication'],
        summary: 'Register a new User',
        requestBody: {
          required: true,

          content: {
            'application/json': {
              schema: {
                type: 'object',

                required: [
                  'username',
                  'email',
                  'password',
                ],

                properties: {
                  username: {
                    type: 'string',
                    example: 'Divya',
                  },
                  email: {
                    type: 'string',
                    format: 'email',
                    example: 'hema@example.com',
                  },
                  password: {
                    type: 'string',
                    format: 'password',
                    example: 'password123',
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'User registered successfully',
          },
          400: {
            description: 'Validation failed',
          },
          409: {
            description: 'Username or email already exists',
          },
          500: {
            description: 'Internal server error',
          },
        },
      },
    },

    '/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'Login User',
        requestBody: {
          required: true,

          content: {
            'application/json': {
              schema: {
                type: 'object',

                required: [
                  'email',
                  'password',
                ],

                properties: {

                  email: {
                    type: 'string',
                    format: 'email',
                    example: 'hema@example.com',
                  },
                  password: {
                    type: 'string',
                    format: 'password',
                    example: 'password123',
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Login successful',
          },
          400: {
            description: 'Validation failed',
          },
          401: {
            description: 'Invalid email or password',
          },
          500: {
            description: 'Internal server error',
          },
        },
      },
    },

    '/tasks': {
      post: {
        tags: ['Tasks'],
        summary: 'Create a new task',
        security: [
          {
            bearerAuth: [],
          },
        ],
        requestBody: {
          required: true,

          content: {
            'application/json': {
              schema: {
                type: 'object',

                required: [
                  'title',
                  'priority',
                  'dueDate',
                  'status',
                ],

                properties: {
                  title: {
                    type: 'string',
                    example: 'Learn Swagger',
                  },
                  description: {
                    type: 'string',
                    example: 'Document the Task Management API',
                  },
                  priority: {
                    type: 'string',
                    enum: ['low', 'medium', 'high'],
                    example: 'high',
                  },
                  dueDate: {
                    type: 'string',
                    format: 'date-time',
                    example: '2026-10-10T10:00:00.000Z',
                  },
                  status: {
                    type: 'string',
                    enum: ['pending', 'completed'],
                    example: 'pending',
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Task created successfully',
          },
          400: {
            description: 'Validation failed',
          },
          401: {
            description: 'Authorization token required',
          },
          500: {
            description: 'Internal server error',
          },
        },
      },

      get: {
        tags: ['Tasks'],
        summary: 'Get all tasks',
        security: [
          {
            bearerAuth: [],
          },
        ],
        parameters: [
          {
            name: 'priority',
            in: 'query',
            schema: {
              type: 'string',
              enum: ['low', 'medium', 'high'],
            },
            description: 'Filter tasks by priority',
          },
          {
            name: 'status',
            in: 'query',
            schema: {
              type: 'string',
              enum: ['pending', 'completed'],
            },
            description: 'Filter tasks by status',
          },
          {
            name: 'dueDateFrom',
            in: 'query',
            schema: {
              type: 'string',
              format: 'date-time',
            },
            description: 'Return tasks due on or after this date',
          },
          {
            name: 'dueDateTo',
            in: 'query',
            schema: {
              type: 'string',
              format: 'date-time',
            },
            description: 'Return tasks due on or before this date',
          },
          {
            name: 'sortBy',
            in: 'query',
            schema: {
              type: 'string',
              enum: ['dueDate', 'priority'],
            },
            description: 'Field used to sort tasks',
          },
          {
            name: 'order',
            in: 'query',
            schema: {
              type: 'string',
              enum: ['asc', 'desc'],
            },
            description: 'Sorting direction',
          },
          {
            name: 'page',
            in: 'query',
            schema: {
              type: 'integer',
              minimum: 1,
              default: 1,
            },
            description: 'Page number',
          },
          {
            name: 'limit',
            in: 'query',
            schema: {
              type: 'integer',
              minimum: 1,
              default: 10,
            },
            description: 'Number of tasks per page',
          },
        ],
        responses: {
          200: {
            description: 'Tasks retrieved successfully',
          },
          400: {
            description: 'Invalid query parameters',
          },
          401: {
            description: 'Authorization token required',
          },
          500: {
            description: 'Internal server error',
          },
        },
      },
    },

    '/tasks/{id}': {
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Task ID',
          schema: {
            type: 'integer',
            minimum: 1,
            example: 1,
          },
        },
      ],

      get: {
        tags: ['Tasks'],
        summary: 'Get a task by ID',
        security: [
          {
            bearerAuth: [],
          },
        ],
        responses: {
          200: {
            description: 'Task retrieved successfully',
          },
          400: {
            description: 'Invalid task ID',
          },
          401: {
            description: 'Authorization token required',
          },
          404: {
            description: 'Task not found',
          },
          500: {
            description: 'Internal server error',
          },
        },
      },

      patch: {
        tags: ['Tasks'],
        summary: 'Update a task',
        security: [
          {
            bearerAuth: [],
          },
        ],
        requestBody: {
          required: true,

          content: {
            'application/json': {
              schema: {
                type: 'object',

                properties: {
                  title: {
                    type: 'string',
                    example: 'Learn Swagger',
                  },
                  description: {
                    type: 'string',
                    example: 'Complete Swagger documentation',
                  },
                  priority: {
                    type: 'string',
                    enum: ['low', 'medium', 'high'],
                    example: 'high',
                  },
                  dueDate: {
                    type: 'string',
                    format: 'date-time',
                    example: '2026-10-15T10:00:00.000Z',
                  },
                  status: {
                    type: 'string',
                    enum: ['pending', 'completed'],
                    example: 'completed',
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Task updated successfully',
          },
          400: {
            description: 'Validation failed',
          },
          401: {
            description: 'Authorization token required',
          },
          404: {
            description: 'Task not found',
          },
          500: {
            description: 'Internal server error',
          },
        },
      },

      delete: {
        tags: ['Tasks'],
        summary: 'Delete a task',
        security: [
          {
            bearerAuth: [],
          },
        ],
        responses: {
          204: {
            description: 'Task deleted successfully',
          },
          400: {
            description: 'Invalid task ID',
          },
          401: {
            description: 'Authorization token required',
          },
          404: {
            description: 'Task not found',
          },
          500: {
            description: 'Internal server error',
          },
        },
      },
    },


  },


};


export default swaggerSpec;
