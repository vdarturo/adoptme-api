import chai from 'chai';
import supertest from 'supertest';
import app from '../src/app.js';
import { usersService, petsService, adoptionsService } from '../src/services/index.js';

const expect = chai.expect;
const request = supertest(app);

describe('Adoptions API', () => {
  let userId;
  let petId;
  let adoptionId;

  before(async () => {
    const user = await usersService.create({
      first_name : 'Test',
      last_name: 'User',
      email: 'testingUser@example.com',
      password: 'testpassword',
      pets: [],
    })

    userId = user._id.toString();

    const pet = await petsService.create({
      name: 'testPet',
      specie: 'dog',
      birthDate: '2023-01-01',
      adopted: false,
    })
    petId = pet._id.toString();
  })

  after(async () => {
    await usersService.delete(userId);
    await petsService.delete(petId);
    if (adoptionId) {
      await adoptionsService.delete(adoptionId);
    }
  });

  it('GET /api/adoptions - debe obtener todas las adopciones', async () => {
    const res = await request.get('/api/adoptions');
    expect(res.status).to.equal(200);
    expect(res.body.status).to.equal('success');
    expect(res.body.payload).to.be.an('array');
  });
    
  it('POST /api/adoptions/:uid/:pid - debe crear una nueva adopción', async () => {
    const res = await request.post(`/api/adoptions/${userId}/${petId}`);
    expect(res.status).to.equal(200);
    expect(res.body.status).to.equal('success');
    expect(res.body.message).to.equal('Pet adopted');

    const adoption = await adoptionsService.getBy({
        owner: userId,
        pet: petId
    });
    expect(adoption).to.exist;
    adoptionId = adoption._id.toString();

    const updatedPet = await petsService.getBy({
        _id: petId
    });
    expect(updatedPet.adopted).to.be.true;
    expect(updatedPet.owner.toString()).to.equal(userId);

    const updatedUser = await usersService.getUserById(userId);
    console.log('updatedUser.pets (raw):', updatedUser.pets);
    console.log('petId:', petId);

    const petIds = updatedUser.pets.map((item) => item.toString());
    expect(petIds.some((item) => item.includes(petId)), `Expected petIds to include ${petId}, but got ${petIds}`).to.be.true;
  });

  it('GET /api/adoptions/:aid - debe obtener una adopcion por ID', async () => {
    const res = await request.get(`/api/adoptions/${adoptionId}`);

    expect(res.status).to.equal(200);
    expect(res.body.status).to.equal('success');
    expect(res.body.payload).to.have.property('_id', adoptionId);
    expect(res.body.payload.owner.toString()).to.equal(userId);
    expect(res.body.payload.pet.toString()).to.equal(petId);
  });

  it('GET /api/adoptions/:aid - debe devolver 404 si la adopción no existe', async () => {
    const nonExistentId = '66b1c2d3e4f5a6b7c8d9e0f1';
    const res = await request.get(`/api/adoptions/${nonExistentId}`);

    expect(res.status).to.equal(404);
    expect(res.body.status).to.equal('error');
    expect(res.body.error).to.equal('Adoption not found');
  });

  it('POST /api/adoptions/:uid/:pid - debe devolver 404 si el usuario no existe', async () => {
    const nonExistentUserId = '66b1c2d3e4f5a6b7c8d9e0f1';
    const res = await request.post(`/api/adoptions/${nonExistentUserId}/${petId}`);

    expect(res.status).to.equal(404);
    expect(res.body.status).to.equal('error');
    expect(res.body.error).to.equal('user Not found');
  });

  it('POST /api/adoptions/:uid/:pid - debe devolver 404 si la mascota no existe', async () => {
    const nonExistentPetId = '66b1c2d3e4f5a6b7c8d9e0f1';
    const res = await request.post(`/api/adoptions/${userId}/${nonExistentPetId}`);

    expect(res.status).to.equal(404);
    expect(res.body.status).to.equal('error');
    expect(res.body.error).to.equal('Pet not found');
  });
  
  it('POST /api/adoptions/:uid/:pid - debe devolver 400 si la mascota ya está adoptada', async () => {
    const res = await request.post(`/api/adoptions/${userId}/${petId}`);
    
    expect(res.status).to.equal(400);
    expect(res.body.status).to.equal('error');
    expect(res.body.error).to.equal('Pet is already adopted');
  });
})