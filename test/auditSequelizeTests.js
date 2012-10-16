var should = require ('should');
var AuditSequelize = require("./../model/entity_models/auditSequelize");
var Sequelize = require("sequelize");


describe('Testing sequlize auditing', function(){

    before(function(done){
        audSeq = new AuditSequelize('test_db', 'root', '', {logging: false},'audit_test_db', 'root', '', {logging: false});
        MySeller  = audSeq.define('MySeller', {
            name: Sequelize.STRING,
            address: Sequelize.TEXT
        });

        MyPan  = audSeq.define('MyPan', {
            name: Sequelize.STRING,
            address: Sequelize.TEXT
        });
        //add the code to cleanup the db
        done();
    })


    it('should return error if audit table is not created while sync', function(done){

        audSeq.sync().success(function(){
            MySeller.auditDaoFactory.create().success(function(){
                done();
            }).error(function(err){
                    "error on db connection".should.equal(false);
                    done();
                })


        });

    })
    it('should return error if audit entry is not created for a insert operation', function(done){
        audSeq.sync().success(function(){
            MySeller.create().success(function(mySeller){
                var id = mySeller.sequelizeDao["id"];
                MySeller.auditDaoFactory.create().success(function(){
                    MySeller.auditDaoFactory.find({where:"audit_id = "+id}).success(function(auditDao){
                        if(auditDao){
                            done();
                        }else{
                            "created id not found in audit db".should.equal(false);
                        }

                    })

                })

            }).error(function(err){
                    true.should.equal(false);
                })


        });

    })

    it('should return error if audit entry is not created for a update operation', function(done){
        audSeq.sync().success(function(){
            MySeller.create({name:"myFirstName"}).success(function(mySeller){
                var id = mySeller.sequelizeDao["id"];
                var newName = "mySecondName";
                mySeller["name"] = newName;
                mySeller.save().success(function(myNewSeller){
                    MySeller.auditDaoFactory.create().success(function(){
                        MySeller.auditDaoFactory.findAll({where:"audit_id = "+id}).success(function(auditDaos){
                            if(auditDaos.length === 2){
                                var whereString = "audit_id = "+id + " AND audit_name = '" + newName + "'";
                                MySeller.auditDaoFactory.find({where:whereString}).success(function(auditDao){
                                    auditDao["audit_name"].should.equal(newName);
                                    done();
                                });

                            }else{
                                "updation entry not found in audit db".should.equal(false);
                            }

                        })

                    })
                });
            }).error(function(err){
                    true.should.equal(false);
                })


        });

    })

    it('should return error if audit entry is not created for a delete operation', function(done){
        audSeq.sync().success(function(){
            var name =  "myDeletedName";
            MySeller.create({name:name}).success(function(mySeller){
                var id = mySeller.sequelizeDao["id"];

                mySeller.destroy().success(function(){
                    MySeller.auditDaoFactory.create().success(function(){
                        var whereString = "audit_id = "+id + " AND audit_name = '" + name + "'";
                        MySeller.auditDaoFactory.findAll({where:whereString}).success(function(auditDaos){
                            if(auditDaos.length === 2){
                                done();
                            }else{
                                "deletion entry not found in audit db".should.equal(false);
                            }

                        })

                    })
                });
            }).error(function(err){
                    true.should.equal(false);
                })


        });

    })

    it('should return error if audit entry is not created for a hasOne relationship creation', function(done){
        MySeller.hasOne(MyPan);
        audSeq.auditor.sync({force:true}).success(function(){
            audSeq.sequelize.sync({force:true}).success(function(){
                var name =  "myName";
                MySeller.create({name:name}).success(function(mySeller){
                    var sellerId = mySeller.sequelizeDao["id"];
                    MyPan.create({name:"myPanName"}).success(function(pan){
                        var panId = pan.sequelizeDao["id"];
                        mySeller.setMyPan(pan).success(function(){
                            MyPan.auditDaoFactory.findAll({where:"audit_id = "+panId + " AND audit_MySellerId = " + sellerId}).success(function (resultSet){
                                if(resultSet.length != 1){
                                    "Entry created for relationship ".should.equal(true);
                                }
                                done();
                            })
                        });
                    });
                }).error(function(err){
                        true.should.equal(false);
                    })


            });
        });

    })

    it('should return error if audit entry is not created for a hasOne relationship deletion', function(done){
        MySeller.hasOne(MyPan);
        audSeq.auditor.sync({force:true}).success(function(){
            audSeq.sequelize.sync({force:true}).success(function(){
                var name =  "myName";
                MySeller.create({name:name}).success(function(mySeller){
                    var sellerId = mySeller.sequelizeDao["id"];
                    MyPan.create({name:"myPanName"}).success(function(pan){
                        var panId = pan.sequelizeDao["id"];
                        mySeller.setMyPan(pan).success(function(){
                            mySeller.setMyPan(null).success(function(){
                                MyPan.auditDaoFactory.findAll({where:"audit_id = "+panId + " AND audit_MySellerId = " + sellerId}).success(function (resultSet){
                                    if(resultSet.length != 2){
                                        "Entry created for deletion relationship ".should.equal(true);
                                    }
                                    done();
                                })
                            })
                        });
                    });
                }).error(function(err){
                        true.should.equal(false);
                    })


            });
        });

    })

    it('should return error if audit entry is not created for a hasMany relationship creation', function(done){
        MySeller.hasMany(MyPan);
        audSeq.auditor.sync({force:true}).success(function(){
            audSeq.sequelize.sync({force:true}).success(function(){
                var name =  "myName";
                MySeller.create({name:name}).success(function(mySeller){
                    var sellerId = mySeller.sequelizeDao["id"];
                    MyPan.create({name:"myPanName"}).success(function(pan){
                        var panId = pan.sequelizeDao["id"];
                        MyPan.create({name:"myPanName2"}).success(function(pan2){
                            var panId2 = pan2.sequelizeDao["id"];
                            mySeller.setMyPans([pan,pan2]).success(function(){
                                MyPan.auditDaoFactory.findAll({where:"audit_id = "+panId + " AND audit_MySellerId = " + sellerId}).success(function (resultSet){
                                    if(resultSet.length != 1){
                                        "Entry created for relationship ".should.equal(true);
                                        done();
                                        return
                                    }
                                    MyPan.auditDaoFactory.findAll({where:"audit_id = "+panId2 + " AND audit_MySellerId = " + sellerId}).success(function (resultSet){
                                        if(resultSet.length != 1){
                                            "Entry created for relationship ".should.equal(true);
                                        }
                                        done();
                                    })
                                })
                            });
                        });
                    });
                }).error(function(err){
                        true.should.equal(false);
                    })


            });
        });

    })

    it('should return error if audit entry is not deleted for a hasMany relationship creation', function(done){
        MySeller.hasMany(MyPan);
        audSeq.auditor.sync({force:true}).success(function(){
            audSeq.sequelize.sync({force:true}).success(function(){
                var name =  "myName";
                MySeller.create({name:name}).success(function(mySeller){
                    var sellerId = mySeller.sequelizeDao["id"];
                    MyPan.create({name:"myPanName"}).success(function(pan){
                        var panId = pan.sequelizeDao["id"];
                        MyPan.create({name:"myPanName2"}).success(function(pan2){
                            var panId2 = pan2.sequelizeDao["id"];
                            mySeller.setMyPans([pan,pan2]).success(function(){
                                mySeller.setMyPans(null).success(function(){
                                    MyPan.auditDaoFactory.findAll({where:"audit_id = "+panId + " AND audit_MySellerId = " + sellerId}).success(function (resultSet){
                                        if(resultSet.length != 2){
                                            "Entry created for relationship ".should.equal(true);
                                            done();
                                            return
                                        }
                                        MyPan.auditDaoFactory.findAll({where:"audit_id = "+panId2 + " AND audit_MySellerId = " + sellerId}).success(function (resultSet){
                                            if(resultSet.length != 2){
                                                "Entry created for relationship ".should.equal(true);
                                            }
                                            done();
                                        })
                                    })
                                });
                            });
                        });
                    });
                }).error(function(err){
                        true.should.equal(false);
                    })


            });
        });

    })

    it('should return error if audit entry is not created for a Many-Many relationship creation', function(done){
        MySeller.hasMany(MyPan);
        MyPan.hasMany(MySeller);
        audSeq.auditor.sync({force:true}).success(function(){
            audSeq.sequelize.sync({force:true}).success(function(){
                var name =  "myName";
                MySeller.create({name:name}).success(function(mySeller){
                    var sellerId = mySeller.sequelizeDao["id"];
                    MyPan.create({name:"myPanName"}).success(function(pan){
                        var panId = pan.sequelizeDao["id"];
                        MyPan.create({name:"myPanName2"}).success(function(pan2){
                            var panId2 = pan2.sequelizeDao["id"];
                            mySeller.setMyPans([pan,pan2]).success(function(){
                                var connectorDao = audSeq.auditDaoFactoryWrapperes["MyPansMySellers"]
                                connectorDao.auditDaoFactory.findAll({where:"audit_MyPanId = "+panId + " AND audit_MySellerId = " + sellerId}).success(function (resultSet){
                                    if(resultSet.length != 1){
                                        "Entry created for relationship ".should.equal(true);
                                        done();
                                        return
                                    }
                                    connectorDao.auditDaoFactory.findAll({where:"audit_MyPanId = "+panId2 + " AND audit_MySellerId = " + sellerId}).success(function (resultSet){
                                        if(resultSet.length != 1){
                                            "Entry created for relationship ".should.equal(true);
                                        }
                                        done();
                                    })
                                })
                            });
                        });
                    });
                }).error(function(err){
                        true.should.equal(false);
                    })


            });
        });

    })

    it('should return error if audit entry is not created for a Many-Many relationship deletion', function(done){
        MySeller.hasMany(MyPan);
        MyPan.hasMany(MySeller);
        audSeq.auditor.sync({force:true}).success(function(){
            audSeq.sequelize.sync({force:true}).success(function(){
                var name =  "myName";
                MySeller.create({name:name}).success(function(mySeller){
                    var sellerId = mySeller.sequelizeDao["id"];
                    MyPan.create({name:"myPanName"}).success(function(pan){
                        var panId = pan.sequelizeDao["id"];
                        MyPan.create({name:"myPanName2"}).success(function(pan2){
                            var panId2 = pan2.sequelizeDao["id"];
                            mySeller.setMyPans([pan,pan2]).success(function(){
                                mySeller.setMyPans(null).success(function(){
                                    var connectorDao = audSeq.auditDaoFactoryWrapperes["MyPansMySellers"]
                                    connectorDao.auditDaoFactory.findAll({where:"audit_MyPanId = "+panId + " AND audit_MySellerId = " + sellerId}).success(function (resultSet){
                                        if(resultSet.length != 2){
                                            "Entry created for relationship ".should.equal(true);
                                            done();
                                            return
                                        }
                                        connectorDao.auditDaoFactory.findAll({where:"audit_MyPanId = "+panId2 + " AND audit_MySellerId = " + sellerId}).success(function (resultSet){
                                            if(resultSet.length != 2){
                                                "Entry created for relationship ".should.equal(true);
                                            }
                                            done();
                                        })
                                    })
                                });
                            });
                        });
                    });
                }).error(function(err){
                        true.should.equal(false);
                    })


            });
        });

    })





});

