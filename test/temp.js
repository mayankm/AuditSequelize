var SellerRepo = require("../lib/entity_model_seller").Seller;
var externalSystemLogRepo = require("../lib/entity_model_seller").ExternalSystemLog;
// SellerRepo.build({
// 	name:"Ankit",
// 	address:"Haridwar"
// }).save().success(function(){
// 	console.log("success");
// }).error(function(err){
// 	console.log(JSON.stringify(err));
// });

emitter.on("success_db", function(action,value,tableName){
	externalSystemLogRepo.build({
		sellerId:value.id,
		eventType:tableName, //tablename
		actionType:action,
		actionBy:"Me", 
		actionById:"Id",
		eventTypeAction:action, //can be value as well may be
		eventTypeActionResponse:JSON.stringify(value),
		timestamp:value.updatedAt
	}).save().success(function(){
		ccd ..onsole.log("Record Created");
	}).error(function(err){
		console.log(JSON.stringify(err));
	});
});

SellerRepo.find({
	where:{
		id:3
	}
}).success(function(data){
	console.log("DATA to be updated: " + data.name);
	data.name = "Ankit Mehta 3"
	data.save().success(function(){
		console.log("Successful in destroying");
	}).error(function(err){
		console.log(JSON.stringify(err));
	});
});



