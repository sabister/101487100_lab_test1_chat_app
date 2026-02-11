const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketio = require('socket.io');

const authRouter = require('./routes/AuthRoutes');
const GroupMessage = require('./models/GroupMessage');
const PrivateMessage = require('./models/PrivateMessage');

const SERVER_PORT = process.env.PORT || 3000;

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.json());
app.use(cors());
app.use(express.static('public'));

const DB_CONNECTION = "mongodb+srv://blackmagejr1_db_user:kHJ8PJVQ4UaOHyHd@cluster0.nj4hbzc.mongodb.net/101487100_lab_test1_chat_app?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(DB_CONNECTION)
.then(() => console.log('Success Mongodb connection'))
.catch(err => console.log('Error Mongodb connection'));

app.use(authRouter);


io.on('connection', (socket) => {

    socket.on('registerUser', (username) => {
    socket.username = username;
    socket.join(username);  
    });

    socket.on('joinRoom', (room) => {
        socket.join(room);
        socket.currentRoom = room;
    });

    socket.on('leaveRoom', () => {
        socket.leave(socket.currentRoom);
    });

    socket.on('chatMessage', async (data) => {
        try {
            const newMessage = new GroupMessage(data);
            await newMessage.save();

            io.to(data.room).emit('message', data);
        } catch (error) {
            console.log(error.message);
        }
    });

    socket.on('privateMessage', async (data) => {
        try {
            const newMessage = new PrivateMessage(data);
            await newMessage.save();

            io.to(data.to_user).emit('privateMessage', data);
        } catch (error) {
            console.log(error.message);
        }
    });

    socket.on('typing', (data) => {
        socket.to(data.room).emit('typing', data.username);
    });

});

server.listen(SERVER_PORT, () => {
    console.log('Server is running...');
});
