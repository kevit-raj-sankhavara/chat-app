const socket = io();

const messageTemplate = document.getElementById("message-template").innerHTML;
const locationTemplate = document.getElementById("location-template").innerHTML;

const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

socket.on("message", (msg) => {
    console.log(msg);

    const html = Mustache.render(messageTemplate, {
        message: msg.text,
        time: moment(msg.createdAt).format("h:mm A")
    });
    messages.insertAdjacentHTML("beforeend", html);
})

socket.on("locationMessage", (msg) => {
    console.log(msg);

    const html = Mustache.render(locationTemplate, {
        url: msg.url,
        time: moment(msg.createdAt).format("h:mm A")
    });
    messages.insertAdjacentHTML("beforeend", html);
})

sendBtn.addEventListener("click", (e) => {
    e.preventDefault();
    sendBtn.disabled = true;

    socket.emit("sendMsg", msg.value, (profane) => {
        sendBtn.disabled = false;
        msg.value = "";
        msg.focus();

        if (profane)
            return console.log("ACK :", profane)
        console.log("ACK : Message delivered");
    });
})

locBtn.addEventListener("click", () => {
    locBtn.disabled = true;

    navigator.geolocation.getCurrentPosition(position => {
        const { latitude, longitude } = position.coords;
        socket.emit("sendLocation", { latitude, longitude }, () => {
            console.log("ACK : Location send");
            locBtn.disabled = false;
        })
    })
})

socket.emit("join", { username, room });
