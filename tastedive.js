const request = require('request');

var key = '302969-StudentP-ITG1R8RP';

var getRecommendations = (seed) => {
    return new Promise((resolve, reject) => {
        request({
            url: 'https://tastedive.com/api/similar?type=movies&info=1&k=' + key + '&q=' + encodeURIComponent(seed),
            json: true
        }, (error, response, body) => {
            if (error) {
                reject('Cannot connect to Tastedive');
            } else if (body.Similar.Results.length< 1) {
                reject('No recommendations found for query');
            } else {
                resolve(
                    body.Similar.Results
                );
            }
        });
    });
}

var readRecommendations = (reclist) => {
    for (var i = 0; i < reclist.length; i++) {
        console.log(`Name: ${reclist[i].Name}`);
        console.log(`Description: ${reclist[i].wTeaser}`);
    }
}

var parseRecommendations = (reclist) => {
	var generated = "";
	for (var i = 0; i < reclist.length; i++) {
        var teaser = reclist[i].wTeaser;
        if (teaser.length > 600)
            teaser = teaser.substring(0, 600) + "..";
        generated += `
        <div style='background-color:#FFFCF8; width:100%; height:20%; text-align:left; border-top:1px solid black;'>
            <iframe src='${reclist[i].yUrl}' style='left=1vw; margin:5px; vertical-align: top; display: inline; float: left'></iframe> 
            <div style='width:100%; height:10%; vertical-align: top; display: inline'>
                <strong>Title</strong>: ${reclist[i].Name}<br>
                <strong>Overview</strong>: ${teaser}<br>
            </div>
        </div>`;
    }
    return generated;
}

module.exports = {
    getRecommendations,
    readRecommendations,
    parseRecommendations
};