var express = require('express');
var router = express.Router();
var zmq = require("zeromq"),
  sock = zmq.socket("pull"),
  sockPush = zmq.socket("push");

sock.connect("tcp://127.0.0.1:8000");
sockPush.bindSync("tcp://127.0.0.1:8001");
let books = [];

const db = require("../models");
const book = db.book;

sock.on("message", function(msg) {
    let o = JSON.parse(msg.toString());
    if(o.action === "achat") {
        books.forEach(book => {
            if(book.id === parseInt(o.idbook)) {
                if(book.stock > 1) {
                    book.stock--;
                    console.log("books, décompte stock")
                    sockPush.send(JSON.stringify({ action: "validation_achat", idbook: o.idbook }))
                } else {
                    // TODO
                    return;
                }
            }
        })
    }
    //console.log("work: %s", msg.toString());
});

router.get('/', function(req, res, next) {
    book.findAll().then(types => {
        res.send(types);
    });
});

router.post('/', function(req, res, next) {
    book.create({
      title: req.body.title,
      author: req.body.author,
      quantity: req.body.quantity
    })
    .then(res.send({ message: "book créé !" }))
    .catch(err => {
        res.status(500).send({ message: err.message });
    });
});

router.get('/:id', function(req, res, next) {
    res.send(plexType.findOne({ where: { libelle: req.params.id } }));
});

router.post('/:id/acheter', function(req, res, next) {
    books.forEach(book => {
        if(book.id === parseInt(req.params.id)) {
            if(book.stock > 1) {
                book.stock--;
            } else {
                res.status(400).send({ message: 'book plus en stock' });
                return;
            }
        }
    })
    res.send({message: 'book acheté'});
});

module.exports = router;
