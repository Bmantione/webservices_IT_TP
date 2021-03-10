var express = require('express');
var router = express.Router();
const axios = require('axios');
var zmq = require("zeromq"),
  sock = zmq.socket("push")
  sockPull = zmq.socket("pull");

let baskets = [];
sock.bindSync("tcp://127.0.0.1:8000");
sockPull.connect("tcp://127.0.0.1:8001");

sockPull.on("message", function(msg) {
    console.log("message reçu")
    let o = JSON.parse(msg.toString());
    if(o.action === "validation_achat") {
        console.log("basket validé")
    }
});

router.get('/', function (req, res, next) {
    res.send(baskets);
});

router.post('/', function (req, res, next) {
    let basket = {};
    basket.idbook = req.body.idbook;

    axios.get(`http://127.0.0.1:3000/books/${basket.idbook}`)
        .then(function (response) {
            basket.id = baskets.length;
            basket.date = new Date();
            baskets.push(basket);
            res.send({ message: 'basket créé' });
        })
        .catch(function (error) {
            res.status(400).send({ message: 'basket non créé' });
        })
});

router.put('/:id/valider', function (req, res, next) {
    let basket = null;
    baskets.forEach(p => {
        if(p.id === parseInt(req.params.id)) {
            basket = p;
        }
    })
    if(basket !== null) {
        sock.send(JSON.stringify({ action: "achat", idbook: basket.idbook }));
        /*axios.post(`http://127.0.0.1:3000/books/${basket.idbook}/acheter`)
        .then(function (response) {
            res.send({ message: 'basket validé' });
        })
        .catch(function (error) {
            res.status(400).send({ message: 'basket non validé' });
        })*/
        res.send({ message: 'basket en cours de validation' });
    } else {
        res.status(404).send({error: 'basket introuvable'});
    }
});

module.exports = router;
