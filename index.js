const express = require('express')
const userRouter = require('./routes/user.routes')

const app = express()

app.use(express.json())
app.use('/api', userRouter)

const client = require('../A/database_get')

app.get('/', (req, res) => {
    res.send(client)
})

const PORT = 3000

app.listen(PORT, () => {
    console.log(`Server started: http://localhost:${PORT}`)
})