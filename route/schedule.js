let {Router}=require('express');

let redis=require('redis');
let config=require('../config');
require('bluebird').promisifyAll(redis.RedisClient.prototype);
let redisClient=redis.createClient(config.redis.url);

let router=Router();
let db=require('../db');
let api=require('../schedule');

router.post('/oa/get/:token/current',async (req,res)=>{
	let cookie=await redisClient.getAsync(`ojcoa_cookies_${req.params.token}`);
	let username=await redisClient.getAsync(`ojcoa_username_${req.params.token}`);
	if(!cookie || !username){
		res.send({
			status: 404,
			return: "Not Found!"
		});
	}

	let data=await api.fetchSchedule(cookie,username);

	redisClient.set(`ojcoa_cookies_${req.params.token}`,cookie,'EX',2700/* sec */);
	redisClient.set(`ojcoa_username_${req.params.token}`,username,'EX',2700/* sec */);

	res.send({
		status: 200,
		return: 'OK',
		data: {
			success: true,
			schedule: data
		}
	});
});

module.exports={
	router: router,
	path: '/schedule'
};
