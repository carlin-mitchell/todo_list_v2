//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


//#################################### Mongoose Mongo Connection ####################################  
const dbName = 'todoListDB';
mongoose.connect('mongodb://localhost:27017/' + dbName);

const itemSchema = new mongoose.Schema({
  name: String,
});

const Item = mongoose.model('Item', itemSchema);

const item1 = new Item ({
  name: "Welcome to your todo-list!",
});

const item2 = new Item ({
  name: "Hit the + button to add new items.",
});

const item3 = new Item ({
  name: "<-- Hit this to delete an item.",
});

const defaultItems = [item1, item2, item3];

//############################################### '/' ###############################################  
app.get("/", function(req, res) {

  Item.find({}, (err, foundItems) => {
    if (err) {
      console.log(err);
      //handle the error 
    } else {
      if (foundItems.length === 0){
        Item.insertMany(defaultItems, (error, docs) => {
          if (error) {
            console.log(err);
          }else {
            console.log("Successfully saved default items to DB");
          };
        });
        res.redirect('/');
      } else{
        res.render("list", {listTitle: 'Today', newListItems: foundItems});
      }
    }
  }); 
  
  

});

app.post("/", function(req, res){
  const item = new Item({
    name: req.body.newItem,
  });
  
  Item.insertMany([item], (error, docs) =>{
    if (error){
      //handle the error
      console.log(error);
    }else {
      console.log(`Successfully added "${item.name}" to list.`);
      res.redirect('/');
    };
  });
});



//############################################# '/work' #############################################  
app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});



//############################################ '/about' #############################################  
app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});



//############################################ '/delete' #############################################  

app.post('/delete', (req, res) =>{
  console.log(req.body);
});