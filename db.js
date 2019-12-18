/*
Skriptas, skirtas duomenų atsiuntimui ir įrašymui į duomenų bazę.
Jį reikia paleisti prieš paleidžiant serverį (server.js).
Kad skriptas veiktų turi būti įjungtas MongoDB serveris.
*/

const http = require('http');
const fs = require('fs');
const zipFile = './monthly-2019.json.zip';
const extract = require('extract-zip');
const path = require('path');
const streamToMongoDB = require('stream-to-mongo-db').streamToMongoDB;
const JSONStream = require('JSONStream');
const outputDBConfig = { dbURL: 'mongodb://localhost:27017/imoniuDuomenuBaze', collection: 'imoniuDuomenys' };
const writableStream = streamToMongoDB(outputDBConfig);
const MongoClient = require('mongodb').MongoClient;
const url = "mongodb://localhost:27017/";


fs.access(zipFile, fs.F_OK, (err) => {
    if (!err) {
        fs.unlinkSync(zipFile);  //Jeigu duomenų .zip failas jau egzistuoja, jis ištrinamas
    };
    MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
        if (err) throw err;
        var dbo = db.db("imoniuDuomenuBaze");
        dbo.collection("imoniuDuomenys").drop(function() {  //Jeigu db kolekcija jau egzistuoja, ji ištrinama
            db.close();
        });
    });
    const file = fs.createWriteStream("monthly-2019.json.zip");
    const request = http.get("http://atvira.sodra.lt/imones/downloads/2019/monthly-2019.json.zip", function(response) {  //Atsiunčiamas duomenų .zip failas
        console.log('download started');
        response.pipe(file).on('finish', function() {
            console.log('download finished');
            extract(zipFile, {dir: __dirname}, function (err) {  //Išskleidžiamas duomenų .zip failas
                if (err) throw err;
                console.log('extraction finished');
                console.log('writing to the database...');
                fs.createReadStream('./monthly-2019.json')  //Duomenys įrašomi į duomenų bazę
                .pipe(JSONStream.parse('*'))
                .pipe(writableStream)
                .on('finish', () => {console.log('finished')});
            });
        });
    });
    return
});