var callBacks = require("./audit_call_backs");
var eventEmitter = require("events").EventEmitter;
emitter = new eventEmitter();
module.exports = (function(){
    var audit_dao = function(sequelizeDao, auditDaoFactoryWrapper){
        this.sequelizeDao = sequelizeDao;
        this.auditDaoFactoryWrapper = auditDaoFactoryWrapper;
        this.auditDaoFactory =  auditDaoFactoryWrapper.auditDaoFactory;
    }
    var omitFields = ["createdAt","updatedAt","created_at","updated_at"];

    audit_dao.prototype.destroy = function(){
        var self = this;

        var destroyCallBacks = new callBacks();
        this.sequelizeDao.destroy().success(function (){
            var action = "delete";
            emitter.emit("success_db",action,self.sequelizeDao.values);
            var auditDao = convertToAuditValue(self.sequelizeDao.values, action);
            self.auditDaoFactory.create(auditDao);
            if(destroyCallBacks.successCallBack){
                destroyCallBacks.successCallBack();
            }
        }).error(function (error){
                if(destroyCallBacks.errorCallBack){
                    destroyCallBacks.errorCallBack(error);
                }
            });
        return destroyCallBacks;
    }

    function convertToAuditValue(value, action){
        var auditValue = {};
        var valueKeys = Object.keys(value);
        for(var i=0; i<valueKeys.length; i++){
            if(omitFields.indexOf(valueKeys[i]) <= -1){
                auditValue["audit_" + valueKeys[i]] =  value[valueKeys[i]];
            }
        }
        action = action ? action : "undefined";
        auditValue["action"] = action;
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

    audit_dao.prototype.save = function(fields){
        var self = this;
        var saveCallBacks = new callBacks();
        syncDao(self);
        var action = "update";
        if(this.sequelizeDao.isNewRecord){
           action = "insert";
        }
        this.sequelizeDao.save(fields).success(function (value){
            emitter.emit("success_db",action,value,self.auditDaoFactoryWrapper.sequelizeDaoFactory.tableName);
            var auditValue = convertToAuditValue(value.values, action);
            self.auditDaoFactory.create(auditValue);
            var newValue = self.auditDaoFactoryWrapper.buildFromSequelizeDao(value);
            if(saveCallBacks.successCallBack)
                saveCallBacks.successCallBack(newValue);
        }).error(function(error){
                if(saveCallBacks.errorCallBack)
                    saveCallBacks.errorCallBack(error);
            })
        return  saveCallBacks;
    }
    this
    return audit_dao;
})()