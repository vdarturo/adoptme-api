import chai from 'chai';
import supertest from 'supertest';
import app from '../src/app.js';

const expect = chai.expect;
const request = supertest(app);

describe('Users API', () => {
  let createUserId;

  it('POST /api/sessions/register - debe crear un nuevo usuario', async () => {
    const res = await request.post('/api/sessions/register').send({
        first_name: 'John',
        last_name: 'Doe',
        email: `john.Doe${Date.now()}@example.com`,
        password: '123456'
    });

    expect(res.status).to.equal(200);
    expect(res.body.payload).to.exist;
  });

  it('GET /api/users - debe obtener todos los usuarios', async () => {
    const res = await request.get('/api/users');
      
    expect(res.status).to.equal(200);
    expect(res.body.payload).to.be.an('array');
  });

  it('GET /api/users/:uid - debe obtener un usuario por ID', async () => {
    const res = await request.get(`/api/users/${createUserId}`);

    expect(res.status).to.equal(200);
    expect(res.body.payload).to.have.property('email');
  });

  it('PUT /api/users/:uid - debe actualizar un usuario por ID', async () => {
    const res = await request.put(`/api/users/${createUserId}`).send({
      first_name: 'Jane',
      last_name: 'Doe',
      email: `jane.Doe${Date.now()}@example.com`,
      password: '654321'
    });

    expect(res.status).to.equal(200);
    expect(res.body.message).to.equal('User updated');
  });

  it('DELETE /api/users/:uid - debe eliminar un usuario por ID', async () => {
    const res = await request.delete(`/api/users/${createUserId}`);
    
    expect(res.status).to.equal(200);
    expect(res.body.message).to.equal('User deleted');
  });
});