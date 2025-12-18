const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Music Streamer API',
      version: '1.0.0',
      description: 'Express backend API for music streaming application with Supabase authentication',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token obtained from login/register'
        }
      }
    },
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and profile management endpoints'
      },
      {
        name: 'Playlists',
        description: 'User playlist management endpoints'
      }
    ]
  },
  apis: ['./src/routes/*.js'], // Path to the API docs
};

const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;
