let {Router}=require('express');

let uuid4=require('uuid/v4');
let DataURI=require('datauri');
let redis=require('redis');
let config=require('../config');
require('bluebird').promisifyAll(redis.RedisClient.prototype);
let redisClient=redis.createClient(config.redis.url);

let router=Router();
let db=require('../db');
let api=require('../schedule');

router.all('/oa/start',async (_,res)=>{
	let {cookies,captcha}=await api.fetchCaptcha();
	let uuid=uuid4();
	let datauri=new DataURI();
	datauri.format('gif',captcha);
	redisClient.set(`ojcoa_cookies_${uuid}`,cookies,'EX',600/* sec */);
	res.send({
		status: 200,
		return: 'OK',
		data: {
			token: uuid,
			captcha: datauri.content
		}
	});
});

router.post('/oa/login/:token',async (req,res)=>{
	let cookie=await redisClient.getAsync(`ojcoa_cookies_${req.params.token}`);
	if(!cookie){
		res.send({
			status: 404,
			return: "Not Found!"
		});
	}

	let username=req.body.username;
	let password=req.body.password;
	let captcha=req.body.captcha;

	if(!username || !password || !captcha){
		res.send({
			status: 400,
			return: 'Bad Request'
		});
	}

	let loginStatus=await api.doLogin(cookie,username,password,captcha);

	if(!loginStatus.success){
		res.send({
			status: 200,
			return: 'OK',
			data: {
				success: false
			}
		});
	}

	redisClient.set(`ojcoa_cookies_${req.params.token}`,loginStatus.cookies,'EX',2700/* sec */);
	redisClient.set(`ojcoa_username_${req.params.token}`,username,'EX',2700/* sec */);

	res.send({
		status: 200,
		return: 'OK',
		data: {
			success: true
		}
	});
});

module.exports={
	router: router,
	path: '/user'
};
