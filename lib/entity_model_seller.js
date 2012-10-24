var AuditSequelize = require("./audit_sequelize");
//var AuditSequelize = require("sequelize");
var Sequelize = require("sequelize");
var sequelize = new Sequelize( "test_db","root", "");
//var audSeq = new AuditSequelize('test_db', 'root', '', {logging: false},'audit_db', 'root', '', {logging: false});
var audSeq = new AuditSequelize('test_db', 'root', '', {},'audit_db', 'root', '');
var Seller = exports.Seller = audSeq.define('Seller', {
    name: {type:Sequelize.STRING},
    address: {type:Sequelize.STRING}
});

ExternalSystemLog = exports.ExternalSystemLog = sequelize.define('ExternalSystemLog',{
    sellerId:{type:Sequelize.STRING},
    eventType:{type:Sequelize.STRING},
    actionType:{type:Sequelize.STRING},
    actionBy:{type:Sequelize.STRING},
    actionById:{type:Sequelize.STRING},
    eventTypeAction:{type:Sequelize.TEXT},
    eventTypeActionResponse:{type:Sequelize.TEXT},
    timestamp:{type:Sequelize.STRING}
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

// audSeq.sync().success(function(){

    
// });

// sequelize.sync().success(function(){
    
// })



