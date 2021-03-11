var express = require('express');
var router = express.Router();
var zmq = require("zeromq");
var sock = zmq.socket("pull");
var sockPush = zmq.socket("push");

sock.connect("tcp://127.0.0.1:8000");
sockPush.bindSync("tcp://127.0.0.1:8001");

const db = require("../models");
const book = db.book;

sock.on("message", function (msg) {
    let json = JSON.parse(msg.toString());
    if (json.action === "buy") {
        book.findOne({ where: { id: parseInt(json.idBook) } }).then(book => {
            if (book.quantity >= json.quantity) {
                book.quantity -= json.quantity;
                book.save().then(() =>
                    sockPush.send(JSON.stringify({ action: "validateBuy", idBook: json.idBook }))
                ).catch(
                    err => res.status(500).send({ message: err.message })
                );
            }
        })
    }
});

router.get('/', function (req, res, next) {
    book.findAll().then(books => {
        res.send(books);
    });
});

router.post('/', function (req, res, next) {
    book.create({
        title: req.body.title,
        author: req.body.author,
        quantity: req.body.quantity
    })
    .then(result => res.send({ message: "Book created" }))
    .catch(err => res.status(500).send({ message: err.message }));
});

router.get('/:id', function (req, res, next) {
    book.findOne({ where: { id: parseInt(req.params.id) } }).then(book => {
        if (book !== null) {
            res.send(book);
        } else {
            res.status(404).send({ error: 'Book not found' })
        }
    }).catch(error => res.status(404).send({ error }));
});

router.post('/:id/buy', function (req, res, next) {
    book.findAll().then(books => {
        books.forEach(book => {
            if (book.id === parseInt(req.params.id)) {
                if (book.stock > 1) {
                    book.stock--;
                } else {
                    res.status(400).send({ message: 'This book is no longer in stock' });
                }
            }
        })
        res.send({ message: 'Book bought' });
    }).catch(error => res.status(404).send({ error }))
});

module.exports = router;
