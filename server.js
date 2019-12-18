//Pirmiau reikia paleisti db.js
//Kad paieška veiktų turi būti įjungtas MongoDB serveris.

const express = require('express');
const app = express();
var path = require('path');

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

var kodas = " ";
const imonesNera = {
    "lookupId" : 0,
    "code" : 0,
    "jarCode" : "0",
    "name" : "Įmonė nerasta",
    "shortname" : " ",
    "month" : null,
    "avgWage" : null,
    "avgWage2" : null,
    "numInsured" : null,
    "numInsured2" : null,
    "tax" : null,
    "ecoActName" : null,
    "ecoActCode" : null,
    "municipality" : " "
    };
var imone = imonesNera;

function sleep(ms){
    return new Promise(resolve=>{
        setTimeout(resolve,ms)
    });
}

function apieImone () {
        MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
        if (err) throw err;
        var dbo = db.db("imoniuDuomenuBaze");
        dbo.collection("imoniuDuomenys").findOne({jarCode: kodas}, function(err, result) {
            if (err) throw err;
            if (result === null) {
                imone = imonesNera;
            } else {
                imone = result;
            };
            db.close();
        });
      });
}

app.use(express.urlencoded({ extended: false }));

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

app.get('/index.html', async function (req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
  });

app.post('/index.html', async function (req, res) {
    if (req.body.imonesKodas != '') {
        kodas = req.body.imonesKodas;
        apieImone();
        await sleep(3000);
        res.render(path.join(__dirname + '/apie.ejs'), {imonesDuomenys: imone});
    } else {
        res.sendFile(path.join(__dirname + '/index.html'));
    };
  });

app.listen(3000);