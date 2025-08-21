# 🚀 Servidor de Pokémon con Autenticación JWT

Un servidor completo para una aplicación de Pokémon que incluye autenticación JWT y endpoints para obtener información detallada de Pokémon.

## ✨ Características

- 🔐 **Autenticación JWT** - Registro y login de usuarios
- 🎯 **Endpoints protegidos** - Todas las rutas de Pokémon requieren autenticación
- 📱 **Lista de Pokémon** - Con nombre, imagen y tipos
- 🎮 **Datos individuales** - Información completa de cada Pokémon
- 🔍 **Búsqueda por nombre** - Encuentra Pokémon específicos
- 🌐 **API de Pokémon** - Integración con PokeAPI pública
- 🛡️ **Seguridad** - Contraseñas encriptadas con bcrypt

## 🚀 Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <tu-repositorio>
   cd server-pokemon
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   Crear un archivo `.env` en la raíz del proyecto:
   ```env
   PORT=3000
   JWT_SECRET=tu-secreto-jwt-super-seguro-cambiar-en-produccion
   ```

4. **Iniciar el servidor**
   ```bash
   # Desarrollo (con nodemon)
   npm run dev
   
   # Producción
   npm start
   ```

## 📱 Endpoints Disponibles

### 🔐 Autenticación

#### POST `/api/auth/register`
Registra un nuevo usuario.

**Body:**
```json
{
  "username": "usuario",
  "email": "usuario@email.com",
  "password": "contraseña123"
}
```

**Respuesta:**
```json
{
  "message": "Usuario registrado exitosamente",
  "token": "jwt-token-aqui",
  "user": {
    "id": 2,
    "username": "usuario",
    "email": "usuario@email.com"
  }
}
```

#### POST `/api/auth/login`
Inicia sesión de un usuario existente.

**Body:**
```json
{
  "username": "usuario",
  "password": "contraseña123"
}
```

**Respuesta:**
```json
{
  "message": "Login exitoso",
  "token": "jwt-token-aqui",
  "user": {
    "id": 2,
    "username": "usuario",
    "email": "usuario@email.com"
  }
}
```

#### GET `/api/auth/profile`
Obtiene el perfil del usuario autenticado.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

### 🎮 Pokémon

#### GET `/api/pokemon`
Obtiene una lista paginada de Pokémon.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Query Parameters:**
- `limit` (opcional): Número de Pokémon por página (default: 20)
- `offset` (opcional): Número de Pokémon a saltar (default: 0)

**Respuesta:**
```json
{
  "count": 1281,
  "next": "https://pokeapi.co/api/v2/pokemon?offset=20&limit=20",
  "previous": null,
  "results": [
    {
      "id": 1,
      "name": "bulbasaur",
      "image": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png",
      "types": ["grass", "poison"]
    }
  ]
}
```

#### GET `/api/pokemon/:id`
Obtiene información detallada de un Pokémon específico.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Respuesta:**
```json
{
  "id": 1,
  "name": "bulbasaur",
  "image": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png",
  "images": {
    "front_default": "...",
    "front_shiny": "...",
    "back_default": "...",
    "back_shiny": "..."
  },
  "types": ["grass", "poison"],
  "abilities": [
    {
      "name": "overgrow",
      "is_hidden": false,
      "slot": 1
    }
  ],
  "stats": [
    {
      "name": "hp",
      "base_stat": 45,
      "effort": 0
    }
  ],
  "height": 7,
  "weight": 69,
  "base_experience": 64,
  "forms": [...],
  "moves": [...],
  "species": {
    "name": "bulbasaur",
    "color": "green",
    "habitat": "grassland",
    "generation": "generation-i",
    "description": "A strange seed was planted on its back at birth..."
  }
}
```

#### GET `/api/pokemon/search/:name`
Busca un Pokémon por nombre.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Query Parameters:**
- `detailed` (opcional): Si es `true`, devuelve información completa del Pokémon

**Ejemplos:**
```bash
# Búsqueda básica
GET /api/pokemon/search/pikachu

# Búsqueda con detalles completos
GET /api/pokemon/search/charizard?detailed=true
```

**Respuesta básica:**
```json
{
  "id": 25,
  "name": "pikachu",
  "image": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png",
  "types": ["electric"],
  "abilities": ["static", "lightning-rod"],
  "stats": [
    {
      "name": "hp",
      "base_stat": 35
    }
  ]
}
```

**Respuesta detallada (con `detailed=true`):**
```json
{
  "id": 6,
  "name": "charizard",
  "image": "...",
  "images": {
    "front_default": "...",
    "front_shiny": "...",
    "back_default": "...",
    "back_shiny": "..."
  },
  "types": ["fire", "flying"],
  "abilities": [...],
  "stats": [...],
  "height": 17,
  "weight": 905,
  "base_experience": 240,
  "forms": [...],
  "moves": [...],
  "species": {
    "name": "charizard",
    "color": "red",
    "habitat": "mountain",
    "generation": "generation-i",
    "description": "It spits fire that is hot enough to melt boulders..."
  }
}
```

