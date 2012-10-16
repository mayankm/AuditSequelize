module.exports = (function(){
    var callBacks = function(){}

    callBacks.prototype.success = function(cb){
        this.successCallBack = cb;
        return this;
    }

    callBacks.prototype.error = function(cb){
        this.errorCallBack = cb;
        return this;
    }
    return callBacks;
})()