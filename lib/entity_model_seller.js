var AuditSequelize = require("./audit_sequelize");
//var AuditSequelize = require("sequelize");
var Sequelize = require("sequelize");

//var audSeq = new AuditSequelize('test_db', 'root', '', {logging: false},'audit_db', 'root', '', {logging: false});
var audSeq = new AuditSequelize('test_db', 'root', '', {},'audit_db', 'root', '');
var Seller = exports.Seller = audSeq.define('Seller', {
    name: {type:Sequelize.STRING},
    address: {type:Sequelize.STRING}
});

var Pan = exports.Pan = audSeq.define('Pan', {
    pan_no: {type:Sequelize.STRING},
    valid_till: {type:Sequelize.STRING}
});
var Vat = exports.Vat = audSeq.define('Vat', {
    vat_no: Sequelize.STRING,
    valid_till: Sequelize.DATE
});

Seller.hasMany(Pan, {as: 'SellerPanIdax'});
Pan.hasMany(Seller, {as: 'SellerPanIda'});
Seller.hasMany(Vat);

audSeq.sync({force:true}).success(function(){

    Seller.create({
        name: "aaa",
        address: "aa"
    }).success(function(seller){
            var p = Pan.create({pan_no:"1",valid_till:"21-11-1021"}).success(function(p){
                seller.setSellerPanIdax([p]).success(function(x){
                    seller.setSellerPanIdax(null);
                })
            });
//            var p = Pan.build({pan_no:"1",valid_till:"21-11-1021"});
//            seller.setSellerPanIdax([p]).success(function(x){
//                //seller.setSellerPanIdax(null);
//            })
        });

});



