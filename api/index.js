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
app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Validaciones básicas
        if (!username || !email || !password) {
            return res.status(400).json({ message: 'Todos los campos son requeridos' });
        }

        // Verificar si el usuario ya existe
        const existingUser = users.find(u => u.username === username || u.email === email);
        if (existingUser) {
            return res.status(400).json({ message: 'El usuario o email ya existe' });
        }

        // Encriptar contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Crear nuevo usuario
        const newUser = {
            id: users.length + 1,
            username,
            email,
            password: hashedPassword,
            createdAt: new Date()
        };

        users.push(newUser);

        // Generar JWT
        const token = jwt.sign(
            { id: newUser.id, username: newUser.username, email: newUser.email },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: 'Usuario registrado exitosamente',
            token,
            user: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email
            }
        });
    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

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
        const limit = parseInt(req.query.limit) || 20;
        const offset = parseInt(req.query.offset) || 0;

        // Obtener lista de Pokémon desde la API pública
        const response = await axios.get(`https://pokeapi.co/api/v2/pokemon?limit=1000&offset=0`);
        
        const pokemonList = await Promise.all(
            response.data.results.slice(offset, offset + limit).map(async (pokemon, index) => {
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
            total: response.data.count,
            next: offset + limit < response.data.count ? `/api/pokemon?limit=${limit}&offset=${offset + limit}` : null,
            previous: offset > 0 ? `/api/pokemon?limit=${limit}&offset=${Math.max(0, offset - limit)}` : null,
            results: pokemonList
        });
    } catch (error) {
        console.error('Error obteniendo lista de Pokémon:', error);
        res.status(500).json({ message: 'Error obteniendo lista de Pokémon' });
    }
});

// Obtener datos de Pokémon específico por ID
app.get('/api/pokemon/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        
        // Obtener datos del Pokémon
        const pokemonResponse = await axios.get(`https://pokeapi.co/api/v2/pokemon/${id}`);
        const pokemon = pokemonResponse.data;

        // Obtener especies para información adicional
        const speciesResponse = await axios.get(pokemon.species.url);
        const species = speciesResponse.data;

        const pokemonData = {
            id: pokemon.id,
            name: pokemon.name,
            image: pokemon.sprites.front_default,
            images: {
                front_default: pokemon.sprites.front_default,
                front_shiny: pokemon.sprites.front_shiny,
                back_default: pokemon.sprites.back_default,
                back_shiny: pokemon.sprites.back_shiny
            },
            types: pokemon.types.map(type => type.type.name),
            abilities: pokemon.abilities.map(ability => ({
                name: ability.ability.name,
                is_hidden: ability.is_hidden,
                slot: ability.slot
            })),
            stats: pokemon.stats.map(stat => ({
                name: stat.stat.name,
                base_stat: stat.base_stat,
                effort: stat.effort
            })),
            height: pokemon.height,
            weight: pokemon.weight,
            base_experience: pokemon.base_experience,
            species: {
                name: species.name,
                color: species.color.name,
                habitat: species.habitat?.name || 'unknown',
                generation: species.generation.name,
                description: species.flavor_text_entries
                    .find(entry => entry.language.name === 'es')?.flavor_text ||
                    species.flavor_text_entries
                        .find(entry => entry.language.name === 'en')?.flavor_text ||
                    'No description available'
            }
        };

        res.json(pokemonData);
    } catch (error) {
        console.error('Error obteniendo Pokémon:', error);
        if (error.response && error.response.status === 404) {
            return res.status(404).json({ message: 'Pokémon no encontrado' });
        }
        res.status(500).json({ message: 'Error obteniendo datos del Pokémon' });
    }
});

