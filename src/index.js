const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const Filter = require("bad-words");
const { generateMessage, generateLocationMessage } = require('./utils/messages');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const PORT = process.env.PORT || 3000;

const pathToPublic = path.join(__dirname, "../public");
app.use(express.static(pathToPublic));


io.on("connection", (socket) => {
    console.log("Connected to server");

    socket.on("join", ({ username, room }) => {
        // To join that particular room
        socket.join(room);

        // io.to(room-name).emit, socket.broadcat.to(room-name).emit => For that particuler room

        socket.emit("message", generateMessage(`Welcome ${username}`))
        socket.broadcast.to(room).emit("message", generateMessage(`${username} has joined`));
    })

    socket.on("sendMsg", (msg, callback) => {
        const filter = new Filter();
        if (filter.isProfane(msg))
            return callback("Profane word is not allowed");

        io.emit("message", generateMessage(msg));
        callback();
    })

    socket.on("sendLocation", (data, callback) => {
        io.emit("locationMessage", generateLocationMessage(`https://google.com/maps?q=${data.latitude},${data.longitude}`));
        callback();
    })

    socket.on("disconnect", () => {
        io.emit("message", generateMessage("A user has left"));
    })
})

server.listen(PORT, () => {
    console.log(`App is running on port ${PORT}`);
})