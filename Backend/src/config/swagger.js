import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { getEnv } from './env.js';

const env = getEnv();

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Bravvo OS API',
            version: '1.0.0',
            description: 'API documentation for Bravvo OS',
        },
        servers: [
            {
                url: `http://localhost:${env.PORT || 3001}`,
                description: 'Development server',
            },
            {
                url: 'https://bravvoapi-production.up.railway.app',
                description: 'Production server',
            }
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
        security: [{
            bearerAuth: [],
        }],
    },
    apis: ['./src/routes/*.js', './src/controllers/*.js'],
};

const specs = swaggerJsdoc(options);

export const setupSwagger = (app) => {
    // Rota da interface do Swagger UI
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
        explorer: true,
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: "Bravvo OS API Docs"
    }));

    // Rota que retorna o JSON do OpenAPI genérico
    app.get('/api-docs.json', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(specs);
    });
};
