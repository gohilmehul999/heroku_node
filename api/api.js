const reg = require('../module/register');
const upload = require('../middleware_multer/multer');
const fs = require('fs');
var jwt = require('jsonwebtoken');
var secret = 'harrypotter';


module.exports = function (router) {
    // regstration api

    router.get('/', (req, res) => {
        res.send('hello')
    })

    // router.get("/", function (req, res) {
    //     reg.find({}, function (err, data) {
    //         res.send(data);
    //     })
    // })

    // router.get("/:id", function (req, res) {
    //     reg.findById(req.params.id, function (err, doc) {
    //         res.send(doc);
    //     });
    // })

    router.post('/saveData', upload, (req, res) => {
        const register = new reg();
        register.name = req.body.name;
        register.email = req.body.email;
        register.password = req.body.password;
        register.mobile = req.body.mobile;
        if (req.file) {
            register.file = req.file.filename;
            register.file_path = 'http://localhost:3000/' + req.file.filename;
        }
        if (req.body.name == null || req.body.name == "" || req.body.password == null || req.body.password == "" ||
            req.body.email == null || req.body.email == "" || req.body.mobile == null || req.body.mobile == "" || req.body.file == "") {
            res.json({ success: false, message: 'Ensure name, mobile, password, file and email were provided' });
        }
        else {
            register.save(
                function (err) {
                    if (err) {
                        if (err.errors != null) {
                            if (err.errors.name) {
                                res.status(401).json({ success: false, message: 'Required minimum digits 3 of First Name' });
                            } else if (err.errors.mobile) {
                                res.status(401).json({ success: false, message: 'Required mobile number 10 digits' });
                            } else if (err.errors.email) {
                                res.status(401).json({ success: false, message: 'pls enter valid email address' });
                            } else if (err.errors.password) {
                                res.status(401).json({ success: false, message: 'use strong password' });
                            }
                        } else {
                            res.status(400).json({ success: false, message: 'err' });
                        }
                    } else {
                        res.status(200).json({ success: true, message: 'Successfully Registered !' });
                    }
                }
            )

        }
    });

    router.delete('/saveData/:id', (req, res) => {
        reg.findByIdAndRemove({ _id: req.params.id }, function (err, data) {
            if (err) throw err;
            if (!data) {
                console.log('information not found');
            }
            fs.unlinkSync(`./image_upload/${data.file}`);
            res.status(200).json({success:true,message:'deleted'});
        })
    })

    router.put('/saveData/:id', upload, (req, res) => {
        reg.findOne({ _id: req.params.id }, function (err, data) {
            if (err) throw err;
            if (!data) {
                res.status(200).json({ success: false, message: 'No user found' });
            }
            else if (!req.file) {
                data.name = req.body.name;
                data.email = req.body.email;
                data.password = req.body.password;
                data.mobile = req.body.mobile;
                data.save(
                    function (err) {
                        if (err) {
                            if (err.errors != null) {
                                if (err.errors.name) {
                                    res.status(401).json({ success: false, message: 'Required minimum digits 3 of First Name' });
                                } else if (err.errors.mobile) {
                                    res.status(401).json({ success: false, message: 'Required mobile number 10 digits' });
                                } else if (err.errors.email) {
                                    res.status(401).json({ success: false, message: 'pls enter valid email address' });
                                } else if (err.errors.password) {
                                    res.status(401).json({ success: false, message: 'use strong password' });
                                }
                            } else {
                                res.status(400).json({ success: false, message: 'err' });
                            }
                        } else {
                            res.status(200).json({ success: true, message: 'Successfully Registered !' });
                        }
                    }
                );

            }
            else {
                fs.unlinkSync(`./image_upload/${data.file}`);
                console.log(data.file);
                data.name = req.body.name;
                data.email = req.body.email;
                data.password = req.body.password;
                data.mobile = req.body.mobile;
                data.file = req.file.filename;
                data.file_path = 'http://localhost:8080/' + req.file.filename;
                console.log(data.file);
                console.log(data.file_path);
                data.save(function (err) {
                    if (err) {
                        if (err.errors != null) {
                            if (err.errors.name) {
                                res.status(401).json({ success: false, message: 'Required minimum digits 3 of First Name' });
                            } else if (err.errors.mobile) {
                                res.status(401).json({ success: false, message: 'Required mobile number 10 digits' });
                            } else if (err.errors.email) {
                                res.status(401).json({ success: false, message: 'pls enter valid email address' });
                            } else if (err.errors.password) {
                                res.status(401).json({ success: false, message: 'use strong password' });
                            }
                        } else {
                            res.status(400).json({ success: false, message: 'err' });
                        }
                    } else {
                        res.status(200).json({ success: true, message: 'Successfully Registered !' });
                    }
                });

            }

        })
    })


    // login api
    router.post('/login', (req, res) => {
        console.log(req.body);
        reg.findOne({ email: req.body.email }).select('email password').exec(function (err, user) {
            if (err) throw err;
            else {
                // console.log('this is user data:',user);
                if (!user) {
                    res.json({ status:401, success: false, message: 'The email address and password combination was wrong during login. !!!' });
                } else if (user) {
                    if (!req.body.password) {
                        res.json({ status:401, success: false, message: 'No password provided' });
                    } else {
                        var validPassword = user.comparePassword(req.body.password);
                        if (!validPassword) {   
                            res.json({ status:400, success: false, message: 'Could not authenticate password' });
                        } else {
                            // res.send(user);
                            var token = jwt.sign({ email: user.email, id: user._id }, secret, { expiresIn: '24h' });
                            res.json({ status:200, success: true, message: 'User authenticated!', token: token });
                        }
                    }
                }
            }
        });
    })

    router.use(function (req, res, next) {

        var token = req.body.token || req.body.query || req.headers['x-access-token'];
        if (token) {
            jwt.verify(token, secret, function (err, decoded) {
                if (err) {
                    res.status(401).json({ success: false, message: 'Token invalid' });
                } else {
                    console.log("ufghfgh", decoded);
                    req.decoded = decoded;

                    next();
                }
            });
        } else {
            res.status(401).json({ success: false, message: 'No token provided' });
        }
    });


    router.get("/", function (req, res) {
        reg.find({}, function (err, doc) {
            // console.log("jhgj", err)
            // res.send(doc);
        });
    })

    router.get("/myprofile", function (req, res) {
        reg.findById({ _id: req.decoded.id }, function (err, data) {
            if (err) throw err;
            if (!data) {
                res.status(404).json({ success: false, message: 'User not found' });
            }
            else {
                res.status(200).json({ success: true, user: data });
            }
        })
    })

    router.put("/myprofile", upload, function (req, res) {
        console.log(req.body);
        reg.findOne({ _id: req.decoded.id }, function (err, data) {
            console.log(data);
            if (err) throw err;
            if (!data) {
                res.json({ success: false, message: "not found" })
            } else if (!req.file) {
                console.log(req.body);
                data.name = req.body.name,
                    data.email = req.body.email,
                    data.password = req.body.password,
                    data.mobile = req.body.mobile
                data.save(function (err) {
                    if (err) {
                        if (err.errors != null) {
                            if (err.errors.name) {
                                res.json({ success: false, message: 'Required minimum digits 3 of First Name' });
                            } else if (err.errors.mobile) {
                                res.json({ success: false, message: 'Required mobile number 10 digits' });
                            } else if (err.errors.email) {
                                res.json({ success: false, message: 'pls enter valid email address' });
                            } else if (err.errors.password) {
                                res.json({ success: false, message: 'use strong password' });
                            }
                        } else {
                            res.json({ success: false, message: 'err' });
                        }
                    } else {
                        res.json({ success: true, message: 'updated' })
                    }
                })
            }
            else {
                console.log(req.body)
                data.name = req.body.name,
                    data.email = req.body.email,
                    data.password = req.body.password,
                    data.mobile = req.body.mobile
                data.file = req.file.filename,
                    data.file_path = 'http://localhost:8080/' + req.file.filename,
                    data.save(function (err) {
                        if (err) {
                            if (err.errors != null) {
                                if (err.errors.name) {
                                    res.json({ success: false, message: 'Required minimum digits 3 of Name' });
                                } else if (err.errors.mobile) {
                                    res.json({ success: false, message: 'Required mobile number 10 digits' });
                                } else if (err.errors.email) {
                                    res.json({ success: false, message: 'pls enter valid email address' });
                                } else if (err.errors.password) {
                                    res.json({ success: false, message: 'use strong password' });
                                }
                            } else {
                                res.json({ success: false, message: 'err' })
                            }
                        }
                        else {
                            res.json({ success: true, message: 'updated' })
                        }
                    })
            }
        })
    })

    router.delete('/myprofile', (req, res) => {
        reg.findByIdAndRemove({ _id: req.decoded.id }, function (err, data) {
            if (err) throw err;
            if (!data) {
                res.status(404).json({ success: false, message: 'No user found' });
            }
            fs.unlinkSync(`./image_upload/${data.file}`);
            res.status(200).json({ success: true, message: 'Your Account has been delete now !!!' });
        })
    })

    return router;
}