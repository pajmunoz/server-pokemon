const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const axios = require('axios');

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'tu-secreto-jwt-super-seguro';

// Middleware
app.use(cors());
app.use(express.json());

// Base de datos simulada para usuarios
const users = [
    {
        id: 1,
        username: 'admin',
        email: 'admin@pokemon.com',
        password: '$2a$10$ADY53QQLbPwi29aSL3XEv.yMHO1gU/Yn.UJwFxkhugXnS2PYnyoOO', // password: admin
        createdAt: new Date()
    }
];

// Middleware para verificar JWT
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Token de acceso requerido' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Token inválido o expirado' });
        }
        req.user = user;
        next();
    });
};

// Ruta de salud del servidor
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Servidor de Pokémon funcionando correctamente en Vercel',
        timestamp: new Date().toISOString()
    });
});

// Rutas de autenticación
app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: 'Usuario y contraseña son requeridos' });
        }

        const user = users.find(u => u.username === username);
        if (!user) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        const token = jwt.sign(
            { id: user.id, username: user.username, email: user.email },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Login exitoso',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// Ruta protegida de ejemplo
app.get('/api/auth/profile', authenticateToken, (req, res) => {
    res.json({
        message: 'Perfil accedido exitosamente',
        user: req.user
    });
});

// Ruta básica de Pokémon
app.get('/api/pokemon', authenticateToken, async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 5;
        const offset = parseInt(req.query.offset) || 0;

        const response = await axios.get(`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`);
        
        const pokemonList = await Promise.all(
            response.data.results.slice(0, limit).map(async (pokemon, index) => {
                const pokemonId = offset + index + 1;
                const pokemonResponse = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);
                
                return {
                    id: pokemonId,
                    name: pokemonResponse.data.name,
                    image: pokemonResponse.data.sprites.front_default,
                    types: pokemonResponse.data.types.map(type => type.type.name)
                };
            })
        );

        res.json({
            count: pokemonList.length,
            results: pokemonList
        });
    } catch (error) {
        console.error('Error obteniendo lista de Pokémon:', error);
        res.status(500).json({ message: 'Error obteniendo lista de Pokémon' });
    }
});

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
    res.status(404).json({ message: 'Ruta no encontrada' });
});

// Manejo de errores global
app.use((error, req, res, next) => {
    console.error('Error del servidor:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
});

// Exportar para Vercel
module.exports = app;
