var express = require('express');
var app = express();

var Animal = require('./Animal.js');
var Toy = require('./Toy.js');



app.use('/findToy', (req, res) =>{

    var toyId = req.query.id;
    Toy.findOne({id:toyId} , (err, toy) => {
        if(err){
            res.type('html').status(500);
            res.send('Error: '+ err);
        }
        else if (!toy){
            res.type('html').status(200);
            res.send({});
        }
        else {
            res.send(toy);
        }
    });
    //res.send('You requested item: '+toyId);

});

app.use('/findAnimals', (req, res) =>{
    
    var aSpecies = req.query.species;
    var aTrait = req.query.trait;
    var gender = req.query.gender;
    Animal.find({species:aSpecies});
    

});

app.use('/animalsYoungerThan', (req, res) =>{
    var aAge = req.query.age;

    Animal.find({age:{$lt: aAge}}, (err, animal) =>{
        if(err){
            res.type('html').status(500);
            res.send('Error: '+err);
        }
        else if(!animal||!aAge||animal.length<1){
            res.type('html').status(200);
            res.send({});
        }
        else {

            var aLen = animal.length;
            var aNames = []
            console.log(aLen);
            for(var i = 0; i < aLen; i++){
                aNames.push(animal[i].name);
            };

            var animals = {count:aLen, names: aNames};

            res.send(animals);
        }
    
    });

});

app.use('/calculatePrice', (req, res) =>{});

app.use(/*default*/ (req, res) => {
	res.json({ msg : 'It works!' });
    });

app.listen(3000, () => {
	console.log('Listening on port 3000');
    });



// Please do not delete the following line; we need it for testing!
module.exports = app;

