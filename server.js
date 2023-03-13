

const { connectToDb, getDb } = require('./db');
const { ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3000;
const dbCollection = {
    blogs: 'blogs',
    updates: 'updates',
};

// db connection
let db;
connectToDb(async (err) => {
    if (!err) {
        await app.listen(PORT);
        db = getDb();
    }
});

app.use(express.json());
app.use(cors());
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

app.get('/', async (req, res) => {
    try {
        const blogs = await db
            .collection('blogs')
            .find()
            .sort({ _id: -1 })
            .toArray();

        res.render(path.join(__dirname + '/views/index.ejs'), { articles: blogs });
    } catch (err) {
        res.status(500).json({ error: 'could not get data' });
    }
});

app.post('/', async (req, res) => {
    try {
        await db
            .collection('blogs')
            .deleteOne({ _id: ObjectId(req.query.id) });
        res.redirect('/');
    } catch (err) {
        res.status(500).json({ error: 'Could not delete task' });
    }
});

app.get('/new', (req, res) => {
    res.render('new');
});

app.get('/features', async (req, res) => {
    try {
        const updates = await db
            .collection('updates')
            .find()
            .sort({ _id: -1 })
            .toArray();
        res.render('features', { updates });
    } catch (err) {
        res.status(500).json({ error: 'could not get data' });
    }
});

app.get('/edit', async (req, res) => {
    try {
        const result = await db
            .collection('blogs')
            .findOne({ _id: ObjectId(req.query.id) });
        res.render('edit', { articles: result });
    } catch (err) {
        res.status(500).json({ error: 'could not get data' });
    }
});

app.post('/edit', async (req, res) => {
    try {
        const updatedTitle = req.body.title;
        const updatedDescription = req.body.description;
        const updatedMarkdown = req.body.markdown;
        await db.collection('blogs').findOneAndUpdate(
            { _id: ObjectId(req.body.id) },
            {
                $set: {
                    title: updatedTitle,
                    description: updatedDescription,
                    markdown: updatedMarkdown,
                },
            }
        );
        res.redirect(`/article?v=${req.body.id}`);
    } catch (err) {
        res.status(500).json({ error: 'could not get data' });
    }
});


app.post('/article', (req, res) => {

    let newBlog = req.body



    db.collection('blogs')
        .insertOne(newBlog)
        .then(result => {


            var stringID = req.body._id.toString()


            res.redirect(`/article?v=${stringID}`)




            res.status(200)

        })
        .catch(err => {
            res.status(500)
            res.send(`Error:${err}`)
        })

})

app.get('/article', (req, res) => {

    db.collection('blogs')
        .findOne({ _id: new ObjectId(req.query.v) })
        .then(result => {

            if (result) {
                res.render('article', { articles: result })
            } else {

                res.redirect('/')
            }

        })





})

module.exports = app