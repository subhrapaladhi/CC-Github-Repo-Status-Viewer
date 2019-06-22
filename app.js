var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var fetch = require('node-fetch')

app.use(bodyParser.urlencoded({extended: true}));

var publicDir = require('path').join(__dirname,'/public');
app.use(express.static(publicDir));

function apiReqRes(url){
    return new Promise(async(resolve, reject) => {
        var response = await fetch(url)
                        .catch((error) =>reject(error));
        var json = await response.json();
        var returnValue = Object.entries(json.payload);
        resolve(returnValue);
    });
};

var allRepos = [];

app.get('/home', async (req,res) => {
    var topRepos, topContributors;
   
    var apicall1 = apiReqRes('https://cc-leaderboard.herokuapp.com/leaderboard');
    var apicall2 = apiReqRes('https://cc-leaderboard.herokuapp.com/topcontributors');
    var apicall3 = apiReqRes('https://cc-leaderboard.herokuapp.com/repos');
    Promise.all([apicall1,apicall2,apicall3])
        .then((response) => {
            topContributors = response[0];
            topRepos = response[1];
            var temp = response[2];

            temp.forEach((repo) => {
                allRepos.push(repo[1]);
            })
        
            res.render('home.ejs', {topRepos: topRepos, topContributors: topContributors, allRepos: allRepos});
        })
        .catch((error) => console.log(error.message))
    
});

app.get('/home/search/repo/:repoName', async(req,res) => {
        var repoName = req.params.repoName;
        var details;

        allRepos.forEach((repo) => {
            if(repo.name === repoName){
                details = repo.ref.target.history.edges;
            }
        })

        res.render('RepoDetails.ejs', {repoName: repoName, details: details});

})

app.post('/home/search/repo', (req,res) => {
    res.redirect(`/home/search/repo/${req.body.repoName}`);
})


app.listen(3000, () => console.log('server connected to port 3000'));