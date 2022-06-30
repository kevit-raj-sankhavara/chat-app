const socket = io();

const messageTemplate = document.getElementById("message-template").innerHTML;
const locationTemplate = document.getElementById("location-template").innerHTML;
const sidebarTemplate = document.getElementById("sidebar-template").innerHTML;

const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoscroll = () => {
    // New message element
    const $newMessage = messages.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = messages.offsetHeight

    // Height of messages container
    const containerHeight = messages.scrollHeight

    // How far have I scrolled?
    const scrollOffset = messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        messages.scrollTop = messages.scrollHeight
    }
}

socket.on("message", (msg) => {
    console.log(msg);

    const html = Mustache.render(messageTemplate, {
        username: msg.username,
        message: msg.text,
        time: moment(msg.createdAt).format("h:mm A")
    });
    messages.insertAdjacentHTML("beforeend", html);
    autoscroll();
})

socket.on("locationMessage", (msg) => {
    console.log(msg);

    const html = Mustache.render(locationTemplate, {
        username: msg.username,
        url: msg.url,
        time: moment(msg.createdAt).format("h:mm A")
    });
    messages.insertAdjacentHTML("beforeend", html);
    autoscroll();
})

socket.on("roomData", ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    });
    sidebar.innerHTML = html;
})

msgForm.addEventListener("submit", (e) => {
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

socket.emit("join", { username, room }, (error) => {
    if (error) {
        alert(error);
        location.href = "/";
    }
});
