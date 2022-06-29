const users = [];

const addUser = ({ id, username, room }) => {
    // Cleaning username & room
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    // Checking for dupclicate user in same room
    const isMatch = users.find((user) => {
        return user.room === room && user.username === username;
    })

    if (isMatch)
        return { error: "Username Taken !!" }

    // If No Match found then we add that user
    users.push({ id, username, room });
}

const removeUser = (id) => {
    const index = users.findIndex(user => user.id === id);
    users.splice(index, 1);
}

const getUser = (id) => {
    return users.find(user => user.id === id);
}

const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase();
    return users.filter(user => user.room === room);
}

module.exports = { addUser, removeUser, getUser, getUsersInRoom };