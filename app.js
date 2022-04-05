/*********************************/
const express = require("express");
const body_parser = require("body-parser");
const ejs = require("ejs");
const date = require(__dirname + "/date.js");
const _ = require("lodash");
// const item = "";
// var items = ["buy food", "cook food", "eat food"];
// var work_items = [];
const mongoose = require("mongoose");

/*********************/
const app = express();
app.set("view engine", "ejs");
app.use(body_parser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin:admin@cluster0.vlc7o.mongodb.net/todolistDB");

const items_schema = new mongoose.Schema({
  name: String
});

const item = mongoose.model("item", items_schema);

const item1 =  new item({
  name: "to do list"
});

const item2 =  new item({
  name: "click + button to add"
});

const item3 =  new item({
  name: "<-- hit this to delete"
});

const default_items = [item1, item2, item3];

const list_schema = new mongoose.Schema({
  name: String,
  items: [items_schema]
});

const list_collection = mongoose.model("list", list_schema);



// item.insertMany(default_items, function (err) {
//
//   if (err) {
//     console.log(err);
//   } else {
//     console.log("default item inserted !")
//   }
//
// });

/***************************/
app.get("/", (req, res) => {

  let day = date.get_date();

  item.find({}, function (err, found_items) {
    // console.log(found_items);
    if (found_items.length === 0) {
      item.insertMany(default_items, function (err) {

        if (err) {
          console.log(err);
        } else {
          console.log("default item inserted !")
        }
        res.redirect("/");
      });
    } else {
      res.render("list", {
        title: day,
        new_items: found_items
      })
    }
  });


});

// app.post("/", (req, res) => {
//
//   const item = req.body.item;
//   console.log(item);
//   items.push(item);
//
//   // console.log(items);
//
//   res.redirect("/");
//
// });

// app.get("/work", (req, res) => {
//
//   res.render("list", {
//     title: "work list",
//     new_items: work_items
//   });
//
// });

app.get("/:new_list", (req, res) => {

  const new_list_name = _.capitalize(req.params.new_list);

  list_collection.findOne({name: new_list_name}, function (err, found) {

    if (!err) {
      if (!found) {
        const new_created_list = new list_collection ({
          name : new_list_name,
          items: default_items
        });

        new_created_list.save();
        res.redirect("/" + new_list_name)
      } else {
        res.render("list", {
          title: found.name,
          new_items: found.items
        })
      }
    }

  })

})

app.post("/", (req, res) => {

  const item_name = req.body.item;
  const list_name = req.body.button;

  const new_item = new item({
    name: item_name
  })

  if(list_name === date.get_date()) {

    new_item.save();
    res.redirect("/");

  } else {

    list_collection.findOne({name: list_name}, function (err, f) {

      f.items.push(new_item);
      f.save();
      res.redirect("/" + list_name);

    })

  }

  // console.log(item);
  // console.log(req.body);

  // if (req.body.button === "work") {
  //
  //   work_items.push((item));
  //   res.redirect("/work");
  //
  // } else {
  //
  //   items.push(item);
  //   res.redirect("/");
  //
  // }

  // res.redirect("/work");

});

app.post("/delete", (req, res) => {

  const checked_item_for_deletion = req.body.checkbox;
  const list_name = req.body.list_name;
  // console.log(checked_item_for_deletion);

  if (list_name === date.get_date()) {


    item.findByIdAndRemove(checked_item_for_deletion, function (err) {

      if (!err) {
        res.redirect("/");
      }

    });

  } else {

    list_collection.findOneAndUpdate({name: list_name}, {$pull: {items: {_id: checked_item_for_deletion}}}, function (err, found){

      if (!err) {
        res.redirect("/" + list_name);
      }

    });

  }

  // console.log(checked_item_for_deletion);

  // item.findByIdAndRemove(checked_item_for_deletion, function (err) {
  //
  //   if (err) {
  //     console.log(err);
  //   } else {
  //     console.log("item deleted");
  //     res.redirect("/");
  //   }
  //
  // });

});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port);

/****************************/
app.listen(port, function() {
  console.log("Server is connected");
})
