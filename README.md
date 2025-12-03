# AdoptMe API

## Descripción del Proyecto

**AdoptMe API** es una API REST desarrollada con Express.js y MongoDB que facilita la gestión de adopciones de mascotas. El sistema permite registrar usuarios, gestionar mascotas, crear adopciones y mantener un registro completo de todas las transacciones.

### Características principales:

- 🐾 **Gestión de mascotas**: Crear, leer, actualizar y eliminar mascotas
- 👥 **Gestión de usuarios**: Registro, login y perfil de usuarios
- 📝 **Adopciones**: Crear y trackear adopciones de mascotas
- 🔐 **Autenticación**: Sistema de autenticación con JWT
- 📸 **Carga de imágenes**: Soporte para subir imágenes de mascotas
- ✅ **Tests**: Suite completa de tests con Jest y Supertest

## Requisitos

- Node.js (v14 o superior)
- MongoDB (local o remoto)
- Docker (opcional, para ejecutar con contenedores)
- npm

## Instalación

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Crear un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
PORT=8080
MONGO_URL=mongodb://localhost:27017/adoptme
```

## Ejecución

### Desarrollo

Para ejecutar la aplicación en modo desarrollo con recarga automática:

```bash
npm run dev
```

La API estará disponible en el puerto indicado en las variables por ejemplo: `http://localhost:8080`

### Producción

Para ejecutar la aplicación en modo producción:

```bash
npm run start
```

## Ejecución de Pruebas

### Ejecutar todos los tests

```bash
npm run test
```

### Ejecutar tests con cobertura

```bash
npm run test -- --coverage
```

### Ejecutar tests en modo watch (monitoreo)

```bash
npm run test -- --watch
```

## Tests Disponibles

El proyecto incluye tests completos para todos los endpoints:

### 📋 Pets Endpoints (`test/pets.test.js`)
- `GET /api/pets` - Obtener todas las mascotas
- `POST /api/pets` - Crear una nueva mascota
- `PUT /api/pets/:pid` - Actualizar una mascota
- `DELETE /api/pets/:pid` - Eliminar una mascota

### 👤 Users Endpoints (`test/users.test.js`)
- `GET /api/users` - Obtener todos los usuarios
- `GET /api/users/:uid` - Obtener un usuario específico
- `PUT /api/users/:uid` - Actualizar un usuario
- `DELETE /api/users/:uid` - Eliminar un usuario

### 🔐 Sessions Endpoints (`test/sessions.test.js`)
- `POST /api/sessions/register` - Registrar nuevo usuario
- `POST /api/sessions/login` - Login de usuario
- `GET /api/sessions/current` - Obtener usuario actual
- `GET /api/sessions/unprotectedLogin` - Login sin protección
- `GET /api/sessions/unprotectedCurrent` - Obtener usuario actual sin protección

### 📝 Adoptions Endpoints (`test/adoptions.test.js`)
- `GET /api/adoptions` - Obtener todas las adopciones
- `GET /api/adoptions/:aid` - Obtener una adopción específica
- `POST /api/adoptions/:uid/:pid` - Crear una nueva adopción

## Docker

### Construcción de la imagen

```bash
docker build -t adoptme-api:latest .
```

### Ejecutar la aplicación con Docker

#### Con MongoDB local:

```bash
docker run -p 8080:8080 \
  -e MONGO_URL=mongodb://host.docker.internal:27017/adoptme \
  adoptme-api:latest
```

## Endpoints Principales

### Base URL
```
http://localhost:8080/api
```

### Mascotas
```
GET    /pets              - Obtener todas las mascotas
POST   /pets              - Crear una mascota
POST   /pets/withimage    - Crear mascota con imagen
PUT    /pets/:pid         - Actualizar mascota
DELETE /pets/:pid         - Eliminar mascota
```

### Usuarios
```
GET    /users        - Obtener todos los usuarios
GET    /users/:uid   - Obtener usuario específico
PUT    /users/:uid   - Actualizar usuario
DELETE /users/:uid   - Eliminar usuario
```

### Sesiones
```
POST /sessions/register           - Registrar usuario
POST /sessions/login              - Login
GET  /sessions/current            - Usuario actual (protegido)
GET  /sessions/unprotectedLogin   - Login sin protección
GET  /sessions/unprotectedCurrent - Usuario actual (sin protección)
```

### Adopciones
```
GET  /adoptions      - Obtener todas las adopciones
GET  /adoptions/:aid - Obtener adopción específica
POST /adoptions/:uid/:pid - Crear adopción
```