// Búsqueda de Pokémon por nombre
app.get('/api/pokemon/search/:name', authenticateToken, async (req, res) => {
    try {
        const { name } = req.params;
        
        if (!name || name.trim() === '') {
            return res.status(400).json({ 
                message: 'El nombre del Pokémon es requerido',
                error: 'NAME_REQUIRED'
            });
        }

        const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${name.toLowerCase().trim()}`);
        const pokemon = response.data;

        const pokemonData = {
            id: pokemon.id,
            name: pokemon.name,
            image: pokemon.sprites.front_default,
            types: pokemon.types.map(type => type.type.name),
            abilities: pokemon.abilities.map(ability => ability.ability.name)
        };

        res.json(pokemonData);
    } catch (error) {
        console.error('Error buscando Pokémon:', error);
        if (error.response && error.response.status === 404) {
            return res.status(404).json({ 
                message: 'Pokémon no encontrado',
                error: 'POKEMON_NOT_FOUND',
                searchTerm: req.params.name
            });
        }
        res.status(500).json({ message: 'Error en la búsqueda' });
    }
});

// Búsqueda avanzada con filtros
app.get('/api/pokemon/search', authenticateToken, async (req, res) => {
    try {
        const { 
            name, 
            type, 
            limit = 20, 
            offset = 0,
            minHeight,
            maxHeight,
            minWeight,
            maxWeight
        } = req.query;

        // Si solo se proporciona nombre, redirigir al endpoint específico
        if (name && !type && !minHeight && !maxHeight && !minWeight && !maxWeight) {
            return res.redirect(`/api/pokemon/search/${name}`);
        }

        // Obtener lista de Pokémon para filtrar
        const response = await axios.get(`https://pokeapi.co/api/v2/pokemon?limit=1000&offset=0`);
        
        let filteredPokemon = response.data.results;

        // Aplicar filtros
        if (name) {
            filteredPokemon = filteredPokemon.filter(pokemon => 
                pokemon.name.toLowerCase().includes(name.toLowerCase())
            );
        }

        // Obtener datos detallados de los Pokémon filtrados
        const pokemonWithDetails = await Promise.all(
            filteredPokemon.slice(offset, offset + parseInt(limit)).map(async (pokemon) => {
                try {
                    const pokemonResponse = await axios.get(pokemon.url);
                    const pokemonData = pokemonResponse.data;

                    // Aplicar filtros adicionales
                    if (type && !pokemonData.types.some(t => t.type.name === type)) {
                        return null;
                    }

                    if (minHeight && pokemonData.height < parseInt(minHeight)) {
                        return null;
                    }

                    if (maxHeight && pokemonData.height > parseInt(maxHeight)) {
                        return null;
                    }

                    if (minWeight && pokemonData.weight < parseInt(minWeight)) {
                        return null;
                    }

                    if (maxWeight && pokemonData.weight > parseInt(maxWeight)) {
                        return null;
                    }

                    return {
                        id: pokemonData.id,
                        name: pokemonData.name,
                        image: pokemonData.sprites.front_default,
                        types: pokemonData.types.map(type => type.type.name),
                        height: pokemonData.height,
                        weight: pokemonData.weight,
                        base_experience: pokemonData.base_experience
                    };
                } catch (error) {
                    console.error(`Error obteniendo datos de ${pokemon.name}:`, error);
                    return null;
                }
            })
        );

        // Filtrar resultados nulos
        const validResults = pokemonWithDetails.filter(pokemon => pokemon !== null);

        res.json({
            count: validResults.length,
            total: filteredPokemon.length,
            limit: parseInt(limit),
            offset: parseInt(offset),
            filters: {
                name: name || null,
                type: type || null,
                minHeight: minHeight || null,
                maxHeight: maxHeight || null,
                minWeight: minWeight || null,
                maxWeight: maxWeight || null
            },
            results: validResults
        });

    } catch (error) {
        console.error('Error en búsqueda avanzada:', error);
        res.status(500).json({ 
            message: 'Error en la búsqueda avanzada',
            error: 'ADVANCED_SEARCH_ERROR'
        });
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
