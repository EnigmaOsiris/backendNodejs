'use strict'

var express = require('express');
var ArticleController = require('../controllers/article');

var router = express.Router();
var multipart = require ('connect-multiparty');
var md_upload = multipart({uploadDir:'./upload/articles'});

//rutas prueba
router.post('datosCurso',ArticleController.datosCurso);
router.get('/test',ArticleController.test);
//util routes
router.post('/save', ArticleController.save);
router.post('/upload_imagen/:id?',md_upload,ArticleController.upload);
//get
router.get('/articles/:last?',ArticleController.getAllArticles);
router.get('/article/:id',ArticleController.getArticle);
router.get('/get_image/:image',ArticleController.getImage);
router.get('/search/:search',ArticleController.search);

//put
router.put('/article/:id',ArticleController.getArticle);

//delete
router.delete('/delete/:id',ArticleController.delete);
module.exports= router;
