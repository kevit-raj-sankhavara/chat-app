const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const Filter = require("bad-words");
const { generateMessage, generateLocationMessage } = require('./utils/messages');
const { addUser, removeUser, getUser, getUsersInRoom } = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const PORT = process.env.PORT || 3000;

const pathToPublic = path.join(__dirname, "../public");
app.use(express.static(pathToPublic));


io.on("connection", (socket) => {
    console.log("Connected to server");

    socket.on("join", ({ username, room }, callback) => {
        const { error, user } = addUser({ id: socket.id, username, room });
        if (error)
            return callback(error);

        socket.join(user.room);

        let text = `Welcome ${user.username}`;
        socket.emit("message", generateMessage("Chat Room", text));

        text = `${user.username} has joined`;
        socket.broadcast.to(user.room).emit("message", generateMessage("Chat Room", text));

        io.to(user.room).emit("roomData", {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        callback();
    })

    socket.on("sendMsg", (msg, callback) => {
        const filter = new Filter();
        if (filter.isProfane(msg))
            return callback("Profane word is not allowed");

        const user = getUser(socket.id);

        io.to(user.room).emit("message", generateMessage(user.username, msg));
        callback();
    })

    socket.on("sendLocation", (data, callback) => {
        const user = getUser(socket.id);
        const url = `https://google.com/maps?q=${data.latitude},${data.longitude}`;

        io.emit("locationMessage", generateLocationMessage(user.username, url));
        callback();
    })

    socket.on("disconnect", () => {
        const user = removeUser(socket.id);

        if (user) {
            io.to(user.room).emit("message", generateMessage("", `${user.username} has left the room !`));

            io.to(user.room).emit("roomData", {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })
})

server.listen(PORT, () => {
    console.log(`App is running on port ${PORT}`);
})