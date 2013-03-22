var callBacks = require("./audit_call_backs");
module.exports = (function(){
    var audit_dao = function(sequelizeDao, auditDaoFactoryWrapper){
        this.sequelizeDao = sequelizeDao;
        this.auditDaoFactoryWrapper = auditDaoFactoryWrapper;
        this.auditDaoFactory =  auditDaoFactoryWrapper.auditDaoFactory;
        var sequelizeDaoValues = sequelizeDao.values;
        var sequelizeDaoKeys = Object.keys(sequelizeDaoValues);
        for(var i=0;i<sequelizeDaoKeys.length;i++){
            this[sequelizeDaoKeys[i]] = sequelizeDao[sequelizeDaoKeys[i]];
        }
    }
    var omitFields = ["createdAt","updatedAt","created_at","updated_at"];

    audit_dao.prototype.destroy = function(options){
        var self = this;
        var startTime = new Date().getTime();
        var destroyCallBacks = new callBacks();
        var actionBy = "";
        var ipAddress = "";
        if(options) {
            if(options.actionBy ) {
                actionBy = options.actionBy;
            }
            if(options.ipAddress) {
                ipAddress = options.ipAddress;
            }
        }
        this.sequelizeDao.destroy().success(function (){
            var action = "delete";
            var endTime = new Date().getTime();
            var totalTimeTaken = endTime - startTime;
            emitter.emit("success_db",action,self.sequelizeDao.values,null,null,actionBy,ipAddress);
            var auditDao = convertToAuditValue(self.sequelizeDao.values, action, actionBy,ipAddress);
            self.auditDaoFactory.create(auditDao).error(function(err){
                console.log("Error while creating audit entry : " + err);
            });
            if(destroyCallBacks.successCallBack){
                destroyCallBacks.successCallBack();
            }
            if(self.auditDaoFactoryWrapper.auditSequelizeInstance.options["timeNotificationCallBack"]){
                self.auditDaoFactoryWrapper.auditSequelizeInstance.options["timeNotificationCallBack"](totalTimeTaken, self.auditDaoFactoryWrapper.sequelizeDaoFactory.tableName, action);
            }
        }).error(function (error){
                if(destroyCallBacks.errorCallBack){
                    destroyCallBacks.errorCallBack(error);
                }
            });
        return destroyCallBacks;
    }

    function convertToAuditValue(value, action, actionBy,ipAddress){
        var auditValue = {};
        var valueKeys = Object.keys(value);
        for(var i=0; i<valueKeys.length; i++){
            if(omitFields.indexOf(valueKeys[i]) <= -1){
                auditValue["audit_" + valueKeys[i]] =  value[valueKeys[i]];
            }
        }
        action = action ? action : "undefined";
        auditValue["action"] = action;
        auditValue["actionBy"] = actionBy;
        auditValue["ipAddress"] = ipAddress;
        return auditValue;
    }

    function syncDao(self){
        var sequelizeDaoValues = self.sequelizeDao.values;
        var sequelizeDaoKeys = Object.keys(sequelizeDaoValues);
        for(var i=0;i<sequelizeDaoKeys.length;i++){
            if(self[sequelizeDaoKeys[i]]){
                self.sequelizeDao[sequelizeDaoKeys[i]] = self[sequelizeDaoKeys[i]];
            }
        }
    }

    audit_dao.prototype.updateAttributes = function  updateAttributes(updates, options){
        var startTime = new Date().getTime();
        var self = this;
        var saveCallBacks = new callBacks();
        var oldState = {};
        for(var k in this.sequelizeDao.attributes){
            var key = this.sequelizeDao.attributes[k];
            oldState[key] = this.sequelizeDao[key];
        }
        syncDao(self);
        var action = "update";
        var actionBy = "";
        var ipAddress = "";
        if(options) {
            if(options.actionBy ) {
                actionBy = options.actionBy;
            }
            if(options.ipAddress) {
                ipAddress = options.ipAddress;
            }
        }
        this.sequelizeDao.updateAttributes(updates).success(function (value){
            var endTime = new Date().getTime();
            var totalTimeTaken = endTime - startTime;
            emitter.emit("success_db",action,value,self.auditDaoFactoryWrapper.sequelizeDaoFactory.tableName,oldState,actionBy,ipAddress);
            var auditValue = convertToAuditValue(value.values, action, actionBy,ipAddress);
            self.auditDaoFactory.create(auditValue).error(function(err){
                console.log("Error while creating audit entry : " + err);
            });
            var newValue = self.auditDaoFactoryWrapper.buildFromSequelizeDao(value);
            if(saveCallBacks.successCallBack)
                saveCallBacks.successCallBack(newValue);
            if(self.auditDaoFactoryWrapper.auditSequelizeInstance.options["timeNotificationCallBack"]){
                self.auditDaoFactoryWrapper.auditSequelizeInstance.options["timeNotificationCallBack"](totalTimeTaken, self.auditDaoFactoryWrapper.sequelizeDaoFactory.tableName, action);
            }
        }).error(function(error){
                if(saveCallBacks.errorCallBack)
                    saveCallBacks.errorCallBack(error);
            })
        return  saveCallBacks;
    }

    audit_dao.prototype.save = function(fields, options){
        var startTime = new Date().getTime();
        var self = this;
        var saveCallBacks = new callBacks();
        var oldState = {};
        for(var k in this.sequelizeDao.attributes){
            var key = this.sequelizeDao.attributes[k];
            oldState[key] = this.sequelizeDao[key];
        }
        syncDao(self);
        var action = "update";
        if(this.sequelizeDao.isNewRecord){
            action = "insert";
        }
        var actionBy = "";
        var ipAddress = "";
        if(options) {
            if(options.actionBy ) {
                actionBy = options.actionBy;
            }
            if(options.ipAddress) {
                ipAddress = options.ipAddress;
            }
        }
        this.sequelizeDao.save(fields).success(function (value){
            var endTime = new Date().getTime();
            var totalTimeTaken = endTime - startTime;
            emitter.emit("success_db",action,value,self.auditDaoFactoryWrapper.sequelizeDaoFactory.tableName,oldState,actionBy,ipAddress);
            var auditValue = convertToAuditValue(value.values, action, actionBy,ipAddress);
            self.auditDaoFactory.create(auditValue).error(function(err){
                console.log("Error while creating audit entry : " + err);
            });
            var newValue = self.auditDaoFactoryWrapper.buildFromSequelizeDao(value);
            if(saveCallBacks.successCallBack)
                saveCallBacks.successCallBack(newValue);
            if(self.auditDaoFactoryWrapper.auditSequelizeInstance.options["timeNotificationCallBack"]){
                self.auditDaoFactoryWrapper.auditSequelizeInstance.options["timeNotificationCallBack"](totalTimeTaken, self.auditDaoFactoryWrapper.sequelizeDaoFactory.tableName, action);
            }
        }).error(function(error){
                if(saveCallBacks.errorCallBack)
                    saveCallBacks.errorCallBack(error);
            })
        return  saveCallBacks;
    }
    return audit_dao;
})()