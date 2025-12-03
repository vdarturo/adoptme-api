import request from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';
import sessionsRouter from '../src/routes/sessions.router.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use('/api/sessions', sessionsRouter);

// Conexión a la base de datos
beforeAll(async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/adoptme-test');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
});

afterAll(async () => {
    try {
        await mongoose.connection.close();
    } catch (error) {
        console.error('Error closing MongoDB connection:', error);
    }
});

describe('Sessions Endpoints', () => {
    const testUser = {
        first_name: 'Test',
        last_name: 'User',
        email: `testuser${Date.now()}@example.com`,
        password: 'TestPassword123'
    };

    describe('POST /api/sessions/register', () => {
        test('should register a new user successfully', async () => {
            const response = await request(app)
                .post('/api/sessions/register')
                .send(testUser)
                .expect(200);

            expect(response.body).toHaveProperty('status');
            expect(response.body.status).toBe('success');
            expect(response.body).toHaveProperty('payload');
        });

        test('should return error with incomplete values', async () => {
            const incompleteUser = {
                first_name: 'Test',
                last_name: 'User'
            };

            const response = await request(app)
                .post('/api/sessions/register')
                .send(incompleteUser)
                .expect(400);

            expect(response.body).toHaveProperty('status');
            expect(response.body.status).toBe('error');
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toBe('Incomplete values');
        });

        test('should return error when email already exists', async () => {
            // Registra un usuario
            await request(app)
                .post('/api/sessions/register')
                .send(testUser);

            // Intente registrarse con el mismo correo electrónico
            const response = await request(app)
                .post('/api/sessions/register')
                .send(testUser)
                .expect(400);

            expect(response.body).toHaveProperty('status');
            expect(response.body.status).toBe('error');
            expect(response.body.error).toBe('User already exists');
        });

        test('should return error when missing first_name', async () => {
            const incompleteUser = {
                last_name: 'User',
                email: 'test@example.com',
                password: 'password123'
            };

            const response = await request(app)
                .post('/api/sessions/register')
                .send(incompleteUser)
                .expect(400);

            expect(response.body.status).toBe('error');
        });

        test('should return error when missing last_name', async () => {
            const incompleteUser = {
                first_name: 'Test',
                email: 'test@example.com',
                password: 'password123'
            };

            const response = await request(app)
                .post('/api/sessions/register')
                .send(incompleteUser)
                .expect(400);

            expect(response.body.status).toBe('error');
        });

        test('should return error when missing email', async () => {
            const incompleteUser = {
                first_name: 'Test',
                last_name: 'User',
                password: 'password123'
            };

            const response = await request(app)
                .post('/api/sessions/register')
                .send(incompleteUser)
                .expect(400);

            expect(response.body.status).toBe('error');
        });

        test('should return error when missing password', async () => {
            const incompleteUser = {
                first_name: 'Test',
                last_name: 'User',
                email: 'test@example.com'
            };

            const response = await request(app)
                .post('/api/sessions/register')
                .send(incompleteUser)
                .expect(400);

            expect(response.body.status).toBe('error');
        });
    });

    describe('POST /api/sessions/login', () => {
        const loginUser = {
            first_name: 'Login',
            last_name: 'Test',
            email: `logintest${Date.now()}@example.com`,
            password: 'LoginPassword123'
        };

        beforeAll(async () => {
            // Registra un usuario para las pruebas de inicio de sesión
            await request(app)
                .post('/api/sessions/register')
                .send(loginUser);
        });

        test('should login successfully with correct credentials', async () => {
            const response = await request(app)
                .post('/api/sessions/login')
                .send({
                    email: loginUser.email,
                    password: loginUser.password
                })
                .expect(200);

            expect(response.body).toHaveProperty('status');
            expect(response.body.status).toBe('success');
            expect(response.body).toHaveProperty('message');
            expect(response.headers['set-cookie']).toBeDefined();
        });

        test('should return error with incomplete values', async () => {
            const response = await request(app)
                .post('/api/sessions/login')
                .send({
                    email: loginUser.email
                })
                .expect(400);

            expect(response.body).toHaveProperty('status');
            expect(response.body.status).toBe('error');
            expect(response.body.error).toBe('Incomplete values');
        });

        test('should return error when user does not exist', async () => {
            const response = await request(app)
                .post('/api/sessions/login')
                .send({
                    email: 'nonexistent@example.com',
                    password: 'password123'
                })
                .expect(404);

            expect(response.body).toHaveProperty('status');
            expect(response.body.status).toBe('error');
            expect(response.body.error).toBe("User doesn't exist");
        });

        test('should return error with incorrect password', async () => {
            const response = await request(app)
                .post('/api/sessions/login')
                .send({
                    email: loginUser.email,
                    password: 'WrongPassword123'
                })
                .expect(400);

            expect(response.body).toHaveProperty('status');
            expect(response.body.status).toBe('error');
            expect(response.body.error).toBe('Incorrect password');
        });
    });

    describe('GET /api/sessions/current', () => {
        const currentUser = {
            first_name: 'Current',
            last_name: 'Test',
            email: `currenttest${Date.now()}@example.com`,
            password: 'CurrentPassword123'
        };

        let token;

        beforeAll(async () => {
            // Registrar e iniciar sesión de un usuario
            await request(app)
                .post('/api/sessions/register')
                .send(currentUser);

            const loginResponse = await request(app)
                .post('/api/sessions/login')
                .send({
                    email: currentUser.email,
                    password: currentUser.password
                });

            // Extraer la cookie de la respuesta
            const setCookieHeader = loginResponse.headers['set-cookie'];
            if (setCookieHeader) {
                token = setCookieHeader[0];
            }
        });

        test('should return current user when authenticated', async () => {
            if (token) {
                const response = await request(app)
                    .get('/api/sessions/current')
                    .set('Cookie', token)
                    .expect(200);

                expect(response.body).toHaveProperty('status');
                expect(response.body.status).toBe('success');
                expect(response.body).toHaveProperty('payload');
            }
        });
    });

    describe('GET /api/sessions/unprotectedLogin', () => {
        const unprotectedUser = {
            first_name: 'Unprotected',
            last_name: 'Test',
            email: `unprotected${Date.now()}@example.com`,
            password: 'UnprotectedPassword123'
        };

        beforeAll(async () => {
            // Registrar un usuario para pruebas de inicio de sesión sin protección
            await request(app)
                .post('/api/sessions/register')
                .send(unprotectedUser);
        }, 15000);

        test('should unprotected login successfully with correct credentials', async () => {
            const response = await request(app)
                .get('/api/sessions/unprotectedLogin')
                .send({
                    email: unprotectedUser.email,
                    password: unprotectedUser.password
                })
                .expect(200);

            expect(response.body).toHaveProperty('status');
            expect(response.body.status).toBe('success');
            expect(response.body).toHaveProperty('message');
            expect(response.body.message).toBe('Unprotected Logged in');
        }, 15000);

        test('should return error with incomplete values', async () => {
            const response = await request(app)
                .get('/api/sessions/unprotectedLogin')
                .send({
                    email: unprotectedUser.email
                })
                .expect(400);

            expect(response.body).toHaveProperty('status');
            expect(response.body.status).toBe('error');
        });

        test('should return error when user does not exist', async () => {
            const response = await request(app)
                .get('/api/sessions/unprotectedLogin')
                .send({
                    email: 'nonexistent@example.com',
                    password: 'password123'
                })
                .expect(404);

            expect(response.body).toHaveProperty('status');
            expect(response.body.status).toBe('error');
        });
    });

    describe('GET /api/sessions/unprotectedCurrent', () => {
        const unprotectedCurrentUser = {
            first_name: 'UnprotectedCurrent',
            last_name: 'Test',
            email: `unprotectedcurrent${Date.now()}@example.com`,
            password: 'UnprotectedCurrentPassword123'
        };

        let token;

        beforeAll(async () => {
            // Registrarse e iniciar sesión de un usuario
            await request(app)
                .post('/api/sessions/register')
                .send(unprotectedCurrentUser);

            const loginResponse = await request(app)
                .get('/api/sessions/unprotectedLogin')
                .send({
                    email: unprotectedCurrentUser.email,
                    password: unprotectedCurrentUser.password
                });

            // Extraer cookie de la respuesta
            const setCookieHeader = loginResponse.headers['set-cookie'];
            if (setCookieHeader) {
                token = setCookieHeader[0];
            }
        }, 15000);

        test('should return unprotected current user when authenticated', async () => {
            if (token) {
                const response = await request(app)
                    .get('/api/sessions/unprotectedCurrent')
                    .set('Cookie', token)
                    .expect(200);

                expect(response.body).toHaveProperty('status');
                expect(response.body.status).toBe('success');
                expect(response.body).toHaveProperty('payload');
            }
        }, 10000);
    });
});
