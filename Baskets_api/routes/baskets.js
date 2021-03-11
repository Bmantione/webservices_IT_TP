var express = require('express');
var router = express.Router();
const axios = require('axios');
var zmq = require("zeromq");
var sock = zmq.socket("push");
var sockPull = zmq.socket("pull");

sock.bindSync("tcp://127.0.0.1:8000");
sockPull.connect("tcp://127.0.0.1:8001");

const db = require("../models");
const basket = db.basket;
// const basketinfo = db.basketinfo;

sockPull.on("message", function (msg) {
    let json = JSON.parse(msg.toString());
    if (json.action === "validateBuy") {
        console.log(">>>> Basket created <<<<");
    }
});

router.get('/', function (req, res, next) {
    basket.findAll().then(baskets => {
        res.send(baskets);
    });
});

router.post('/', function (req, res, next) {
    let basket = { idBook: req.body.idBook };

    axios.get(`http://127.0.0.1:3000/books/${basket.idBook}`)
        .then(function (book) {
            basket.id = baskets.length;
            basket.date = new Date();
            basket.save().then(() => {
                res.send({ message: 'Basket created' });
            }).catch(error => {
                res.status(400).send({ error })
            })
        })
        .catch(function (error) {
            res.status(400).send({ error });
        })
});

router.put('/:id/validate', function (req, res, next) {
    basket.findOne({ where: { libelle: parseInt(req.params.id) } }).then(basket => {
        sock.send(JSON.stringify({ action: "buy", idBook: basket.idBook }));

        res.send({ message: 'Basket is creating...' });
    }).catch(error => res.status(400).send({ error }));
});

module.exports = router;
