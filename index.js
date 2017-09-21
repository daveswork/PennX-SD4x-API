var express = require('express');
var app = express();

var Animal = require('./Animal.js');
var Toy = require('./Toy.js');

/*
To do:
-Input validation, don't want someone slipping in potentially harmful queries.
-Error handling for absent fields.
*/


/*
Fairly straightforward, just check the id against the 'toy' collection.
*/
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
});

/*
A little more complex than the first API.
Retrieve animals based on some characteristics.
Return only the following fields as a list of objects:
-name
-species
-breed
-gender
-age
*/

app.use('/findAnimals', (req, res) =>{
  //Build the query string from the query parameters.

    var terms = {};
    if(req.query.species)
        terms.species = req.query.species;
    if(req.query.gender)
        terms.gender = req.query.gender;
    if(req.query.trait)
        terms.traits= req.query.trait;

    //Check to see if there are *any* query parameters.
    if(Object.keys(terms).length == 0 ){
        res.type('html').status(200);
        res.send({});
    }else{
    //After retrieving the query object, return only the required fields.
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


/*
Pretty straightforward query, retrieve a list of animals that are younger than
the age specified. Return the number of animals and their names.
*/
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

/*
The BEAST!
*/

app.use('/calculatePrice', (req, res) =>{
  /*
  First, initialize the two main lists we're working with:
  -idList: The toy ids from the query.
  -qtyList: The quantity of toys.
  */
    var idList =  []
    idList = req.query.id;
    var qtyList = []
    qtyList = req.query.qty;

    /*
    Second, some error handling.
    -Check for an empty query.
    -Then check to make sure the number of id params match the number of qty params.
    */

    if(Object.keys(req.query).length === 0 ){
        res.type('html').status(200);
        res.send({});
      }else  if(idList.length != qtyList.length){
        res.type('html').status(200);
        res.send({});
      } else {
        /*
        Certainly, there are more errors that should be handled, but per spec
        this will suffice for testing purposes.

        Now to build the query.
        This will take the list of ids and run the query against MongoDB for
        the toys.
        We get what we get and will reconcile the results against the original
        list as we tally up the bill.
        */
        query = {id: {$in: idList}};

        Toy.find(query, (err, toys) =>{
          if(err){
            res.type('html').status(500);
            res.send('Error: '+err);
          }
          else {
            /*
            Initializing a few variables that we'll be using throughout.
            The 'bill', 'billIndex' and 'found' will be used for duplicate toys
            passed into the query individually.
            The 'total' probably only needs to be used at the end.
            The 'deliverable' will be used at the end and will include the grand
            total as well as the itemized subtotals.
            */
            var bill = [];
            var total = 0;
            var found = false;
            var billIndex = 0;
            var deliverable = {};
            /*
            We're checking three lists here:
            -idList: This was build from the original query
            -toys: Let's see which ones from our query were returned.
            -bill: Update existing items on the bill, and add them if new.
            */
            for(i = 0; i < idList.length; i++){
              for(j = 0 ; j < toys.length; j++){
                if(idList[i] === toys[j].id && !isNaN(qtyList[i]) && qtyList[i] > 0){
                  if(bill.length>0){
                  for(k=0; k < bill.length; k++){
                    if(bill[k].item == idList[i]){
                      found = true;
                      billIndex = k;
                    }
                  }
                }
                  if(found){
                    bill[billIndex].subtotal += qtyList[i] * toys[j].price;
                    bill[billIndex].qty = parseInt(bill[billIndex].qty) + parseInt(qtyList[i]);
                    billIndex = 0;
                    found = false;
                  }else{
                    var item = {}
                    item.item = toys[j].id;
                    item.qty = qtyList[i];
                    item.subtotal = qtyList[i] * toys[j].price;
                    bill.push(item);
                  }
                }

              }

            }
            for(i=0; i < bill.length; i++){
              total += bill[i].subtotal;
            }
            deliverable.items = bill;
            deliverable.totalPrice = total;
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
