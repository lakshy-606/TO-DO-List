
const express = require("express");
const bodyparser = require("body-parser");
const Date = require(__dirname+"/date.js");
const mongoose = require("mongoose");
const app = express();

app.set("view engine","ejs");
app.use(bodyparser.urlencoded({extended:true}));
app.use(express.static("public"));

// const items = ["study", "contest", "coding"];
 const workitems = [];
mongoose.connect("mongodb+srv://admin-lakshya:test123@cluster1.ftxojdl.mongodb.net/todolistDB", {useNewUrlParser: true});

const itemSchema = new mongoose.Schema({
    name : String
})

const Item = mongoose.model("Item",itemSchema);

const item1 = new Item({
    name : "Welcome to TO-DO-LIST APP"
})
const item2 = new Item({
    name : "Click on + to add your items"
})
const item3 = new Item({
    name : "<--- checkmark this to cross the item"
})
const defaultItem = [item1,item2,item3];

const ListSchema = new mongoose.Schema({
    name : String,
    items :[itemSchema]
})

const List = new mongoose.model("List",ListSchema)


app.get("/",function(req,res){
   
    let day = Date.getDay();
    Item.find().then(function(items){
        if(items.length == 0){
            Item.insertMany(defaultItem);
            res.redirect("/");
        }
        res.render("list",{kindofDay : day , Newli : items});

    })
})

app.post("/",function(req,res){
    let day = Date.getDay();
    const itemName = req.body.newitem;
    const listName = req.body.add;
    const item = new Item({
        name : itemName
    })
    // console.log(itemName,listName);
    if(listName == day){
        item.save();
        res.redirect("/");
    }else{
        List.findOne({name : listName})
        .then(function(foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
        })
    }
})
app.post("/delete",function(req,res){
    // console.log(req.body.list);
    // console.log(req.body.checkbox);
    let day = Date.getDay();
    const listName =req.body.list;
    const checkid = req.body.checkbox;
    if(listName == day){
        Item.findByIdAndRemove(req.body.checkbox)
    .then(() =>{
        //console.log('has been deleted');
        res.redirect("/")
    })
    }else{
        List.findOneAndUpdate( { name: listName },{ $pull: { items: { _id: checkid } } } )
        .then(function(){
            res.redirect("/" + listName);
        })
        
    }
    
})

app.get("/:newRoute",function(req,res){
    const listName = req.params.newRoute
    if(listName == "about"){
        res.render("about");
    }else{
    List.findOne({name : listName})
    .then((result) => {
        if (result != null) {
            // console.log("match found ✅", result);
            res.render("list",{kindofDay : result.name , Newli : result.items})
        } else {
            // console.log("Not found ❌");
                const list = new List({
                name : listName,
                items : defaultItem
            })
            list.save();
            res.redirect("/"+ listName);
        }
    })
    .catch((error) => {
        console.log("ERROR: ❌", error);
    });
    }
})
app.get("/about",function(req,res){
    res.render("about");
})
app.listen(3000, function(){
    console.log("server running at port 3000");
})

// var DAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
// var day = DAYS[today.getDay()];