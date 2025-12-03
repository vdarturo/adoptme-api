import request from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';
import usersRouter from '../src/routes/users.router.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use('/api/users', usersRouter);

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

describe('Users Endpoints', () => {
    describe('GET /api/users', () => {
        test('should return all users with status success', async () => {
            const response = await request(app)
                .get('/api/users')
                .expect(200);

            expect(response.body).toHaveProperty('status');
            expect(response.body.status).toBe('success');
            expect(response.body).toHaveProperty('payload');
            expect(Array.isArray(response.body.payload)).toBe(true);
        });
    });

    describe('GET /api/users/:uid', () => {
        let userId;

        beforeEach(async () => {
            // Consigue el primer usuario o crea uno
            const usersResponse = await request(app).get('/api/users');
            if (usersResponse.body.payload.length > 0) {
                userId = usersResponse.body.payload[0]._id;
            }
        });

        test('should return a user by ID when it exists', async () => {
            if (userId) {
                const response = await request(app)
                    .get(`/api/users/${userId}`)
                    .expect(200);

                expect(response.body).toHaveProperty('status');
                expect(response.body.status).toBe('success');
                expect(response.body).toHaveProperty('payload');
                expect(response.body.payload).toHaveProperty('_id');
            }
        });

        test('should return 404 when user does not exist', async () => {
            const fakeId = '000000000000000000000000';
            const response = await request(app)
                .get(`/api/users/${fakeId}`)
                .expect(404);

            expect(response.body).toHaveProperty('status');
            expect(response.body.status).toBe('error');
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toBe('User not found');
        });
    });

    describe('PUT /api/users/:uid', () => {
        let userId;

        beforeEach(async () => {
            // Obtiene el primer usuario
            const usersResponse = await request(app).get('/api/users');
            if (usersResponse.body.payload.length > 0) {
                userId = usersResponse.body.payload[0]._id;
            }
        });

        test('should update a user when it exists', async () => {
            if (userId) {
                const updateData = {
                    first_name: 'UpdatedName'
                };

                const response = await request(app)
                    .put(`/api/users/${userId}`)
                    .send(updateData)
                    .expect(200);

                expect(response.body).toHaveProperty('status');
                expect(response.body.status).toBe('success');
                expect(response.body).toHaveProperty('message');
                expect(response.body.message).toBe('User updated');
            }
        });

        test('should return 404 when trying to update non-existent user', async () => {
            const fakeId = '000000000000000000000000';
            const updateData = {
                first_name: 'Test'
            };

            const response = await request(app)
                .put(`/api/users/${fakeId}`)
                .send(updateData)
                .expect(404);

            expect(response.body).toHaveProperty('status');
            expect(response.body.status).toBe('error');
            expect(response.body.error).toBe('User not found');
        });
    });

    describe('DELETE /api/users/:uid', () => {
        let userId;

        beforeEach(async () => {
            // Obtiene el primer usuario
            const usersResponse = await request(app).get('/api/users');
            if (usersResponse.body.payload.length > 0) {
                userId = usersResponse.body.payload[0]._id;
            }
        });

        test('should delete a user successfully', async () => {
            if (userId) {
                const response = await request(app)
                    .delete(`/api/users/${userId}`)
                    .expect(200);

                expect(response.body).toHaveProperty('status');
                expect(response.body.status).toBe('success');
                expect(response.body).toHaveProperty('message');
                expect(response.body.message).toBe('User deleted');
            }
        });
    });
});
