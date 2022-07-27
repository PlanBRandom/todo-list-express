/*enables the use of the express frame work*/
const express = require('express')
/*create a new express application object*/
const app = express()
/*inports the mongodb client.*/
const MongoClient = require('mongodb').MongoClient
//tells express what port to listen on
const PORT = 2121
//broken down into 2 parts: we're first importing env and then loading using .config()
require('dotenv').config()

//Simply giving db a name so we don't have to constantly retype everything; these are 'quality of life' variables

let db,//asigned globaly ie useable anywhere only in this file
    dbConnectionStr = process.env.DB_STRING,
    dbName = 'todo'

//Initialize the connection to MongoDB; it returns a promise! if you don't have the string
    MongoClient.connect(dbConnectionStr, { useUnifiedTopology: true })
    //Handling a succesfully resolved promise and printing to the console
    .then(client => {
        console.log(`Connected to ${dbName} Database`)
         //assinging the connected client instance, attached to the 'todo' collection to the 'db' variable 
        db = client.db(dbName)
    })
    //lets not forget to add a catch
    .catch(error => console.error(error))
    
//Telling express that whenever we pass a render method, we use EJS
app.set('view engine', 'ejs')
//Anything that is in the 'public' folder, just serve it up as is!
app.use(express.static('public'))
//Middleware - allows data to be passed to server via request
//(https://localhost/route?variable=value&othervariable=othervalue)
//if something is passed through it will be coming through the url
app.use(express.urlencoded({ extended: true }))
//Will look at the json you request to it, parse it, and understand it; "it" refers to express
app.use(express.json())

//Using the get method, we are using '/' to get to the root directory; async is working in conjuntion with await, this way we don't have to use .then by taking in a request and response variable

app.get('/',async (request, response)=>{
    //request to mongo to return all records from 'todos' collection, in an array.
    const todoItems = await db.collection('todos').find().toArray()
    //We are telling the collection go through all the documents that haven't been completed yet; or if the completed is equal to false, keep checking 
    const itemsLeft = await db.collection('todos').countDocuments({completed: false})
    //Once everything has been completed, we're creating a new variable called todoItems and itemsLeft and feeding it into index.ejs, client sees HTML, EJS is just a template of HTML
    response.render('index.ejs', { items: todoItems, left: itemsLeft })
    // db.collection('todos').find().toArray()
    // .then(data => {
    //     db.collection('todos').countDocuments({completed: false})
    //     .then(itemsLeft => {
    //         response.render('index.ejs', { items: data, left: itemsLeft })
    //     })
    // })
    // .catch(error => console.error(error))
})
//Post method for recieving a new todo item
//Will set every new item created by the user as false so it will trigger the promise from before
app.post('/addTodo', (request, response) => {
//adds new todo item to the db, with the completed field defaulted to false.     
    db.collection('todos').insertOne({thing: request.body.todoItem, completed: false})
//handles returned promise, logs to the server console and redirects back to root page.
//Handles returned promise, console log into heroku not the browser of the user    
    .then(result => {
        console.log('Todo Added')
        response.redirect('/')
    })
// logs an error to the console. if there is one
    .catch(error => console.error(error))
})

//defines an end point to handle a PUT request
app.put('/markComplete', (request, response) => {
    //updates a record, using a vaule recieved foem 'itemFromJs'  in the body of the request   
    db.collection('todos').updateOne({thing: request.body.itemFromJS},{
        //When the DB is updated, it will sort everything and put anythning new to the end of the list and not the top
        $set: {
            completed: true
          }
    },{
        //sort newest version of item ie walk the dog
        //update the newest document if multiple results. if no matches, dont create a new record.
        sort: {_id: -1},// ID and -1 puts stuff at end of array
        //upsert is like a child of update and insert methods
        upsert: false
    })
    //If successful, log and send the response. If not, log the error
    .then(result => {
        console.log('Marked Complete')
        response.json('Marked Complete')
    })
    .catch(error => console.error(error))

})
//Does the opposite of the previous request sets completed to false
app.put('/markUnComplete', (request, response) => {
    db.collection('todos').updateOne({thing: request.body.itemFromJS},{
        $set: {
            completed: false
          }
    },{
        sort: {_id: -1},
        upsert: false
    })
    .then(result => {
        console.log('Marked Complete')
        response.json('Marked Complete')
    })
    .catch(error => console.error(error))

})
//Handles a delete request at the defined endpoint
app.delete('/deleteItem', (request, response) => {
    //mongodb function to delete
    db.collection('todos').deleteOne({thing: request.body.itemFromJS})
    //if successful, log and send response
    .then(result => {
        console.log('Todo Deleted')
        response.json('Todo Deleted')
    })
    .catch(error => console.error(error))

})
//belongs at the end to prevent an infenity loop
//This is what starts the server and waits for requests 
//What would happen if app.listen was somewhere in the middle?
/*
It would stop at the listen because listen is a blocking function. It will sit there and loop over and over and over and over again until the server is killed. It will dwell on this ONE function so MAKE SURE you put it at the end*/
app.listen(process.env.PORT || PORT, ()=>{
    console.log(`Server running on port ${PORT}`)
})