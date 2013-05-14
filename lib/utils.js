var configuration = require("./configuration");
var Sequelize = require("sequelize");

var getDataTypeForDaoFactoryAttribute = exports.getDataTypeForDaoFactoryAttribute =
    function getDataTypeForDaoFactoryAttribute(attributeValue){
        if(attributeValue == undefined)
            return attributeValue;
        return attributeValue["type"] == undefined? attributeValue:attributeValue["type"]
    }


var getAuditDaoFactoryAttributeName = exports.getAuditDaoFactoryAttributeName =
    function getAuditDaoFactoryAttributeName(attributeName) {
        return configuration.auditColumnPrefixe + attributeName + configuration.auditColumnSuffixe;
    }
exports.generateAuditDaoFactoryAttributes =  function generateAuditDaoFactoryAttributes(sequelizeDaoFactoryAttributes) {
    var attributes = Object.keys(sequelizeDaoFactoryAttributes);
    var auditDaoFactoryAttributes = {};
    for (var i = 0; i < attributes.length; i++) {
        var attributeName = attributes[i];
        var attributeOptions = sequelizeDaoFactoryAttributes[attributeName];
        var type = getDataTypeForDaoFactoryAttribute(attributeOptions);
        if (configuration.omitFields.indexOf(attributeName) <= -1) {
            auditDaoFactoryAttributes[getAuditDaoFactoryAttributeName(attributeName)] = type;
        }
    }
    auditDaoFactoryAttributes["action"] = Sequelize.STRING;
    auditDaoFactoryAttributes["actionBy"] = Sequelize.STRING;
    auditDaoFactoryAttributes["ipAddress"] = Sequelize.STRING;
    return auditDaoFactoryAttributes;
}

exports.transformAuditDaoWrapperToSequelizeDao =   function transformAuditDaoWrapperToSequelizeDao(auditDaos){
    var transformedDaos;
    if(auditDaos){
        if(auditDaos instanceof Array){
            transformedDaos = [];
            for(var i=0;i<auditDaos.length;i++){
                transformedDaos.push(auditDaos[i].sequelizeDao);
            }
        }else {
            transformedDaos = auditDaos.sequelizeDao;
        }
    } else {
        transformedDaos = auditDaos;
    }
    return  transformedDaos;
}

exports.transformSequelizeDaoToAuditDaoWrapper = function transformSequelizeDaoToAuditDaoWrapper(daoValues, auditDaoFactoryWrapper){
    if(daoValues){
        var auditValues;
        if(daoValues instanceof Array){
            auditValues = [];
            for(var i=0;i<daoValues.length;i++){
                auditValues.push(auditDaoFactoryWrapper.buildFromSequelizeDao(daoValues[i]));
            }
        } else{
            auditValues = auditDaoFactoryWrapper.buildFromSequelizeDao(daoValues);
        }
        return auditValues;
    } else
        return daoValues;
}

exports.getAuditDaoFactoryName =function getAuditDaoFactoryName(sequelizeDaoFactoryName) {
    return configuration.auditTablePrefixe + sequelizeDaoFactoryName + configuration.auditTableSuffixe;
}

exports.getAuditDao = function getAuditDao(value, action){
    var auditValue = {};
    var valueKeys = Object.keys(value);
    for(var i=0; i<valueKeys.length; i++){
        if(configuration.omitFields.indexOf(valueKeys[i]) <= -1){
            auditValue[getAuditDaoFactoryAttributeName(valueKeys[i])] =  value[valueKeys[i]];
        }
    }
    action = action ? action : "undefined";
    auditValue["action"] = action;
    return auditValue;
}

