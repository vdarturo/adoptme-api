import request from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';
import petsRouter from '../src/routes/pets.router.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use('/api/pets', petsRouter);

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

describe('Pets Endpoints', () => {
    describe('GET /api/pets', () => {
        test('should return all pets with status success', async () => {
            const response = await request(app)
                .get('/api/pets')
                .expect(200);

            expect(response.body).toHaveProperty('status');
            expect(response.body.status).toBe('success');
            expect(response.body).toHaveProperty('payload');
            expect(Array.isArray(response.body.payload)).toBe(true);
        });
    });

    describe('POST /api/pets', () => {
        test('should create a new pet with valid data', async () => {
            const petData = {
                name: 'Fluffy',
                specie: 'cat',
                birthDate: '2020-01-15'
            };

            const response = await request(app)
                .post('/api/pets')
                .send(petData)
                .expect(200);

            expect(response.body).toHaveProperty('status');
            expect(response.body.status).toBe('success');
            expect(response.body).toHaveProperty('payload');
            expect(response.body.payload).toHaveProperty('_id');
        });

        test('should return error with incomplete data', async () => {
            const petData = {
                name: 'Fluffy'
            };

            const response = await request(app)
                .post('/api/pets')
                .send(petData)
                .expect(400);

            expect(response.body).toHaveProperty('status');
            expect(response.body.status).toBe('error');
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toBe('Incomplete values');
        });

        test('should return error when missing name', async () => {
            const petData = {
                specie: 'dog',
                birthDate: '2020-01-15'
            };

            const response = await request(app)
                .post('/api/pets')
                .send(petData)
                .expect(400);

            expect(response.body.status).toBe('error');
            expect(response.body.error).toBe('Incomplete values');
        });

        test('should return error when missing specie', async () => {
            const petData = {
                name: 'Rex',
                birthDate: '2020-01-15'
            };

            const response = await request(app)
                .post('/api/pets')
                .send(petData)
                .expect(400);

            expect(response.body.status).toBe('error');
        });

        test('should return error when missing birthDate', async () => {
            const petData = {
                name: 'Rex',
                specie: 'dog'
            };

            const response = await request(app)
                .post('/api/pets')
                .send(petData)
                .expect(400);

            expect(response.body.status).toBe('error');
        });
    });

    describe('PUT /api/pets/:pid', () => {
        let petId;

        beforeEach(async () => {
            // Crea una mascota para las pruebas
            const petData = {
                name: 'UpdateTest',
                specie: 'bird',
                birthDate: '2022-06-20'
            };

            const response = await request(app)
                .post('/api/pets')
                .send(petData);

            petId = response.body.payload._id;
        });

        test('should update a pet successfully', async () => {
            const updateData = {
                name: 'UpdatedName'
            };

            const response = await request(app)
                .put(`/api/pets/${petId}`)
                .send(updateData)
                .expect(200);

            expect(response.body).toHaveProperty('status');
            expect(response.body.status).toBe('success');
            expect(response.body).toHaveProperty('message');
            expect(response.body.message).toBe('pet updated');
        });
    });

    describe('DELETE /api/pets/:pid', () => {
        let petId;

        beforeEach(async () => {
            // Crea una mascota para las pruebas
            const petData = {
                name: 'DeleteTest',
                specie: 'hamster',
                birthDate: '2023-03-10'
            };

            const response = await request(app)
                .post('/api/pets')
                .send(petData);

            petId = response.body.payload._id;
        });

        test('should delete a pet successfully', async () => {
            const response = await request(app)
                .delete(`/api/pets/${petId}`)
                .expect(200);

            expect(response.body).toHaveProperty('status');
            expect(response.body.status).toBe('success');
            expect(response.body).toHaveProperty('message');
            expect(response.body.message).toBe('pet deleted');
        });
    });
});
