'use strict'

var validator = require('validator');
var Article = require('../models/article');
var fs =require('fs');
var path = require('path');

var controller = {
    
    datosCurso:(req,res) => {
        var hola = req.body.hola;

        return res.status(200).send({
            curso:'curso frameworks',
            autor:'udemy',
            url:"udemy.com"
        });

    },

    test:(req,res)=>{
        return res.status(200).send({
            message:'controller article test is ok'    
        });

    },

    save:(req,res)=>{
        //recojer parametros por post
        var params = req.body;

        //validar datos
        try {
            var validate_title = !validator.isEmpty(params.title);
            var validate_content = !validator.isEmpty(params.content);
        } catch (error) {
            return res.status(200).send({
                status:'error',
                message:'faltan datos' 
            });
        }
        if (validate_title&&validate_content) {
             //crear objeto a guardar
            var article = new Article();
            //asignar valores
            article.title = params.title;
            article.content = params.content;
            article.image=null;
            //guardar articulo
            article.save((err,articleStored) => {
                if (err||!articleStored) {
                    return res.status(404).send({
                        status:'error',
                        message:'El articulo no se guardo'
                    });
                    
                } else {
                    //devolver respuesta
                    return res.status(200).send({
                        status:'success',
                        article:articleStored  
                    });
                }
            });
            
            
        }else{
            return res.status(200).send({
                status:'error',
                message:'los datos no son validos' 
            });

        }

    },

    getArticles: (req,res) => {
        var query = Article.find({});

        var last =req.params.last;
        if (last||last!=undefined) {
            query.limit(10);
        }
        //find
        query.sort('-_id').exec((err,articles) => {
            if (err||!articles) {
                return res.status(500).send({
                    status:'error',
                    message:'Error en articulos'
                });
                
            }
            

            return res.status(200).send({
                status:'success',
                articles
            });
            
        });
    }, 

    getArticle:(req,res) => {
        //recoger id url
        var articleId = req.params.id;
        //comprobar q existe
        if (!articleId||articleId==null) {
            return res.status(404).send({
                status:'error',
                message:'not found'
            });
            
        } 
        //buscar
        Article.findById(articleId,(err,article) => {
            //comprobar            
            if (err||!article) {
                return res.status(500).send({
                    status:'error',
                    message:'error'
                }); 
            }

            //devolverlo
            return res.status(500).send({
                status:'success',
                article
            }); 
        });

        
    },

    updateArticle: (req,res) =>{
        //recojer id article por url
        var articleId=req.params.id;
        //recojer datos
        var params = req.body;

        //validar datos
        try {
            var validate_title=!validator.isEmpty(params.title);
            var validate_content=!validator.isEmpty(params.content);
            
        } catch (error) {
            return res.status(404).send({
                status:'error',
                message:'Faltan datos por enviar'
            });
        }
        if (validate_title&&validate_content) {
            //hacer find and update   
            Article.findAndUpdate({_id: articleId},params,{new:true},(err,articleUpdated)=>{
                
                if(err||!articleUpdated) {
                    return res.status(404).send({
                        status:'error',
                        message:'not found'
                    });
                }
                return res.status(200).send({
                    status:'success',
                    article:articleUpdated
                });
            });
        } else {
            return res.status(200).send({
                status:'error',
                message:'validar datos'
            });            
        } 
    },

    deleteArticle: (req,res) => {
        //recojer id
        var articleId = req.params.id;

        //find and delete
        Article.findOneAndDelete({_id:articleId},(err,articleRemoved)=>{
            if (err) {
                return res.status(500).send({
                    status:'error',
                    message:'error al borrar'
                });
                
            }
            if (!articleRemoved) {
                return res.status(404).send({
                    status:'error',
                    message:'not found'
                });
                
            }
            
            return res.status(200).send({
                status:'success',
                article:articleRemoved
            });
                            
        });
    },

    uploadImage:(req,res) => {
        //recojer el fichero de la peticion
        var file_name = 'imagen not load';
        if (!req.files) {
            return res.status(404).send({
                status:'error',
                message:'not found'
            });
            
        }
        //conseguir nombre y extencion
        var file_path = req.files.file0.path;

        //cuando es windows
        var file_split = file_path.split('//');
        //WARNIG cuando es servidor linux
        //var file_split = file_path.split('\');
        
        //nombre
        file_name = file_split[2];
        //extension
        var extension_split = file_name.split('\.');
        var file_ext = extension_split[1];

        //comprobar la extencion
        if (file_ext != 'png' && file_ext != 'jpeg' && file_ext != 'jpg' && file_ext != 'gif' ) {
            //borrar
            fs.unlink(file_path,(err)=>{
                return res.status(400).send({
                    status:'error',
                    message:'extension no valida'
                });
            })
        }
        else{
            var articleId= req.params.id;
            //buscar articulo y guardar
            Article.findOneAndUpdate({_id:articleId},{image:file_name},{new:true},(err,articleUpdated)=>{
                if (err||!articleUpdated) {
                    return res.status(200).send({
                        status:'error',
                        message:'error no se encontro'
                    });
                }
                return res.status(200).send({
                    status:'success',
                    article:articleUpdated
                });
            });
        }  
    },
    getImage:(req,res)=>{
        var file=req.params.image;
        var path_file='./upload/articles/'+file;
        fs.exists(path_file,(exists)=>{
            if (exists) {
                return res.sendFile(path.Resolve(path_file));
            } else {
                return res.status(404).send({
                    status:'error',
                    message:'not found'
                });
            }
        })
        
    },
    search:(req,res)=>{
        //sacar el string a buscar
        var searchString=req.params.search;

        //find or
        Article.find({"$or":[
            { "title":{"$regex":searchString,"options":"i"}},
            { "content":{"$regex":searchString,"options":"i"}}
        ]}).sort([['date','descending']]).exec((err,articles)=>{
            if (err) {
                return res.status(400).send({
                    status:'error',
                    message:'error'
                });    
            }
            if (!articles||articles.lenght<=0) {
                return res.status(404).send({
                    status:'not found',
                    message:'No existen articulos'
                });    
            }
            return res.status(200).send({
                status:'success',
                articles
            });
        })
        
    }

};


module.exports = controller;