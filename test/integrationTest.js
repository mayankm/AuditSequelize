var AuditSequelize = require("../lib/audit_sequelize");
var Sequelize = require("sequelize");

emitter = {}
emitter.emit = function(){}

audSeq = new AuditSequelize('test_db', 'root', '', {logging:false},'audit_test_db', 'root', '', {logging:false});

MySeller  = audSeq.define('MySeller', {
    name: Sequelize.STRING,
    address: Sequelize.TEXT
});

MyPan  = audSeq.define('MyPan', {
    name: Sequelize.STRING,
    address: Sequelize.TEXT
});


MySeller.hasOne(MyPan);

audSeq.sync({force:true}).success(function(){
    var name =  "myName";
    audSeq.auditor.sync({force:true}).success(function(){
        audSeq.sequelize.sync({force:true}).success(function(){
            var name =  "myName";
            MySeller.create({name:name}).success(function(mySeller){
                var sellerId = mySeller.sequelizeDao["id"];
                MyPan.create({name:"myPanName"}).success(function(pan){
                    var panId = pan.sequelizeDao["id"];
                    mySeller.setMyPan(pan).success(function(){
                        MyPan.auditDaoFactory.findAll({where:"audit_id = "+panId + " AND audit_MySellerId = " + sellerId}).success(function (resultSet){
                            console.log(resultSet)
                        })
                    });
                });
            }).error(function(err){
                })


        });
    });
});
