//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const { redirect } = require("express/lib/response");
const _ = require('lodash');
const app = express();
const {config} = require('./local_modules/config.js');

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));


//#################################### Mongoose Mongo Connection ####################################  
const localOrAtlas = 'atlas' //choose between 'local' or 'atlas' to connect to the appropriate service

const dbName = 'todoListDB';
if (localOrAtlas.toLocaleLowerCase() === 'local'){
  mongoose.connect('mongodb://localhost:27017/' + dbName);
}
else if (localOrAtlas.toLocaleLowerCase() === 'atlas'){
  const password = config.ATLAS_PASSWORD;
  mongoose.connect('mongodb+srv://admin-carlin:' + password + '@cluster0.w7dep.mongodb.net/' + dbName);
}
else {console.log("CHOOSE AN APPROPRIATE CONNECTION...")};



//##################################### Mongoose List Objects #######################################  
//~~~~~~~~~~~~~~~ Item  Schema and model~~~~~~~~~~~~~~~
const itemSchema = new mongoose.Schema({
  name: String,
});

const Item = mongoose.model('Item', itemSchema);

//~~~~~~~~~~~~ Custom List Schema and model ~~~~~~~~~~~~
const listSchema = new mongoose.Schema({
  name: String,
  items: [itemSchema],
});

const List = mongoose.model("List", listSchema);

//~~~~~~~~~~~~~~~~~~~ Default List Items ~~~~~~~~~~~~~~~
const item1 = new Item({
  name: "Welcome to your todo-list!",
});

const item2 = new Item({
  name: "Hit the + button to add new items.",
});

const item3 = new Item({
  name: "<-- Hit this to delete an item.",
});

const defaultItems = [item1, item2, item3];

//############################################### '/' ###############################################  
app.get("/", function (req, res) {
  Item.find({}, (err, foundItems) => {
    if (err) {
      console.log(err);
      //handle the error 
    } else {
      // if the default list is empty, add the default items to it
      if (foundItems.length === 0) {
        Item.insertMany(defaultItems, (error, docs) => {
          if (error) {
            console.log(err);
          } else {
            console.log("Successfully saved default items to DB");
          };
        });
        res.redirect('/');
      } 
      else {
      // if the default list is not empty, render it 
      res.render("list", { listTitle: 'Today', newListItems: foundItems });
      }
    }
  });



});

app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName,
  });

  // if post request came from the default list, save the item to it reload the page
  if (listName === "Today"){
    item.save();
    res.redirect('/');
  } 
  else {
  // if the post request came from a custom list, save the item to the custom list's item and reload the page
    List.findOne({name: listName}, (err, foundList) => {
      if (err) {
        console.log(err);
      }
      else {
        foundList.items.push(item);
        foundList.save();
        res.redirect('/' + listName);
      };
    });
  };
});


//####################################### '/work' DEPRECATED ########################################  
// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });


//######################################## '/:customListName' #######################################  
app.get("/:customListName", (req, res) => {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}, (err, foundList) => {
    if (err) {
      console.log(err);
    }
    else {
      if (!foundList) {
        //create a new list
        const list = new List({
          name: customListName,
          items: defaultItems,
        });
        list.save();
        res.redirect('/' + customListName);
      }
      // if the found list has zero items, populate it with teh default items
      else if (foundList.items.length === 0) {
        console.log(defaultItems);
        foundList.items = foundList.items.concat(defaultItems);
        foundList.save();
        res.redirect('/' + customListName);
      }
      else {
        //render existing list
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      };
    };
  });
});

//############################################ '/about' #############################################  
app.get("/about", function (req, res) {
  res.render("about");
});



//########################################## '/deleteItem' ###########################################  

app.post('/deleteItem', (req, res) => {
  const deletedItemID = req.body.checkbox;
  const listName = req.body.listName;
  
  if (listName === "Today") {
    Item.findByIdAndRemove(deletedItemID, (error) => {
      if (error) {
        console.log(error);
      } else {
        console.log("Successfully deleted the item");
        res.redirect('/');
      }
    });
  }
  else {
    List.updateOne(
      {name: listName},
      {$pull: {items: {_id: deletedItemID}}},
      (err, result) => {
        if (err) {
          console.log('There was an error');
        }
        else {
          console.log('List updated');
          res.redirect('/' + listName);
        }      
      }
    )
  }
});





const port = 3000;
app.listen(port, function () {
  console.log("Server started on port" + port);
});
