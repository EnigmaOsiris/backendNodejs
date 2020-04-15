'use strict'

var validator = require('validator');
var Article = require('../models/article');
var fs = require('fs');
var path = require('path');


var controller = {

    datosCurso: (req, res) => {
        var hola = req.body.hola;
        return res.status(200).send({
            curso: "master",
            autor: "Enigma",
            url: "enigma.com",
            hola
        });
    },

    test: (req, res) => {
        return res.status(200).send({
            message: "Test controller"
        });
    },

    save: (req, res) => {
        // Recoger parametros por post
        console.log("aca");
        
        var params = req.body;

        // Validar datos (validator)
        try {
            var validate_title = !validator.isEmpty(params.title);
            var validate_content = !validator.isEmpty(params.content);

        } catch (err) {
            return res.status(200).send({
                status: 'error',
                message: 'Faltan datos por enviar !!!'
            });
        }

        if (validate_title && validate_content) {

            //Crear el objeto a guardar
            var article = new Article();

            // Asignar valores
            article.title = params.title;
            article.content = params.content;

            if (params.image) {
                article.image = params.image;
            } else {
                article.image = null;
            }

            // Guardar el articulo
            article.save((err, articleStored) => {

                if (err || !articleStored) {
                    return res.status(404).send({
                        status: 'error',
                        message: 'El articulo no se ha guardado !!!'
                    });
                }
                console.log("save ok");

                // Devolver una respuesta 
                return res.status(200).send({
                    status: 'success',
                    article: articleStored
                });

            });

        } else {
            return res.status(200).send({
                status: 'error',
                message: 'Los datos no son válidos !!!'
            });
        }

    },

    getAllArticles: (req, res) => {
        //find
        var query = Article.find();
        var last = req.params.last;
        if (last || last != undefined) {
            query.limit(5);
        }
        query.sort('-_id').exec((err, articles) => {
            if (err) {
                return res.status(500).send({
                    status: "Error",
                    message: "Error: " + err
                });
            }
            if (!articles) {
                return res.status(404).send({
                    status: "Error",
                    message: "No hay articulos "
                });
            }
            return res.status(200).send({
                status: "Success",
                articles
            });
        })
    },

    getArticle: (req, res) => {
        //obtener
        var articleId = req.params.id;
        //comprobar
        if (!articleId || articleId == null) {
            return res.status(404).send({
                status: "Error",
                message: "no existe el articulo"
            });
        }
        //buscar
        Article.findById(articleId, (err, article) => {
            if (err) {
                return res.status(500).send({
                    status: "Error",
                    message: "error al devolver datos!!"
                });
            }
            if (!article) {
                return res.status(404).send({
                    status: "Error",
                    message: "no existe el articulo!!"
                });
            }
            return res.status(200).send({
                status: "Success",
                article
            });
        });


    },

    update: (req, res) => {
        //recoger datos
        var articleId = req.params.id;
        //capturar body
        var params = req.body;
        //validar
        try {
            var validateTitle = !validator.isEmpty(params.title);
            var validateContent = !validator.isEmpty(params.content);
            if (validateTitle && validateContent) {
                //findAndUpdate
                Article.findOneAndUpdate({ _id: articleId }, params, { new: true }, (err, articleUpdate) => {
                    if (err) {
                        return res.status(500).send({
                            status: "Error",
                            message: err
                        });
                    }
                    if (!articleUpdate) {
                        return res.status(404).send({
                            status: "Error",
                            message: err
                        });
                    }
                    return res.status(200).send({
                        status: "Succes",
                        article: articleUpdate
                    });
                });
            } else {
                return res.status(404).send({
                    status: "Error",
                    message: err
                });
            }
        } catch (err) {
            return res.status(404).send({
                status: "Error",
                message: err
            });
        }
    },

    delete: (req, res) => {
        //recoger
        var articleId = req.params.id;
        Article.findOneAndDelete({ _id: articleId }, (err, articleRemove) => {
            if (err) {
                return res.status(500).send({
                    status: "Error",
                    message: err
                });
            }
            if (!articleRemove) {
                return res.status(404).send({
                    status: "Error",
                    message: "No existe el articulo"
                });
            }
            return res.status(200).send({
                status: "Succes",
                article: articleRemove
            });
        });
    },

    upload: (req, res) => {
        //recojer el fichero de la peticion
        console.log("upload");
        
        var fileName = 'imagen no subida';
        console.log("porq no entra");
        
        if (!req.files) {
            console.log("error 2");
            
            return res.status(404).send({
                status: "Error",
                message: "no se envia"
            });
        }
        console.log("entro a upload");
        
        //conseguir el nombre y la extension
        var filePath = req.files.file0.path;
        var file_split = filePath.split('\\');
        //si es linux '/'
        //nombre
        var file_name = file_split[2];
        //comprobar extension
        var extension_split = file_name.split('\.');
        var file_ext = extension_split[1];
        if (file_ext != 'png' && file_ext != 'jpg' && file_ext != 'jpeg') {
            console.log("no es imagen");

            fs.unlink(filePath, (err) => {
                return res.status(202).send({
                    status: "Error",
                    message: "extension no valida"
                });
            });
        } else {
            //si todo es valido
            console.log("aca salta el error");
            
            var articleId = req.params.id;
            console.log("aca anda!!!");
            
            if (articleId) {
                //buscar articulo y asignar imagen
                Article.findOneAndUpdate({ _id: articleId }, { image: file_name }, { new: true }, (err, articleUpdate) => {
                    if (err || !articleUpdate) {
                        return res.status(500).send({
                            status: "Error",
                            message: "Error al guardar"
                        });
                    }
                    console.log("ok");

                    return res.status(200).send({
                        status: "Sucess",
                        article: articleUpdate
                    });
                })
            } else {
                console.log("solo guarda...");
                
                return res.status(200).send({
                    status: "Sucess",
                    image: file_name
                });
            }

        }
    },

    getImage: (req, res) => {
        console.log("etre   ");
        
        var file = req.params.image;
        console.log(file);
        
        var path_file = './upload/articles/' + file;
        fs.exists(path_file, (exists) => {
            if (exists) {
                console.log("return res");
                
                return res.sendFile(path.resolve(path_file));
            } else {
                return res.status(404).send({
                    status: "Error",
                    message: "Error"
                });
            }
        });
    },

    search: (req, res) => {
        //sacar string a buscar
        var searchString = req.params.search;
        //find or
        Article.find({
            "$or": [
                { "title": { "$regex": searchString, "$options": "i" } },
                { "content": { "$regex": searchString, "$options": "i" } }
            ]
        })
            .sort([['date', 'descending']])
            .exec((err, articles) => {
                if (err || !articles || articles.length <= 0) {
                    return res.status(404).send({
                        status: "Error",
                        message: "Error"
                    });
                }
                return res.status(200).send({
                    status: "Success",
                    articles
                });
            })
    }
};

module.exports = controller;