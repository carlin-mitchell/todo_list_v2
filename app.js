//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const { redirect } = require("express/lib/response");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));


//#################################### Mongoose Mongo Connection ####################################  
const dbName = 'todoListDB';
mongoose.connect('mongodb://localhost:27017/' + dbName);


//##################################### Mongoose List Objects #######################################  
const itemSchema = new mongoose.Schema({
  name: String,
});

const Item = mongoose.model('Item', itemSchema);

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

//~~~~~~~~~~~~ Custom List Schema ~~~~~~~~~~~~
const listSchema = new mongoose.Schema({
  name: String,
  items: [itemSchema],
});

const List = mongoose.model("List", listSchema);

//############################################### '/' ###############################################  
app.get("/", function (req, res) {

  Item.find({}, (err, foundItems) => {
    if (err) {
      console.log(err);
      //handle the error 
    } else {
      if (foundItems.length === 0) {
        Item.insertMany(defaultItems, (error, docs) => {
          if (error) {
            console.log(err);
          } else {
            console.log("Successfully saved default items to DB");
          };
        });
        res.redirect('/');
      } else {
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

  if (listName === "Today"){
    item.save();
    res.redirect('/');
  } 
  else {
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
  const customListName = req.params.customListName;

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
  let deletedItemID = req.body.checkbox;
  console.log(deletedItemID);
  Item.findByIdAndRemove(deletedItemID, (error) => {
    if (error) {
      console.log(error);
    } else {
      console.log("Successfully deleted the item");
      res.redirect('/');
    }
  });
});





const port = 3000;
app.listen(port, function () {
  console.log("Server started on port" + port);
});