#### GET `/api/pokemon/search`
Búsqueda avanzada con múltiples filtros.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Query Parameters:**
- `name` (opcional): Buscar Pokémon cuyo nombre contenga este texto
- `type` (opcional): Filtrar por tipo específico (fire, water, grass, etc.)
- `limit` (opcional): Número máximo de resultados (default: 20)
- `offset` (opcional): Número de resultados a saltar (default: 0)
- `minHeight` (opcional): Altura mínima del Pokémon
- `maxHeight` (opcional): Altura máxima del Pokémon
- `minWeight` (opcional): Peso mínimo del Pokémon
- `maxWeight` (opcional): Peso máximo del Pokémon

**Ejemplos:**
```bash
# Buscar Pokémon tipo fuego
GET /api/pokemon/search?type=fire&limit=10

# Buscar Pokémon con nombre que contenga "char"
GET /api/pokemon/search?name=char&limit=5

# Buscar Pokémon tipo agua con altura mínima de 10
GET /api/pokemon/search?type=water&minHeight=10&limit=5

# Buscar Pokémon con peso entre 50 y 100
GET /api/pokemon/search?minWeight=50&maxWeight=100&limit=10

# Combinar múltiples filtros
GET /api/pokemon/search?name=char&type=fire&minHeight=10&limit=5
```

**Respuesta:**
```json
{
  "count": 5,
  "total": 15,
  "limit": 5,
  "offset": 0,
  "filters": {
    "name": "char",
    "type": "fire",
    "minHeight": "10",
    "maxHeight": null,
    "minWeight": null,
    "maxWeight": null
  },
  "results": [
    {
      "id": 4,
      "name": "charmander",
      "image": "...",
      "types": ["fire"],
      "height": 6,
      "weight": 85,
      "base_experience": 62
    }
  ]
}
```

### 🏥 Salud del Servidor

#### GET `/api/health`
Verifica el estado del servidor.

## 🔑 Usuario de Prueba

El servidor incluye un usuario de prueba preconfigurado:

- **Username:** `admin`
- **Password:** `password`

## 🛡️ Seguridad

- **JWT Tokens** expiran en 24 horas
- **Contraseñas** encriptadas con bcrypt (salt rounds: 10)
- **Middleware de autenticación** protege todas las rutas de Pokémon
- **Validación de entrada** en todos los endpoints

## 🚨 Manejo de Errores

El servidor incluye manejo de errores robusto con códigos de error específicos:

### **Códigos de Estado HTTP:**
- **400** - Datos de entrada inválidos
- **401** - Token de autenticación requerido
- **403** - Token inválido o expirado
- **404** - Recurso no encontrado
- **500** - Error interno del servidor

### **Códigos de Error Específicos:**
- **`NAME_REQUIRED`** - Nombre de Pokémon requerido para búsqueda
- **`POKEMON_NOT_FOUND`** - Pokémon no encontrado en la búsqueda
- **`SEARCH_ERROR`** - Error general en la búsqueda
- **`ADVANCED_SEARCH_ERROR`** - Error en búsqueda avanzada

### **Ejemplos de Respuestas de Error:**

**Pokémon no encontrado:**
```json
{
  "message": "Pokémon no encontrado",
  "error": "POKEMON_NOT_FOUND",
  "searchTerm": "pikachuu",
  "suggestions": [
    "Verifica que el nombre esté escrito correctamente",
    "Los nombres son sensibles a mayúsculas/minúsculas",
    "Intenta usar el nombre en inglés"
  ]
}
```

**Nombre requerido:**
```json
{
  "message": "El nombre del Pokémon es requerido",
  "error": "NAME_REQUIRED"
}
```

## 🧪 Testing

Para probar los endpoints, puedes usar herramientas como:

- **Postman**
- **Insomnia**
- **cURL**
- **Thunder Client (VS Code)**

### Ejemplo con cURL

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}'

# Obtener lista de Pokémon (con token)
curl -X GET http://localhost:3000/api/pokemon \
  -H "Authorization: Bearer <tu-token-jwt>"
```

## 📦 Dependencias

- **express** - Framework web
- **jsonwebtoken** - Autenticación JWT
- **bcryptjs** - Encriptación de contraseñas
- **cors** - Middleware CORS
- **axios** - Cliente HTTP para PokeAPI
- **dotenv** - Variables de entorno

## 🔧 Desarrollo

```bash
# Instalar dependencias de desarrollo
npm install

# Ejecutar en modo desarrollo
npm run dev

# Construir para producción
npm start
```

## 📝 Notas

- El servidor usa una base de datos simulada en memoria para usuarios
- Los datos de Pokémon se obtienen de la API pública de PokeAPI
- En producción, considera usar una base de datos real para usuarios
- Cambia el JWT_SECRET por uno seguro y único

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.
