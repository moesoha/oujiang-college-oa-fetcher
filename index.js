require('colors');
let express=require('express');
let http=require('http');
let app=express();
let httpserver=http.createServer(app);

let port=process.env.PORT ? parseInt(process.env.PORT) : 3000;

let bodyParser=require('body-parser');
let logger=require('morgan');
let fs=require('fs');
let path=require('path');
let db=require('./db');

app.use(logger('dev')); // TODO: not always in 'dev'
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: false
}));

app.use(express.static(path.join(__dirname,'public')));

app.all('*',function (req,res,next){
	res.header("Developed-By",'Tianhai Information Technology, Soha Jin');
	res.header("X-Powered-By",'github.com/moesoha/oujiang-college-schedule-proxy');
	next();
});

fs.readdirSync(path.join(__dirname,"route")).forEach(function(file){
	if((file.split('.')[1].toLowerCase())!=='js'){
		return;
	}
	var thisFile=require("./route/"+file);
	if(thisFile.hasOwnProperty('path') && typeof(thisFile.path)=='string'){
		app.use(thisFile.path,thisFile.router);
		console.log("./route/"+file+': '+'router imported.'.green);
	}else{
		console.error("./route/"+file+': '+'wrong route file, ignored.'.yellow);
	}
});

//404
app.use(function (req,res,next){
	res.status(404).send({
		status: 404,
		return: 'Not Found'
	});
});

//500
app.use(function (err,req,res,next){
	console.error(err.stack);
	res.status(500).send({
		status: 500,
		return: 'Something wrong!'
	});
});

//跑起服务
let server=httpserver.listen(port,function (){
	let host=server.address().address;
	let port=server.address().port;
	console.log('Application is started and listening at http://%s:%s',host,port);
});
