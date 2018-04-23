const bcrypt = require('bcrypt');
const fs = require('fs');

const saltRounds = 10;

const filename = 'auth.json'; // holds all user data

var users; // users loaded from file
var currentName = ''; // current user's username

// loads users from file
var load = () => {
    var readUser = fs.readFileSync(filename);
    users = JSON.parse(readUser);
}

// checks if a username is already taken
var checkAvailable = (registerName) => {
    load();
    var available = true;
    for (var i = 0; i < users.length; i++) {
        if (registerName === users[i].username)
            available = false;
    }
    return available;
}

// checks if two passwords are the same
var checkSamePass = (registerPw, confirmPw) => {
    return registerPw === confirmPw;
}

// hashes the password and stores both username and password into file
var store = (registerName, registerPw) => {
    load();
    var hash = bcrypt.hashSync(registerPw, saltRounds);
    var user = {
        username: registerName,
        password: hash,
        favorites: []
    };
    users.push(user);
    fs.writeFileSync(filename, JSON.stringify(users));
}

// compares passwords with the hashed version stored to determine if login is authentic
var check = (loginName, loginPw) => {
    load();
    var isCorrect = false
    for (var i = 0; i < users.length; i++) {
        user = users[i];
        if (loginName === user.username) {
            if (bcrypt.compareSync(loginPw, user.password)) {
                currentName = loginName;
                isCorrect = true;
            }
        }
    }
    return isCorrect;
}

// returns the current user's favorites
var getFavorites = () => {
    for (var i = 0; i < users.length; i++) {
        if (currentName === users[i].username)
            return users[i].favorites;
    }
}

// sets the current user's favorites
var setFavorites = (favorites) => {
    for (var i = 0; i < users.length; i++) {
        if (currentName === users[i].username)
            users[i].favorites = favorites;
    }
    fs.writeFileSync(filename, JSON.stringify(users));
}

// determines if a user is logged in or not
var isLogged = () => {
    if (currentName === '')
        return false;
    else
        return true;
}

// removes current user name for logout
var logoff = () => {
    currentName = '';
}

// changes user information
var changeInfo = (changes) => {
    var user;
    for (var i = 0; i < users.length; i++) {
        if (currentName === users[i].username) {
            user = users[i];
        }
    }
    if (changes.newUsername != '') {
        user.username = changes.newUsername;
        currentName = changes.newUsername;
    }
    if (changes.newPw === changes.confirmNewPw) {
        user.password = bcrypt.hashSync(changes.newPw, saltRounds);
    }
    fs.writeFileSync(filename, JSON.stringify(users));
}

// returns current user's username
var getCurrentName = () => {
    return currentName;
}

module.exports = {
    load,
    checkAvailable,
    checkSamePass,
    store,
    check,
    getFavorites,
    setFavorites,
    logoff,
    isLogged,
    getCurrentName,
    changeInfo
};