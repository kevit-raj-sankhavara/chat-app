const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const Filter = require("bad-words");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const PORT = process.env.PORT || 3000;

const pathToPublic = path.join(__dirname, "../public");
app.use(express.static(pathToPublic));


io.on("connection", (socket) => {
    console.log("Connected to server");
    socket.emit("message", "Welcome")

    socket.broadcast.emit("message", "new user joined");

    socket.on("sendMsg", (msg, callback) => {
        const filter = new Filter();
        if (filter.isProfane(msg))
            return callback("Profane word is not allowed");

        io.emit("message", msg);
        callback();
    })

    socket.on("sendLocation", (data, callback) => {
        io.emit("locationMessage", `https://google.com/maps?q=${data.latitude},${data.longitude}`);
        callback();
    })

    socket.on("disconnect", () => {
        io.emit("message", "A user has left");
    })
})

server.listen(PORT, () => {
    console.log(`App is running on port ${PORT}`);
})