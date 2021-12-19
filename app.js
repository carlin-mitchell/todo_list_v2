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



//############################################### '/' ###############################################  
app.get("/", function(req, res) {

  res.render("list", {listTitle: 'Today', newListItems: items});

});

app.post("/", function(req, res){

  const item = req.body.newItem;

  if (req.body.list === "Work") {
    workItems.push(item);
    res.redirect("/work");
  } else {
    items.push(item);
    res.redirect("/");
  }
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
