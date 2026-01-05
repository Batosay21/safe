import express from 'express';
import { PrismaClient } from '@prisma/client/extension';

const app = express()
app.use(express.json());

const users = []

app.post('/usuarios',async (req, res) => {

   await prisma.user.create({
        data:{
            nome: req.body.nome,
            email: req.body.email,
            age: req.body.age
        }
    })
        

    res.status(201).json(req.body)
})

app.get('/usuarios', (req, res) => {
    res.status(200).json(users)
})

app.listen(3000)


