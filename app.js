'use strict'

//cargar modulos de nodejs
var express = require('express');
var bodyParser = require('body-parser');

//ejecutar express(http)
var app = express();

//cargar ficheros rutas
var article_routes = require('./routes/article');

//middlewares
app.use (bodyParser.urlencoded({extended:false}));
app.use (bodyParser.json());
//CORS

//a;adir prefijos a rutas/ load routes
app.use('/api', article_routes);


//exportar modulo
module.exports = app;
