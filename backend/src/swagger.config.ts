export const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Docs',
      version: '1.0.0',
      description: 'API for my app',
    },
    servers: [
      { url: 'https://kiet-express-boilerplate-ecommerce.onrender.com/api/v1' },
      // Có thể thêm cả localhost nếu muốn dùng cả local:
      { url: 'http://localhost:8000/api/v1' },
    ],
  },
  apis: [
    './src/module/**/*.ts', // Tìm tất cả file .ts trong module (controller, route)
    './src/module/**/*.js', // Nếu chạy production bằng js
  ],
};
