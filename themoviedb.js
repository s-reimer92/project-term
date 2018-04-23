const request = require('request');

var key = '4f7f94aba387fbfbfa50c54655774e78';

var search = (query) => {
    return new Promise((resolve, reject) => {
        request({
            url: 'https://api.themoviedb.org/3/search/movie?api_key=' + key + '&query=' + encodeURIComponent(query),
            json: true
        }, (error, response, body) => {
            if (error) {
                reject('Cannot connect to TheMovieDB');
            } else if (body.total_results < 1) {
                reject('No results found for query');
            } else {
                resolve(
                    body.results
                );
            }
        });
    });
}

var readResults = (results) => {
    for (var i = 0; i < results.length; i++) {
        console.log(`Title: ${results[i].title}`);
        console.log(`Description: ${results[i].overview}`);
    }
}

var parseResults = (results) => {
    var parsed = "";
    for (var i = 0; i < results.length; i++) {
        var overview = results[i].overview;
        if (overview.length > 600)
            overview = overview.substring(0, 600) + "..";
        parsed += `
        <div style='background-color:#FFFCF8; width:100%; height:20%; text-align:left; border-top:1px solid black; '>
            <img src='http://image.tmdb.org/t/p/w92/${results[i].poster_path}' style='left=1vw; margin:5px; height:90%; vertical-align: top; display: inline; float: left'/>
            <div style='width:100%; height:10%; vertical-align: top; display: inline'>
                <strong>Title</strong>: ${results[i].title}<br>
                <strong>Overview</strong>: ${overview}<br>
                <strong>Release Date</strong>: ${results[i].release_date}<br>
                <form action="/favorites" enctype="application/json" method="post">
                    <input id= "favIndex" name="favIndex" type="hidden" value=${i} />
                    <input id= "favPush" name="favPush" type="hidden" value="yes" />
                    <input id="Favorite" action="/favorites" type="submit" value="Favorite" />
                </form>
            </div>
        </div>`;
    }
    return parsed;
}

var generateFavorites = (favorites) => {
    var generated = "";
    if (favorites.length < 1) {
        return "<h2>No favorites have been saved!</h2>";
    }
    for(var i = 0; i < favorites.length; i++) {
        var overview = favorites[i].overview;
        if (overview.length > 600)
            overview = overview.substring(0, 600) + "..";
        generated += `
        <div style='background-color:#FFFCF8; width:100%; height:20%; text-align:left; border-top:1px solid black; '>
            <img src='http://image.tmdb.org/t/p/w92/${favorites[i].poster_path}' style='left=1vw; margin:5px; height:90%; vertical-align: top; display: inline; float: left'/>
            <div style='width:100%; height:10%; vertical-align: top; display: inline'>
                <strong>Title</strong>: ${favorites[i].title}<br>
                <strong>Overview</strong>: ${overview}<br>
                <strong>Release Date</strong>: ${favorites[i].release_date}<br>
                <form action="/favorites" enctype="application/json" method="post">
                    <input id= "favIndex" name="favIndex" type="hidden" value=${i} />
                    <input id= "favPush" name="favPush" type="hidden" value="no" />
                    <input id="Unfavorite" action="/favorites" type="submit" value="Unfavorite" />
                </form>
            </div>
        </div>`;
    }
    return generated;
}

module.exports = {
    search,
    readResults,
    parseResults,
    generateFavorites
};