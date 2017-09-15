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

    var terms = {};
    if(req.query.species)
        terms.species = req.query.species;
    if(req.query.gender)
        terms.gender = req.query.gender;
    if(req.query.trait)
        terms.traits= req.query.trait;

    if(Object.keys(terms).length == 0 ){
        res.type('html').status(200);
        res.send({});
    }else{
    Animal.find(terms, (err, animals) =>{
        if(err){
            res.type('html').status(500);
            res.send('Error: '+err);
        }
        else if(animals.length==0){
            res.type('html').status(200);
            res.send({});
        }
        else{
            var animalList = [];
            for(i = 0; i < animals.length; i++){
                var animal = {};
                animal.name = animals[i].name;
                animal.species = animals[i].species;
                animal.breed = animals[i].breed;
                animal.gender = animals[i].gender;
                animal.age = animals[i].age;
                animalList.push(animal);
            }
            res.send(animalList);

        }

    });
    }

});

app.use('/animalsYoungerThan', (req, res) =>{
    var aAge = req.query.age;
    Animal.find({age:{$lt: aAge}}, (err, animal) =>{
        if(err){
            res.type('html').status(500);
            res.send('Error: '+err);
        }
        else if(!animal||!aAge){
            res.type('html').status(200);
            res.send({});
        }
        else {

            var aLen = animal.length;
            var aNames = []
            for(var i = 0; i < aLen; i++){
                aNames.push(animal[i].name);
            };

            animals = {};
            if(aLen<1){
                animals.count = 0;
            }else{
                animals.count = aLen;
                animals.names = aNames;
            }

            res.send(animals);
        }

    });

});

app.use('/calculatePrice', (req, res) =>{
    var idList =  []
    idList = req.query.id;
    var qtyList = []
    qtyList = req.query.qty;

    //console.log(Object.keys(res.query));

    if(Object.keys(req.query).length === 0 ){
        res.type('html').status(200);
        res.send({});
      }else  if(idList.length != qtyList.length){
        res.type('html').status(200);
        res.send({});
      } else {
        query = {id: {$in: idList}};

        Toy.find(query, (err, toys) =>{
          if(err){
            res.type('html').status(500);
            res.send('Error: '+err);
          }
          else {
            var bill = [];
            var total = 0;
            console.log(toys);
            for(i = 0; i < idList.length; i++){
              for(j = 0 ; j < toys.length; j++){
                if(idList[i] === toys[j].id && !isNaN(qtyList[i])){
                  var item = {}
                  item.item = toys[j].id;
                  item.qty = qtyList[i];
                  item.subtotal = qtyList[i] * toys[j].price;
                  total += item.subtotal;
                  bill.push(item);
                }

              }

            }
            var deliverable = {};
            deliverable.items = bill;
            deliverable.totalPrice = total;
            console.log(bill, total);
            res.send(deliverable);

          }

        });
      }

});

app.use(/*default*/ (req, res) => {
	res.json({ msg : 'It works!' });
    });

app.listen(3000, () => {
	console.log('Listening on port 3000');
    });



// Please do not delete the following line; we need it for testing!
module.exports = app;
