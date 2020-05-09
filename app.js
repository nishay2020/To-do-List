const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-nisha:test123@cluster0-rt8vu.mongodb.net/todolistDB", {useNewUrlParser: true,useUnifiedTopology: true,useFindAndModify:true });

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);


const item1 = new Item({
  name: "Welcome to your todolist!"
});

const item2 = new Item({
  name: "Hit the + button to add a new item."
});

const item3 = new Item({
  name: "<-- Hit this to delete an item."
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);


app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems){

    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function(err){
        if (err) {
          console.log(err);
        } else {
          console.log("Successfully savevd default items to DB.");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  });

});

app.get("/:customListName", function(req, res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}, function(err, foundList){
    if (!err){
      if (!foundList){
        //Create a new list
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        //Show an existing list

        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  });



});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if (listName === "Today"){
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId, function(err){
      if (!err) {
        console.log("Successfully deleted checked item.");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
      if (!err){
        res.redirect("/" + listName);
      }
    });
  }


});

app.get("/about", function(req, res){
  res.render("about");
});


let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}


app.listen(port, function() {
  console.log("Server started on port 3000");
});


// //jshint esversion:6
//
// const express = require("express");
// const bodyParser = require("body-parser");
// const date = require(__dirname + "/date.js");
// const mongoose = require("mongoose");
// const app = express();
// const _ = require("lodash");
// app.set('view engine', 'ejs');
//
// app.use(bodyParser.urlencoded({
//   extended: true
// }));
// app.use(express.static("public"));
// /* database connection*/
// mongoose.connect("mongodb://localhost:27017/todolistDB", {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// });
// const itemSchema = {
//   name: String
// };
// const Item = mongoose.model('Item', itemSchema);
//
//
// const item1 = new Item({
//   name: "Welcome to see your work today!!"
// });
// const item2 = new Item({
//   name: "Add your new  tasks by pressing on +"
// });
// const item3 = new Item({
//   name: "add or delete as you complete one."
// });
//
// const defaultitems = [item1, item2, item3];
// const listSchema = {
//   name: String,
//   items: [itemSchema]
// };
// const List = mongoose.model("List", listSchema);
// app.get("/", function(req, res) {
//
//   Item.find({}, function(err, founditems) {
//     if (founditems.length === 0) {
//       Item.insertMany(defaultitems, function(err) {
//         if (err)
//           console.log(err);
//         else {
//           console.log("successfully added items");
//         }
//       });
//       res.redirect("/");
//     } else
//       {res.render("list", {
//         listTitle: "Today",
//         newListItems: founditems
//       });
//     }
//   });
//
// });
//
// app.get("/:customlistname", function(req, res) {
//   const customlistname = _.capitalize(req.params.customlistname);
//   List.findOne({
//     name: customlistname
//   }, function(err, foundlist) {
//     if (!err) {
//       if (!foundlist) {
//         const list = new List({
//           name: customlistname,
//           items: defaultitems
//         });
//         list.save();
//         res.redirect("/"+customlistname);
//
//     } else {
//       res.render("list", {
//         listTitle: foundlist.name,
//         newListItems: foundlist.items});
//       }
//     }
// });
// });
//
// app.post("/", function(req, res) {
//
//   const itemname = req.body.newItem;
//   const listname = req.body.list;
//   const item = new Item({
//     name: itemname
//   });
//   if(listname=== "Today"){
//     item.save();
//     res.redirect("/");
//   }
//   else{
//     List.findOne({name:listname},function(err,foundlist){
//       foundlist.items.push(item);
//       foundlist.save();
//       res.redirect("/"+listname);
//     });
//   }
//
// });
//
// app.post("/delete", function(req, res) {
//   const checkeditemid = req.body.checkbox;
//   const listname = req.body.listname;
//
// if(listname === "Today")
// {
//   Item.findByIdAndRemove(checkeditemid, function(err) {
//     if (err)
//       console.log(err);
//     else {
//       console.log("Successfully deleted on eitem");
//       res.redirect("/");
//     }
//   });
// }
// else{
//   List.findOneAndUpdate({name:listname},{$pull:{items:{_id:checkeditemid}}},function(err,foundlist)
// {
//   if(!err)
//   {
//     res.redirect("/"+listname);
//   }
// });
// }
//
// });
//
//
//
// app.get("/about", function(req, res) {
//   res.render("about");
// });
//
// app.listen(3000, function() {
//   console.log("Server started on port 3000");
// });
