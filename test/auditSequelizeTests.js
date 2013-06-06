var should = require ('should');
var AuditSequelize = require("../lib/audit_sequelize");
var Sequelize = require("sequelize");

emitter = {}
emitter.emit = function(){

}

audSeq = new AuditSequelize('test_db', 'root', '', {logging:false},'audit_test_db', 'root', '', {logging: false, "timeNotificationCallBack": function(){}});
MySeller  = audSeq.define('MySeller', {
    name: Sequelize.STRING,
    address: Sequelize.TEXT
});

MyPan  = audSeq.define('MyPan', {
    name: Sequelize.STRING,
    address: Sequelize.TEXT
});


//./node_modules/mocha/bin/_mocha  /Users/mayank/sellerPlatform/auditSequelize/test/auditSequelizeTests.js  --reporter list --globals hasCert --ignore-leaks


describe('Testing sequelize auditing', function(){

    before(function(done){
        done();
    })

    it('should return error if audit table is not created while sync', function(done){
        audSeq.sync(); //TO test the concurrency and call without success
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

    it('should return error if selected attribute is not found', function(done){
        audSeq.sync().success(function(){
            var name = "my_name";
            var address = "myAddress";
            MySeller.create({name:name, address:address}).success(function(mySeller){
                var id = mySeller.sequelizeDao["id"];
                MySeller.auditDaoFactory.create().success(function(){
                    MySeller.find({where:"id = "+id
                        ,attributes:[['CONCAT_WS(",",name,address)', 'concatenated_name_address']]
                    }).success(function(seller){
                        if(seller){
                            seller.concatenated_name_address.should.equal(name+","+address);
                            done();
                        }else{
                            "created id not found in db".should.equal(false);
                        }

                    })

                })

            }).error(function(err){
                    true.should.equal(false);
                })


        });

    })



    it('should return error if created entry is not found', function(done){
        audSeq.sync().success(function(){
            MySeller.create({name:"my_name"}).success(function(mySeller){
                var id = mySeller.sequelizeDao["id"];
                MySeller.auditDaoFactory.create().success(function(){
                    MySeller.find({where:"id = "+id}).success(function(seller){
                        if(seller){
                            done();
                        }else{
                            "created id not found in db".should.equal(false);
                        }

                    })

                })

            }).error(function(err){
                    true.should.equal(false);
                })


        });

    })

    it('should return error if created entries are not found', function(done){
        audSeq.sync().success(function(){
            MySeller.create().success(function(mySeller){
                var id = mySeller.sequelizeDao["id"];
                MySeller.auditDaoFactory.create().success(function(){
                    MySeller.findAll({where:"id = "+id}).success(function(sellers){
                        if(sellers && sellers.length ==1){
                            done();
                        }else{
                            "created id not found in db".should.equal(false);
                        }

                    })

                })

            }).error(function(err){
                    true.should.equal(false);
                })


        });

    })

    it('should return error if audit entry is not created for a updateAttribute operation', function(done){
        audSeq.sync().success(function(){
            MySeller.create({name:"myFirstName"}).success(function(mySeller){
                var id = mySeller.sequelizeDao["id"];
                var newName = "mySecondName";
                //                mySeller["name"] = newName;
                mySeller.updateAttributes({name:newName}, {actionBy:"sellerSupport", "ipAddress":"127.0.0.1"}).success(function(myNewSeller){
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

    it('should return error if audit entry is not created for a updateAttribute operation without options', function(done){
        audSeq.sync().success(function(){
            MySeller.create({name:"myFirstName"}).success(function(mySeller){
                var id = mySeller.sequelizeDao["id"];
                var newName = "mySecondName";
                //                mySeller["name"] = newName;
                mySeller.updateAttributes({name:newName}).success(function(myNewSeller){
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

    it('should return error if audit entry is not created for a updateAttribute operation without actionBy', function(done){
        audSeq.sync().success(function(){
            MySeller.create({name:"myFirstName"}).success(function(mySeller){
                var id = mySeller.sequelizeDao["id"];
                var newName = "mySecondName";
                //                mySeller["name"] = newName;
                mySeller.updateAttributes({name:newName}, { "ipAddress":"127.0.0.1"}).success(function(myNewSeller){
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

    it('should return error if audit entry is not created for a updateAttribute operation without ip', function(done){
        audSeq.sync().success(function(){
            MySeller.create({name:"myFirstName"}).success(function(mySeller){
                var id = mySeller.sequelizeDao["id"];
                var newName = "mySecondName";
                //                mySeller["name"] = newName;
                mySeller.updateAttributes({name:newName}, { actionBy:"sellerSupport"}).success(function(myNewSeller){
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

    it('should return error if audit entry is not created for a update operation', function(done){
        audSeq.sync().success(function(){
            MySeller.create({name:"myFirstName"}).success(function(mySeller){
                var id = mySeller.sequelizeDao["id"];
                var newName = "mySecondName";
                mySeller["name"] = newName;
                mySeller.save(null, {actionBy:"sellerSupport", "ipAddress":"127.0.0.1"}).success(function(myNewSeller){
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

                mySeller.destroy({actionBy:"sellerSupport", "ipAddress":"127.0.0.1"}).success(function(){
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

    it('should return error if audit entry is not created for a delete operation without actionBy', function(done){
        audSeq.sync().success(function(){
            var name =  "myDeletedName";
            MySeller.create({name:name}).success(function(mySeller){
                var id = mySeller.sequelizeDao["id"];

                mySeller.destroy({ "ipAddress":"127.0.0.1"}).success(function(){
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

    it('should return error if audit entry is not created for a delete operation without ipAddress', function(done){
        audSeq.sync().success(function(){
            var name =  "myDeletedName";
            MySeller.create({name:name}).success(function(mySeller){
                var id = mySeller.sequelizeDao["id"];

                mySeller.destroy({actionBy:"sellerSupport"}).success(function(){
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
                                        mySeller.getMyPans().success(function(pans){
//                                            console.log(pans);
                                            if(!pans || pans.length == 0){
                                                "Pans should not be null".should.equal(true);
                                            }
                                            done();
                                        }).error(function(err){
                                                if(err){
                                                    "Error while getting the pans for a seller".should.equal(false);
                                                }
                                                done();
                                            })
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

describe('Testing if test db does not exists', function(){

    before(function(done){
        noSeqDb = new AuditSequelize('no_db_exists_do_not_create_it', 'root', '', {logging:false},'audit_test_db', 'root', '', {logging: false, "timeNotificationCallBack": function(){}});
        MySellerWithoutDb  = noSeqDb.define('MySeller', {
            name: Sequelize.STRING,
            address: Sequelize.TEXT
        });
        MyPanWithoutDb  = noSeqDb.define('MyPan', {
            name: Sequelize.STRING,
            address: Sequelize.TEXT
        });
        //add the code to cleanup the db
        done();
    })

    it('should return error on sync if no db', function(done){
        noSeqDb.sync(); //TO test the concurrency and call without success or error
        noSeqDb.sync().success(function(){
            "No sync operation should succeed without db".should.equal(true);
            done();
        }).error(function(err){
                if(err == null){
                    "Error should not be null".should.equal(true);
                }
                done();
            });
    })

});

describe('Testing cases when sequelize query fails', function(){

    before(function(done){

        audSeq.sync().success(function(){
            NoSeller  = audSeq.define('NoSeller', {
                name: Sequelize.STRING,
                address: Sequelize.TEXT
            });
            done();
        }).error(function(err){
                "error on db connection".should.equal(false);
                done();
            })
    });

    it('should return error on insertion if table does not exists', function(done){
        function insertInNoTable() {
            NoSeller.create().success(
                function() {
                    "No success should be called if no table exists".should.equal(true);
                    done();
                }).error(function(error) {
                    if (error == null) {
                        error.should.equal(false);
                    }
                    done();

                });
        }
        NoSeller.sequelizeDaoFactory.drop().success(insertInNoTable).error(insertInNoTable);
    })

    it('should return error on find all if table does not exists', function(done){
        function findAllInNoSeller() {
            NoSeller.findAll().success(
                function() {
                    "No success should be called if no table exists".should.equal(true);
                    done();
                }).error(function(error) {
                    if (error == null) {
                        error.should.equal(false);
                    }
                    done();

                });
        }
        NoSeller.sequelizeDaoFactory.drop().success(findAllInNoSeller).error(findAllInNoSeller);
    })

    it('should return error on find if table does not exists', function(done){
        function findAllInNoSeller() {
            NoSeller.find({where:{id:"1"}}).success(
                function() {
                    "No success should be called if no table exists".should.equal(true);
                    done();
                }).error(function(error) {
                    if (error == null) {
                        error.should.equal(false);
                    }
                    done();

                });
        }
        NoSeller.sequelizeDaoFactory.drop().success(findAllInNoSeller).error(findAllInNoSeller);
    })


    it('Should return error on find if table does not exists', function(done){
        function outputShouldBeNull(output){
            if(output)
                output.should.equal(false);
            if(output == false)
                output.should.equal(true)
            done();
        }
        function errorShouldBeNull(err){
            outputShouldBeNull(err);
        }
        function shouldNotBeCalled(){
            "This should not be called".should.equal(true);
            done();
        }
        function destroySeller(seller){
            seller.destroy().success(shouldNotBeCalled).error(function(error){
                if(error == null){
                    "No table exists should equal true".should.equal(true);
                }
                done();
            })
        }
        function dropAndDestroySeller(seller){
            NoSeller.sequelizeDaoFactory.drop().success(function(){destroySeller(seller)}).error(errorShouldBeNull);
        };
        audSeq.sync().success(function(){
            NoSeller.create().success(dropAndDestroySeller).error(errorShouldBeNull)
        }).error(errorShouldBeNull)

    })

})

describe('Testing if audit db does not exists', function(){

    before(function(done){
        noAudSeqDb = new AuditSequelize('test_db', 'root', '', {logging:false},'no_audit_db_exists_do_not_create_it', 'root', '', {logging: false, "timeNotificationCallBack": function(){}});
        MySellerWithoutADb  = noAudSeqDb.define('MySeller', {
            name: Sequelize.STRING,
            address: Sequelize.TEXT
        });
        MyPanWithoutADb  = noAudSeqDb.define('MyPan', {
            name: Sequelize.STRING,
            address: Sequelize.TEXT
        });
//        noAudSeqDb.sync(); //TO test the concurrency and call without success or error
        noAudSeqDb.sync().success(function(){
            "No sync operation should succeed without audit db".should.equal(true);
            done();
        }).error(function(err){
                if(err == null){
                    "Error should not be null".should.equal(true);
                }
                done();
            });

    })

    it('should not return error on insertion if no audit db', function(done){

        MySellerWithoutADb.create().success(function(){
            done();
        }).error(function(error){
                if(error != null){
                    "Error should be null".should.equal(true);
                }
                done();
            });
    })
});


