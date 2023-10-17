
const express = require('express');
const movies = require('./movies.json')
const crypto = require('node:crypto')
const cors = require('cors')
const process = require('node:process')
const { validateMovie, validatePartialMovie } = require('./schemas/movies')

const app = express()
app.use(cors())
app.disable('x-powered-by')

app.use(express.json())

app.get('/', (req, res) => {
    const { genre } = req.query

    if (genre) {
        const moviesFilteres = movies.filter(movie => movie.genre.some(g => g.toLowerCase() === genre.toLowerCase()))
        res.json(moviesFilteres)
    } else {
        res.json(movies)
    }
})

app.post('/movies', (req, res) => {

    const result = validateMovie(req.body)

    if (result.error) {
        res.status(400).json({ error: JSON.parse(result.error.message)})
    }

    const newMovie = {
        id: crypto.randomUUID(),
        ...result.data
    }

    movies.push(newMovie)
    res.status(201).json({ message: 'New movie created' })
})

app.get('/movies', (req, res) => {

    const { genre } = req.query

    if (genre) {
        const moviesFilteres = movies.filter(movie => movie.genre.some(g => g.toLowerCase() === genre.toLowerCase()))
        res.json(moviesFilteres)
    } else {
        res.json(movies)
    }
})

app.get('/movies/:id', (req, res) => {
    const { id } = req.params
    const movie = movies.find(movie => movie.id === id)
    if (movie) return res.json(movie)
    else res.status(404).json({ message: 'Movie not found' })
})

app.patch('/movies/:id', (req, res) => {
    
    const result = validatePartialMovie(req.body)
    
    if (!result.success) {
        return res.status(404).json({ error: JSON.parse(result.error.message)})
    }
    
    const { id } = req.params
    const movieIndex = movies.findIndex(movie => movie.id === id)

    if (movieIndex === -1) {
        return res.status(404).json({ message: 'Movie not found' })
    }

    const updatedMovie = {
        ...movies[movieIndex],
        ...result.data
    }
    movies[movieIndex] = updatedMovie
    return res.json(updatedMovie)
})

const PORT = process.env.PORT ?? 1234

app.listen(PORT, () => {
    console.log('Server listening on port: http://localhost:1234');
})
