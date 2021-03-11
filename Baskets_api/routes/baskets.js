var express = require('express');
var router = express.Router();
const axios = require('axios');
var zmq = require("zeromq");
var sock = zmq.socket("push");
var sockPull = zmq.socket("pull");

sock.bindSync("tcp://127.0.0.1:8000");
sockPull.connect("tcp://127.0.0.1:8001");

const db = require("../models");
const Basket = db.basket;
const Basketinfo = db.basketinfo;

sockPull.on("message", function (msg) {
    let json = JSON.parse(msg.toString());
    if (json.action === "validateBuy") {
        console.log(">>>> Basket created <<<<");
    }
});

router.get('/', function (req, res, next) {
    Basket.findAll().then(baskets => {
        res.send(baskets);
    });
});

router.post('/', function (req, res, next) {
    // if basket doesn't exist, create it.
    Basket.findOne({ where: { id: parseInt(req.body.basketId) } }).then(basket => {
        if(basket === null) {
            Basket.create()
            .then(basket => {
                axios.get(`http://127.0.0.1:3000/books/${req.body.bookId}`)
                .then(book => {
                    Basketinfo.create({
                        basketId: basket.id,
                        idBook: book.data.id,
                        title: book.data.title,
                        author: book.data.author,
                        quantity: req.body.quantity
                    })
                    .then(result => res.send({ message: 'new Book ('+ book.data.title +') add to Basket' }))
                    .catch(err => res.status(500).send({ message: err.message }));
                })
                .catch(function (error) {
                    res.status(400).send({ error });
                })
            })
            .catch(err => res.status(500).send({ message: err.message }));
        } else {
            axios.get(`http://127.0.0.1:3000/books/${req.params.bookId}`)
            .then(book => {
                Basketinfo.create({
                    basketId: req.body.basketId,
                    idBook: book.data.id,
                    title: book.data.title,
                    author: book.data.author,
                    quantity: req.body.quantity
                })
                .then(result => res.send({ message: 'new Book ('+ book.data.title +') add to Basket' }))
                .catch(err => res.status(500).send({ message: err.message }));
            })
            .catch(function (error) {
                res.status(400).send({ error });
            });
        }
    })
});

router.put('/:id/validate', function (req, res, next) {
    Basket.findOne({ where: { id: parseInt(req.params.id) } }).then(basket => {
        sock.send(JSON.stringify({ action: "buy", idBook: basket.idBook }));

        res.send({ message: 'Basket is creating...' });
    }).catch(error => res.status(400).send({ error }));
});

module.exports = router;
