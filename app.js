const request = require('request');
const express = require('express');
const hbs = require('hbs');

const tastedive = require('./tastedive');
const themoviedb = require('./themoviedb')
const auth = require('./auth')

var app = express();

hbs.registerPartials(__dirname + '/views/partials');

app.set('view engine', 'hbs');
app.use(express.static(__dirname + '/public'));
app.use(express.json());
app.use(express.urlencoded());

var currentSearch; // tracks current search results, used to add favorites
var userFavorites = []; // tracks current user favorites

// checks if user is logged in; prevents access to pages without login
var checkLogin = (response) => {
    if (!auth.isLogged()) {
        response.render('log.hbs', {
            signupMsg: '',
            loginMsg: ''
        });
        return false;
    } else
        return true;
}

// landing page, login screen
app.get('/', (request, response) => {
    response.render('log.hbs', {
        signupMsg: '',
        loginMsg: ''
    });
});

// when user submits a registration
app.post('/signup', (request, response) => {
    var msg = ''
    if (request.body.registerName.length <= 0 || request.body.registerPw.length <= 0)
        msg = '<h2>Username or password missing</h2>'
    else if (!auth.checkAvailable(request.body.registerName))
        msg = '<h2>Username unavailable</h2>';
    else if (!auth.checkSamePass(request.body.registerPw, request.body.confirmPw))
        msg = '<h2>Passwords do not match</h2>'
    else {
        msg = '<h2>Registered Successfully!</h2>'
        auth.store(request.body.registerName, request.body.registerPw);
    }
    response.render('log.hbs', {
        signupMsg: msg,
        loginMsg: ''
    });
});

// when user submits a login
app.post('/login', (request, response) => {
    if (auth.checkAvailable(request.body.loginName)) {
        response.render('log.hbs', {
            signupMsg: '',
            loginMsg: '<h2>Username does not exist</h2>'
        });
    } else if (!auth.check(request.body.loginName, request.body.loginPw)) {
        response.render('log.hbs', {
            signupMsg: '',
            loginMsg: '<h2>Incorrect password</h2>'
        });
    } else {
        userFavorites = auth.getFavorites();
        response.redirect('/home');
    }
});

// intro screen, explains website
app.get('/home', (request, response) => {
    if (checkLogin(response))
        response.render('home.hbs');
});

// search screen to query TheMovieDB
app.get('/search', (request, response) => {
    if (checkLogin(response)) {
        response.render('search.hbs', {
            parsed: ''
        });
    }
});

// when user submits a search query
app.post('/search', (request, response) => {
    themoviedb.search(request.body.searchQuery).then((result) => {
        currentSearch = result;
        response.render('search.hbs', {
            parsed: themoviedb.parseResults(result)
        });
    }).catch((error) => {
        response.render('search.hbs', {
            parsed: "<h2>" + error + "</h2>"
        });
    });
});

// favorites tab, populated with user selections
app.get('/favorites', (request, response) => {
    if (checkLogin(response)) {
        response.render('favorites.hbs', {
            favorites: themoviedb.generateFavorites(userFavorites)
        });
    }
});

// when adding or removing favorite movies
app.post('/favorites', (request, response) => {
    if (request.body.favPush === "yes") {
        userFavorites.push(currentSearch[request.body.favIndex]);
        auth.setFavorites(userFavorites);
    } else {
        userFavorites.splice(request.body.favIndex, 1);
        auth.setFavorites(userFavorites);
    }
    response.render('favorites.hbs', {
        favorites: themoviedb.generateFavorites(userFavorites)
    });
});

// displays recommendations based on favorites
app.get('/recommendations', (request, response) => {
    if (checkLogin(response)) {
        var recString = "";
        if (userFavorites.length > 0) {
            for (var i = 0; i < userFavorites.length; i++) {
                recString += userFavorites[i].title;
                if (i != userFavorites.length - 1)
                    recString += ", ";
            }
            tastedive.getRecommendations(recString).then((result) => {
                response.render('recommendations.hbs', {
                    recommendations: tastedive.parseRecommendations(result)
                });
            }).catch((error) => {
                response.render('recommendations.hbs', {
                    recommendations: "<h2>" + error + "</h2>"
                });
            });
        } else {
            response.render('recommendations.hbs', {
                recommendations: "<h2>No favorites found! Favorite at least one movie to generate recommendations.</h2>"
            });
        }
    }
});

// settings page to change username or password
app.get('/settings', (request, response) => {
    if (checkLogin(response)) {
        response.render('settings.hbs', {
            settingsMsg: ''
        });
    }
});

// when user submits info change
app.post('/settings', (request, response) => {
	if (request.body.oldPw != request.body.confirmOldPw) {
		response.render('settings.hbs', {
            settingsMsg: '<h2>Old passwords do not match</h2>'
        });
	}
	else if (!auth.check(auth.getCurrentName(), request.body.oldPw)) {
		response.render('settings.hbs', {
            settingsMsg: '<h2>Old password is incorrect</h2>'
        });
	}
	else if ((request.body.newPw !== '' || request.body.confirmNewPw !== '') && request.body.newPw !== request.body.confirmNewPw) {
		console.log(request.body.newPw);
		console.log(request.body.confirmNewPw);
		response.render('settings.hbs', {
            settingsMsg: '<h2>New passwords do not match</h2>'
        });
	}
	else {
		auth.changeInfo(request.body);
		response.render('settings.hbs', {
            settingsMsg: '<h2>Your changes have been saved</h2>'
        });
	}
});

// when user ends session
app.get('/logout', (request, response) => {
    auth.logoff();
    response.render('log.hbs', {
        signupMsg: '',
        loginMsg: '<h2>You have been successfully logged out!</h2>'
    });
});

app.listen(8080, () => {
    console.log('Server is up on the port 8080');

});