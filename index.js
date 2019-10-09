'use strict'

var mongoose = require('mongoose');
var app = require('./app');
var port = 3900;

mongoose.set('useFindAndModify',false); //usa mongo actual
mongoose.Promise=global.Promise; 

mongoose.connect('mongodb://localhost:27017/api_rest_blog',{useNewUrlParser:true})
    .then(()=>{
        console.log('connect success');        

        //crear servidor y escuchar peticiones HTTP

        app.listen(port,()=>{
            console.log('run server http://localhost:'+port);
            
        });

    });