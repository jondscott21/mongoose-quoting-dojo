// Require the Express Module
const express = require('express');
const app = express();
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/quoting-dojo');
let QuoteSchema = new mongoose.Schema({
    name: {
        type: String,
        required : [true, 'Please select a name'],

    },
    quote: {
        type: String,
        required: [true, 'Please enter a quote']
    },
    created_at:{
        type: Date, default: Date.now,
    },
    liked: [{type: mongoose.Schema.Types.ObjectId, ref: 'Like'}]
});
let LikeSchema = new mongoose.Schema({
    _quote: {
      type: mongoose.Schema.Types.ObjectId, ref: 'Quote'
    },
    likes: {
        type: Number, default: 0,
    }
});
mongoose.model('Quote', QuoteSchema);
mongoose.model('Like', LikeSchema);
let Quote = mongoose.model('Quote');
let Like = mongoose.model('Like');
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
const path = require('path');
app.use(express.static(path.join(__dirname, './static')));
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');
mongoose.Promise = global.Promise;
app.get('/', function (req, res) {
    res.render('index')
});
app.post('/add_quote', function (req, res) {
    let quote = new Quote({name: req.body.name, quote: req.body.quote});
    quote.save(function (err) {
        if (!err) {
            let like = new Like({_quote: quote._id});
            quote.liked.push(like);
            like.save(function (err) {
                if (!err) {
                    quote.save(function (err) {
                        if (!err){
                            console.log('added quote');
                            res.redirect('/quotes');
                        }
                    });
                }


            });

        }
        else {
            console.log('quote failed');
            res.render('index', {errors: quote.errors});
        }
    });

});
app.get('/quotes', function (req, res) {
    Quote.find({}).populate('liked').exec( function (err, quotes) {
        if (!err) {
            console.log('show quotes');
            res.render('quotes', {quotes: quotes});
        }
        else {
            console.log("don't show quotes");
            res.render('quotes', {quotes: false});
        }
    });
});
app.post('/like/:id', function (req, res) {
    console.log('got to likes');
    console.log(req.params.id);
    Like.findOneAndUpdate({_quote: req.params.id}, {$inc:{likes: 1}}, function (err, result) {
        // console.log(result.liked[0].likes);
        if (!err) {
            // console.log(likes);
            res.redirect('/quotes');
        }
        else {
            console('like error');
            res.redirect('/quotes');
        }
    })

});
app.listen(7000, function() {
    console.log("listening on port 7000");
});
