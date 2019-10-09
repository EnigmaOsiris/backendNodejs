'use strict'

var express = require('express');
var ArticleController = require('../controllers/article');

var router = express.Router();

//cargar archivos
var multipart = require('connect-multiparty');
var md_upload = multipart({uploadDir: './upload/articles'});


router.post('/datos-curso',ArticleController.datosCurso);
router.get('/test-controller',ArticleController.test);

//routes for articles
//post
router.post('/save',ArticleController.save);
router.post('/upload-image/:id',md_upload,ArticleController.uploadImage);

//gets
router.get('/article/:id',ArticleController.getArticle);
router.get('/articles/:last?',ArticleController.getArticles);
router.get('/get-image/:image',ArticleController.getImage);
router.get('/search/:search',ArticleController.search);

//puts
router.put('/article/:id',ArticleController.updateArticle);

//delete
router.delete('/article/:id',ArticleController.deleteArticle);

module.exports = router;