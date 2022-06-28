const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const PORT = process.env.PORT || 3000;

const pathToPublic = path.join(__dirname, "../public");
app.use(express.static(pathToPublic));

let count = 0;
// Runs when client is connected with the server
io.on("connection", (socket) => {
    console.log("Connected to server");
    // Creating a request
    socket.emit("getCount", count);

    socket.on("incrementCount", () => {
        count++;
        // will do for only that connection
        // socket.emit("getCount", count);

        // It will do for all connections
        io.emit("getCount", count);
    })
})

server.listen(PORT, () => {
    console.log(`App is running on port ${PORT}`);
})