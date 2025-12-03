import request from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';
import adoptionsRouter from '../src/routes/adoption.router.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use('/api/adoptions', adoptionsRouter);

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

describe('Adoptions Endpoints', () => {
    describe('GET /api/adoptions', () => {
        test('should return all adoptions with status success', async () => {
            const response = await request(app)
                .get('/api/adoptions')
                .expect(200);

            expect(response.body).toHaveProperty('status');
            expect(response.body.status).toBe('success');
            expect(response.body).toHaveProperty('payload');
            expect(Array.isArray(response.body.payload)).toBe(true);
        });
    });

    describe('GET /api/adoptions/:aid', () => {
        let adoptionId;

        beforeEach(async () => {
            // Obtiene la primera adopción o crea una
            const adoptionsResponse = await request(app).get('/api/adoptions');
            if (adoptionsResponse.body.payload.length > 0) {
                adoptionId = adoptionsResponse.body.payload[0]._id;
            }
        });

        test('should return an adoption by ID when it exists', async () => {
            if (adoptionId) {
                const response = await request(app)
                    .get(`/api/adoptions/${adoptionId}`)
                    .expect(200);

                expect(response.body).toHaveProperty('status');
                expect(response.body.status).toBe('success');
                expect(response.body).toHaveProperty('payload');
                expect(response.body.payload).toHaveProperty('_id');
            }
        });

        test('should return 404 when adoption does not exist', async () => {
            const fakeId = '000000000000000000000000';
            const response = await request(app)
                .get(`/api/adoptions/${fakeId}`)
                .expect(404);

            expect(response.body).toHaveProperty('status');
            expect(response.body.status).toBe('error');
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toBe('Adoption not found');
        });
    });

    describe('POST /api/adoptions/:uid/:pid', () => {
        test('should return 404 when user does not exist', async () => {
            const fakeUserId = '000000000000000000000000';
            const fakePetId = '000000000000000000000000';

            const response = await request(app)
                .post(`/api/adoptions/${fakeUserId}/${fakePetId}`)
                .expect(404);

            expect(response.body).toHaveProperty('status');
            expect(response.body.status).toBe('error');
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toBe('user Not found');
        });

        test('should return 404 when pet does not exist', async () => {
            // Obtiene el primer usuario
            const usersResponse = await request(app).get('/api/users');
            if (usersResponse.body && usersResponse.body.payload && usersResponse.body.payload.length > 0) {
                const userId = usersResponse.body.payload[0]._id;
                const fakePetId = '000000000000000000000000';

                const response = await request(app)
                    .post(`/api/adoptions/${userId}/${fakePetId}`)
                    .expect(404);

                expect(response.body).toHaveProperty('status');
                expect(response.body.status).toBe('error');
                expect(response.body.error).toBe('Pet not found');
            }
        });
    });
});
