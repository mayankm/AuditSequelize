var Sequelize = require("sequelize");
var auditDaoFactoryWrapper = require("./dao_factory_wrapper");
var callBacks = require("./audit_call_backs");
var utils = require("./utils");
var configuration = require("./configuration");


module.exports = (function(){

    var auditSequelize = function(database, username, password, options, auditDatabase, auditUsername, auditPassword, auditOptions){

        this.auditor = new Sequelize(auditDatabase, auditUsername, auditPassword, auditOptions);
        this.sequelize = new Sequelize(database, username, password, options);
        this.auditDaoFactoryWrapperes = {};
        this.options = auditOptions;
    }

    auditSequelize.prototype.sync = function(){

        var syncCallBacks = new callBacks();
        var auditor = this.auditor;
        this.sequelize.sync().success(function(){
            auditor.sync().success(function(){
                if(syncCallBacks.successCallBack)
                    syncCallBacks.successCallBack();
            }).error(function(err){
                 console.log("Not able to sync the audit db because of following error : " + err); //TODO use logger method
                });

        }).error(function(err){
                if(syncCallBacks.errorCallBack)
                    syncCallBacks.errorCallBack(err);
            });
        return syncCallBacks;
    }

    auditSequelize.prototype.define = function(daoFactoryName, daoFactoryAttributes, options, auditOption){

        var sequelizeDaoFactory=this.sequelize.define(daoFactoryName, daoFactoryAttributes, options);
        return this.getAuditDaoFactoryWrapper(sequelizeDaoFactory, auditOption);
    }

    //TODO should not be exposed
    auditSequelize.prototype.defineAuditDaoFactory = function defineAuditDaoFactory(sequelizeDaoFactory, auditOption) {

        var sequelizeDaoFactoryAttributes = sequelizeDaoFactory.rawAttributes;
        var auditDaoFactoryAttributes = utils.generateAuditDaoFactoryAttributes(sequelizeDaoFactoryAttributes);
        var auditDaoFactory = this.auditor.define(utils.getAuditDaoFactoryName(sequelizeDaoFactory.name), auditDaoFactoryAttributes, auditOption);
        return auditDaoFactory;
    }

    //TODO should not be exposed
    auditSequelize.prototype.getAuditDaoFactoryWrapper = function(sequelizeDaoFactory, auditOption) {

        var daoFactoryName = sequelizeDaoFactory.name;
        var existingAuditDaoFactoryWrapper = this.auditDaoFactoryWrapperes[daoFactoryName];
        if(existingAuditDaoFactoryWrapper){
            return existingAuditDaoFactoryWrapper;
        }
        var auditDaoFactory = this.defineAuditDaoFactory(sequelizeDaoFactory, auditOption);
        var newAuditDaoFactoryWrapper = new auditDaoFactoryWrapper(sequelizeDaoFactory, auditDaoFactory, this);
        this.auditDaoFactoryWrapperes[daoFactoryName] = newAuditDaoFactoryWrapper;
        return newAuditDaoFactoryWrapper;
    }

    return auditSequelize;
})()
