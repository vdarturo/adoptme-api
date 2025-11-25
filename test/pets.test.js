import chai from 'chai';
import supertest from 'supertest';
import app from '../src/app.js';

const expect = chai.expect;
const request = supertest(app);

describe('PETS API', () => {
  let petId;

  it('POST /api/pets - debe crear una nueva mascota', async () => {
    const res = await request.post('/api/pets').send({
      name: 'peluca',
      specie: 'gato',
      birthDate: '2021-01-01'
    });

    expect(res.status).to.equal(200);
    expect(res.body.payload).to.have.property('_id');
  });

  it('GET /api/pets - debe obtener todas las mascotas', async () => {
    const res = await request.get('/api/pets');
    expect(res.status).to.equal(200);
    expect(res.body.payload).to.be.an('array');
  });

  it('PUT /api/pets/:pid - debe actualizar una mascota por ID', async () => {
    const res = await request.put(`/api/pets/${petId}`).send({
        name: 'peluca actualizada',
        specie: 'gato',
        birthDate: '2021-01-01'
    });
    
    expect(res.status).to.equal(200);
    expect(res.body.message).to.equal('pet updated');
  });

  it('DELETE /api/pets/:pid - debe eliminar una mascota por ID', async () => {
    const res = await request.delete(`/api/pets/${petId}`);

    expect(res.status).to.equal(200);
    expect(res.body.message).to.equal('pet deleted');
  });
})