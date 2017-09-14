var express = require('express');
var app = express();

var Animal = require('./Animal.js');
var Toy = require('./Toy.js');


app.use('/', (req, res) => {
	res.json({ msg : 'It works!' });
    });


app.use('/findToy', (req, res) =>{});

app.use('/findAnimals', (req, res) =>{});

app.use('/animalIsYoungerThan', (req, res) =>{});

app.use('/calculatePrice', (req, res) =>{});

app.listen(3000, () => {
	console.log('Listening on port 3000');
    });



// Please do not delete the following line; we need it for testing!
module.exports = app;

