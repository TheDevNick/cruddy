const express = require('express');
const bodyParser = require('body-parser')
const dotenv = require('dotenv')
dotenv.config()
const username = process.env.DB_USERNAME
const password = process.env.DB_PASSWORD
const MongoClient = require('mongodb').MongoClient
const app = express()


// create db connection
MongoClient.connect(`mongodb+srv://${username}:${password}@cluster0.jp0g8.mongodb.net/?retryWrites=true&w=majority`)
.then(client => {
    console.log('Connected To the Database!')
    const db = client.db('CrudSchedule') //name of the database
    const quotesCollections = db.collection('quotes')//basically creating a table called quotes
    app.set('view engine', 'ejs')//telling express what our view engine is
    app.use(bodyParser.urlencoded({ extended: true }))//this reads the html
    app.use(bodyParser.json())//returns json
    app.use(express.static('public'))// this allows you to serve static files
    app.get('/', (req, res) => {//GET (READ) request
        quotesCollections.find().toArray()//finding all the quotes and putting it in a array
            .then(results => {
                console.log(results)
                res.render('index.ejs', { quotes : results})
            })//renering the index.ejs with the quotes
            .catch(err => console.error(err))
    })

    app.post('/quotes', (req, res) => {// POST (CREATE) request
        quotesCollections.insertOne(req.body)//inserting the data into the db table (quotes table)
            .then(result => {
                console.log(result)
                res.redirect('/')// after the the creation of the quote, we will redirect back to the root page '/'
            })
            .catch(err => console.error(err))
    })

    app.put('/quotes', (req, res) => {// PUT (UPDATE) request
        console.log(req.body)// basically loging the payload
        quotesCollections.findOneAndUpdate(//handling the update operation
            {name: 'Yoda'}, //this is the query
            {
                $set: { //this is the operation once you find the query 
                    name: req.body.name,
                    quote: req.body.quote
                }
            },
            {
                upsert: true //this inserts a document if no document can be updated
            }
        )
        .then(result => {
            res.json('Success')
        })
        .catch(err => console.error(err))
    })

    app.delete('/quotes', (req, res) => {
        quotesCollections.deleteOne(
            { name: req.body.name }
        )
        .then(result => {
            if(result.deletedCount === 0) {
                return res.json('No quote to delete')
            } else {
                res.json(`Deleted Dark Vader's quote`)
            }
        })
        .catch(err => console.error(err))
    })
    


    // create server 
    app.listen(3000, () => console.log('listening on port 3000!'));
    
})
.catch(err => console.error(err))



