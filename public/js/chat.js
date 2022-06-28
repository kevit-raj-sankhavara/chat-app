// connects client with server
const socket = io();

// Requesting the getCount
// Can access the data sent from the server
socket.on("getCount", (count) => {
    console.log("Count : ", count);
})

increment.addEventListener("click", () => {
    socket.emit("incrementCount");
})