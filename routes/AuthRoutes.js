const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const app = express.Router();

app.post('/signup', async (req, res) => {
    try {
        const { username, firstname, lastname, password } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            username,
            firstname,
            lastname,
            password: hashedPassword
        });

        await newUser.save();

        res.status(201).send({ message: 'User Created Successfully' });

    } catch (error) {
        res.status(400).send({ message: 'Username already exists' });
    }
});

app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username });

        if (!user) {
            return res.status(404).send({ message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).send({ message: 'Invalid password' });
        }

        res.status(200).send({
            message: 'Login Success',
            username: user.username
        });

    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

module.exports = app;
