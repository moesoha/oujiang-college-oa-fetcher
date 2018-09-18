String.prototype.capitalize=function(){
    return this.charAt(0).toUpperCase()+this.slice(1);
}
let config=require('./config');
let mongorito=require('mongorito');
let fs=require('fs'),path=require('path');

const db=new mongorito.Database(config.mongo.url);

let makeSureItIsMongoObjectId=function (a){
	switch(typeof(a)){
		case 'string':
			return(mongorito.ObjectId.createFromHexString(a));
		case 'object':
			switch(a.constructor){
				case mongorito.ObjectId:
					return(a);
					break;
				case Array:
					a.forEach(function (value,index){
						a[index]=makeSureItIsMongoObjectId(value);
					});
					break;
			}
			return a;
		default:
			throw new Error('Wrong type of the field \'ObjectID\'.')
	}
}

let start=async function (me){
	await db.connect();
	console.log('./db.js: '+'db connected!'.green);
	fs.readdirSync(path.join(__dirname,"document")).forEach(function(file){
		// console.log(file);
		if((file.split('.')[1].toLowerCase())!=='js'){
			return;
		}
		var thisFile=require("./document/"+file);
		db.register(thisFile);
		me.document[(file.split('.')[0]).capitalize()]=thisFile;
		console.log("./document/"+file+': '+'registered.'.green);
	});
}

let me=module.exports={
	database: db,
	document: {},
	makeSureItIsMongoObjectId: makeSureItIsMongoObjectId,
};
for(let key in mongorito){
	if(!me[key]){
		me[key]=mongorito[key];
	}
}
start(me);
