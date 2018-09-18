let {Router}=require('express');

let uuid4=require('uuid/v4');
let DataURI=require('datauri');
let redis=require('redis');
let config=require('../config');
let redisClient=redis.createClient(config.redis.url);

let router=Router();
let db=require('../db');
let api=require('../schedule');

router.all('/oa/start',async (req,res)=>{
	let {cookies,captcha}=await api.fetchCaptcha();
	let uuid=uuid4();
	let datauri=new DataURI();
	datauri.format('gif',captcha);
	redisClient.set(`ojcoa_cookies_${uuid}`,cookies,'EX',600/* sec */);
	res.send({
		token: uuid,
		captcha: datauri.content
	});
});

module.exports={
	router: router,
	path: '/user'
};
