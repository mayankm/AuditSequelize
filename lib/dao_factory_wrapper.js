var auditDao = require("./dao_wrapper");
var callBacks = require("./audit_call_backs");
var _  = require("underscore");
var utils = require("./utils");
var configuration = require("./configuration");


function markDeletedAssociations(oldAssociations, associationObject, self) {
    if (oldAssociations) {
        if (oldAssociations instanceof Array) {
            for (var i = 0; i < oldAssociations.length; i++) {
                oldAssociations[i].identifiers = (associationObject.options || {}).omitNull ? '' : null;
                var auditVal = utils.getAuditDao(oldAssociations[i].values, "deleteAssociations");
                var auditDaoFactoryWrapper = self.auditDaoFactoryWrapper.auditSequelizeInstance.auditDaoFactoryWrapperes[oldAssociations[i].__factory.name];
                if (auditDaoFactoryWrapper)
                    auditDaoFactoryWrapper.auditDaoFactory.create(auditVal).error(function(err){
                        console.log("Not able to audit because : " + err);
                    }); //here the action will be delete association
            }
        } else {
            var auditVal = utils.getAuditDao(oldAssociations.values, "deleteAssociations");
            var auditDaoFactoryWrapper = self.auditDaoFactoryWrapper.auditSequelizeInstance.auditDaoFactoryWrapperes[oldAssociations.__factory.name];
            if (auditDaoFactoryWrapper)
                auditDaoFactoryWrapper.auditDaoFactory.create(auditVal).error(function(err){
                        console.log("Not able to audit because : " + err);
                    }); //here the action will be delete association
        }
    }
}
function markCreatedAssociations(newAssociations, associationObject, self) {
    if (newAssociations) {
        if (newAssociations instanceof Array) {
            for (var i = 0; i < newAssociations.length; i++) {
                newAssociations[i].identifiers = (associationObject.options || {}).omitNull ? '' : null;
                var auditVal = utils.getAuditDao(newAssociations[i].values, "createAssociations");
                var auditDaoFactoryWrapper = self.auditDaoFactoryWrapper.auditSequelizeInstance.auditDaoFactoryWrapperes[newAssociations[i].__factory.name];
                if (auditDaoFactoryWrapper)
                    auditDaoFactoryWrapper.auditDaoFactory.create(auditVal).error(function(err){
                        console.log("Not able to audit because : " + err);
                    }); //here the action will be delete association
            }
        } else {
            var auditVal = utils.getAuditDao(newAssociations.values, "createAssociations");
            var auditDaoFactoryWrapper = self.auditDaoFactoryWrapper.auditSequelizeInstance.auditDaoFactoryWrapperes[newAssociations.__factory.name];
            if (auditDaoFactoryWrapper)
                auditDaoFactoryWrapper.auditDaoFactory.create(auditVal).error(function(err){
                        console.log("Not able to audit because : " + err);
                    }); //here the action will be created association
        }
    }
}
function markDeletedAssociationForConnectorDao(oldAssociations, associationObject, dao, self) {
    if (oldAssociations) {
        for (var i = 0; i < oldAssociations.length; i++) {

            var where = {}
                , primaryKeys = Object.keys(associationObject.connectorDAO.rawAttributes)
                , foreignKey = primaryKeys.filter(function(pk) {
                return pk != associationObject.identifier
            })[0]

            where[associationObject.identifier] = dao.id;
            where[foreignKey] = oldAssociations[i].id;
            var connectorDaoValue = associationObject.connectorDAO.build(where);
            var auditVal = utils.getAuditDao(connectorDaoValue.values, "deleteAssociations");
            var auditDaoFactoryWrapper = self.auditDaoFactoryWrapper.auditSequelizeInstance.auditDaoFactoryWrapperes[associationObject.connectorDAO.name];
            if (auditDaoFactoryWrapper)
                auditDaoFactoryWrapper.auditDaoFactory.create(auditVal).error(function(err){
                        console.log("Not able to audit because : " + err);
                    }); //here the action will be delete association
        }
    }
}
function markCreatedAssociationForConnectorDao(newAssociations, associationObject, dao, self) {
    if (newAssociations) {
        for (var i = 0; i < newAssociations.length; i++) {

            var where = {}
                , primaryKeys = Object.keys(associationObject.connectorDAO.rawAttributes)
                , foreignKey = primaryKeys.filter(function(pk) {
                return pk != associationObject.identifier
            })[0]

            where[associationObject.identifier] = dao.id;
            where[foreignKey] = newAssociations[i].id;
            var connectorDaoValue = associationObject.connectorDAO.build(where);
            var auditVal = utils.getAuditDao(connectorDaoValue.values, "createAssociations");
            var auditDaoFactoryWrapper = self.auditDaoFactoryWrapper.auditSequelizeInstance.auditDaoFactoryWrapperes[associationObject.connectorDAO.name];
            if (auditDaoFactoryWrapper)
                auditDaoFactoryWrapper.auditDaoFactory.create(auditVal).error(function(err){
                        console.log("Not able to audit because : " + err);
                    }); //here the action will be delete association
        }
    }
}
module.exports = (function(){

    var audit_dao_factory = function(sequelizeDaoFactory, auditDaoFactory, auditSequelizeInstance){
        this.sequelizeDaoFactory = sequelizeDaoFactory;
        this.auditDaoFactory = auditDaoFactory;
        this.auditSequelizeInstance = auditSequelizeInstance;
    }

    audit_dao_factory.prototype.createConnectorDaoForAssociation = function createConnectorDaoForAssociation() {
        var associationKeys = Object.keys(this.sequelizeDaoFactory.associations);
        for (var i = 0; i < associationKeys.length; i++) {
            var connectorDAO = this.sequelizeDaoFactory.associations[associationKeys[i]].connectorDAO;
            if (connectorDAO) {
                this.auditSequelizeInstance.getAuditDaoFactoryWrapper(connectorDAO, {});
            }
        }
    }

    audit_dao_factory.prototype.createAssociation = function(associatedAuditDAOFactoryWrapper, relationshipCardinality, options, auditOptions){
        var associatedBefore =    Object.keys(associatedAuditDAOFactoryWrapper.sequelizeDaoFactory.rawAttributes);
        var thisBefore = Object.keys(this.sequelizeDaoFactory.rawAttributes);
        if(relationshipCardinality == "one")
            this.sequelizeDaoFactory.hasOne(associatedAuditDAOFactoryWrapper.sequelizeDaoFactory, options);
        if(relationshipCardinality == "many")
            this.sequelizeDaoFactory.hasMany(associatedAuditDAOFactoryWrapper.sequelizeDaoFactory, options);
        var associatedAfter = Object.keys(associatedAuditDAOFactoryWrapper.sequelizeDaoFactory.rawAttributes);
        var thisAfter = Object.keys(this.sequelizeDaoFactory.rawAttributes);
        var removeFromAssociatedDaoFactory = _.difference(associatedBefore, associatedAfter);
        var addInAssociatedDaoFactory = _.difference(associatedAfter, associatedBefore);
        var removeFromThisDaoFactory = _.difference(thisBefore, thisAfter);
        var addInThisDaoFactory = _.difference(thisAfter, thisBefore);

        for(var i=0; i<removeFromAssociatedDaoFactory.length;i++){
            if(configuration.omitFields.indexOf(removeFromAssociatedDaoFactory[i]) === -1)
                delete associatedAuditDAOFactoryWrapper.auditDaoFactory.rawAttributes["audit_"+removeFromAssociatedDaoFactory[i]];
        }

        for(var i=0; i<removeFromThisDaoFactory.length;i++){
            if(configuration.omitFields.indexOf(removeFromThisDaoFactory[i]) === -1)
                delete this.auditDaoFactory.rawAttributes["audit_"+removeFromThisDaoFactory[i]];
        }

        for(var i=0; i<addInThisDaoFactory.length;i++){
            if(configuration.omitFields.indexOf(addInThisDaoFactory[i]) === -1)
                this.auditDaoFactory.rawAttributes["audit_"+addInThisDaoFactory[i]] = utils.getDataTypeForDaoFactoryAttribute(this.sequelizeDaoFactory.rawAttributes[addInThisDaoFactory[i]]);
        }

        for(var i=0; i<addInAssociatedDaoFactory.length;i++){
            if(configuration.omitFields.indexOf(addInAssociatedDaoFactory[i]) === -1)
                associatedAuditDAOFactoryWrapper.auditDaoFactory.rawAttributes["audit_"+addInAssociatedDaoFactory[i]] = utils.getDataTypeForDaoFactoryAttribute(associatedAuditDAOFactoryWrapper.sequelizeDaoFactory.rawAttributes[addInAssociatedDaoFactory[i]]);
        }
        if(relationshipCardinality == "many"){
            this.createConnectorDaoForAssociation();
        }
    }

    audit_dao_factory.prototype.hasOne = function(associatedAuditDAOFactoryWrapper, options, auditOptions){
        this.createAssociation(associatedAuditDAOFactoryWrapper, "one",options, auditOptions);
    }

    audit_dao_factory.prototype.hasMany = function(associatedAuditDAOFactoryWrapper, options, auditOptions){
        this.createAssociation(associatedAuditDAOFactoryWrapper, "many",options, auditOptions);
    }

    audit_dao_factory.prototype.createDaoWrapper = function createDaoWrapper(dao, auditDaoFactoryWrapper) {
        var auditDaoWrapper = new auditDao(dao, auditDaoFactoryWrapper);
        var associationKeys = Object.keys(auditDaoFactoryWrapper.sequelizeDaoFactory.associations);
        for (var i = 0; i < associationKeys.length; i++) {
            var associationObject = auditDaoFactoryWrapper.sequelizeDaoFactory.associations[associationKeys[i]];
            var associationGetterName = associationObject["accessors"]["get"];
            if (associationGetterName)
                auditDaoWrapper[associationGetterName] = getInjectionGetterMethod(dao, associationGetterName);

            var associationSetterName = associationObject["accessors"]["set"];
            if (associationSetterName) {
                auditDaoWrapper[associationSetterName] = getInjectionSetterMethod(dao, associationObject);
            }
        }
        auditDaoWrapper.values = dao.values;
        return  auditDaoWrapper;
    }

    audit_dao_factory.prototype.buildFromSequelizeDao = function buildFromSequelizeDao(dao){
        var auditDaoFactoryWrapper =  this.auditSequelizeInstance.getAuditDaoFactoryWrapper(dao.__factory);
        return this.createDaoWrapper(dao, auditDaoFactoryWrapper);
    }

    audit_dao_factory.prototype.build = function build(value,option){
        var dao = this.sequelizeDaoFactory.build(value,option);
        return this.createDaoWrapper(dao, this);
    }

    function getInjectionGetterMethod(dao,associationGetterName){
        return function() {
            var associationCallBacks = new callBacks();
            var self = this;
            dao[associationGetterName]().success(function(values){
                if(associationCallBacks.successCallBack){
                    associationCallBacks.successCallBack(utils.transformSequelizeDaoToAuditDaoWrapper(values, self.auditDaoFactoryWrapper));
                }
            }).error(function(err){
                    if(associationCallBacks.errorCallBack)
                        associationCallBacks.errorCallBack(err);
                });
            return associationCallBacks;
        }
    }

    function getInjectionSetterMethod(dao,associationObject){
        var associationGetterName = associationObject["accessors"]["get"];
        var associationSetterName = associationObject["accessors"]["set"];

        return function(inputAssociations) {
            var associationCallBacks = new callBacks();
            var self = this;
            var transformedInputAssociations = utils.transformAuditDaoWrapperToSequelizeDao(inputAssociations);
            dao[associationGetterName]().success(function(oldAssociations){
                dao[associationSetterName](transformedInputAssociations).success(function(newAssociations){

                    if(! associationObject.connectorDAO){
                        markDeletedAssociations(oldAssociations, associationObject, self);
                        markCreatedAssociations(newAssociations, associationObject, self);
                    }
                    else {
                        markDeletedAssociationForConnectorDao(oldAssociations, associationObject, dao, self);
                        markCreatedAssociationForConnectorDao(newAssociations, associationObject, dao, self);
                    }
                    if(associationCallBacks.successCallBack){
                        associationCallBacks.successCallBack(utils.transformSequelizeDaoToAuditDaoWrapper(newAssociations, self.auditDaoFactoryWrapper));
                    }
                }).error(function(err){
                        if(associationCallBacks.errorCallBack){
                            associationCallBacks.errorCallBack(err);
                        }
                    });
            });
            return associationCallBacks;
        }
    }

    audit_dao_factory.prototype.find = function(options){

        var findCallBacks = new callBacks();
        var self = this;
        var startTime = new Date().getTime();
        this.sequelizeDaoFactory.find(options).success(function(searchValue){
            var endTime = new Date().getTime();
            var totalTimeTaken = endTime - startTime;
            if(findCallBacks.successCallBack)
                findCallBacks.successCallBack(utils.transformSequelizeDaoToAuditDaoWrapper(searchValue, self));
            if(self.auditSequelizeInstance.options["timeNotificationCallBack"]){
                self.auditSequelizeInstance.options["timeNotificationCallBack"](totalTimeTaken, self.sequelizeDaoFactory.tableName, "search");
            }
        }).error(function (error){
                if(findCallBacks.errorCallBack)
                    findCallBacks.errorCallBack(error);
            });
        return findCallBacks;
    }

    audit_dao_factory.prototype.findAll = function(options){

        var findAllCallBacks = new callBacks();
        var self = this;
        var startTime = new Date().getTime();
        this.sequelizeDaoFactory.findAll(options).success(function(searchValues){
            var endTime = new Date().getTime();
            var totalTimeTaken = endTime - startTime;
            if(findAllCallBacks.successCallBack){
                findAllCallBacks.successCallBack(utils.transformSequelizeDaoToAuditDaoWrapper(searchValues, self));
            }
            if(self.auditSequelizeInstance.options["timeNotificationCallBack"]){
                self.auditSequelizeInstance.options["timeNotificationCallBack"](totalTimeTaken, self.sequelizeDaoFactory.tableName, "search");
            }
        }).error(function (error){
                if(findAllCallBacks.errorCallBack)
                    findAllCallBacks.errorCallBack(error);
            });
        return findAllCallBacks;
    }

    audit_dao_factory.prototype.create = function(value, fields){
        return this.build(value).save(fields);
    }

    return audit_dao_factory;
})()