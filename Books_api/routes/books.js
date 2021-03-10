var express = require('express');
var router = express.Router();
var zmq = require("zeromq"),
  sock = zmq.socket("pull"),
  sockPush = zmq.socket("push");

sock.connect("tcp://127.0.0.1:8000");
sockPush.bindSync("tcp://127.0.0.1:8001");
let books = [];

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
    res.send(books);
});

router.post('/', function(req, res, next) {
    let book = {};
    book.id = books.length;
    book.titre = req.body.titre;
    book.auteur = req.body.auteur;
    book.stock = 10;
    books.push(book);
    res.send({message: 'book créé'});
});

router.get('/:id', function(req, res, next) {
    let book = null;
    books.forEach(l => {
        if(l.id === parseInt(req.params.id)) {
            book = l;
        }
    })
    if(book !== null) {
        res.send(book)
    } else {
        res.status(404).send({error: 'book introuvable'});
    }
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
