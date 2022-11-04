const express =require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose")
const _ = require("lodash")
// const date = require(__dirname + "/date.js")

const app = express();

app.set("view engine", "ejs");
  
// app.use(bodyParser.urlencoded({Extended:true}));
app.use(express.urlencoded({extended: true})); 
app.use(express.json());
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB") 

const itemsSchema = {
    name: String
}
const Item = mongoose.model("item", itemsSchema);
const item1 = new Item({
    name: "Welcome to your todolist!"
})

const item2 = new Item({
    name: "Hit the + button to add a new item"
})

const item3 = new Item({
    name: "Check the box to cross out an item"
})

const defaultItems = [item1, item2, item3]; 

const listSchema = {
    name: String,
    items:[itemsSchema]

};
const List = mongoose.model("List", listSchema);

app.get("/", function(req, res){ 
    // let day = date.getDate ();
 
    Item.find({}, (err, foundItems) => {

        if (foundItems.length === 0){
            
Item.insertMany(defaultItems, (err) => {
    if (err){
        console.log(err)
    } else{
        console.log("New item added successfully")
    }
});
res.redirect("/");

        } else{
            res.render("list", {listTitle: "Today", newListItems: foundItems});
        }
          
        });
    });
    app.get ("/:customListName", (req, res) => {
        
        const customListName = _.capitalize(req.params.customListName);
    
        List.findOne({name: customListName}, (err, foundList) => {

            if (!err){
           if (!foundList){
               //Create a new list
               const list = new List ({
                name: customListName,
                items: defaultItems
            });
    
            list.save(); 
            res.redirect("/" + customListName);
           } else{
               //Show an existing list
               res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
           }
       }
    });

    });
    
app.post("/", (req, res) => { 
    const itemName = req.body.newItem; 
    const listName = req.body.list;
    const item = new Item({
    name: itemName

   });

    if (listName === "Today"){
        item.save();
        res.redirect("/");
    } else {
    List.findOne({name: listName}, (err, foundList) => {
    foundList.items.push(item);
    foundList.save();
    res.redirect("/" + listName);
     });
    }
});

    app.post("/delete", (req, res) => {
        const checkedItemId = req.body.checkbox;
        let listName = req.body.listName;

        if (listName === "Today"){
            Item.findByIdAndRemove(checkedItemId, (err) => {
                if (!err){
                    console.log("Checked item deleted successfully");
                res.redirect("/");
            }
        });
        } else {
            List.findOneAndUpdate({name: listName}, { $pull: {items: {_id:checkedItemId}}}, (err, foundList) => {
               if (!err) {
                   res.redirect("/" + listName);
               } 
            });

        }
});

app.get("/about", (req, res) => {
    res.render("about");
});

let PORT = process.env.PORT || 3000;

app.listen(PORT, function(req, res){
    console.log(`Server has started running sucessfully at ${PORT}`)
}); 