let {Router}=require('express');

let redis=require('redis');
let config=require('../config');
require('bluebird').promisifyAll(redis.RedisClient.prototype);
let redisClient=redis.createClient(config.redis.url);

let router=Router();
let db=require('../db');
let api=require('../schedule');

router.all('/oa/get/demo/current',(_,res)=>{
	res.send({"status":200,"return":"OK","data":{"semester":"1","year":"2018-2019","lessons":[{"name":"大学英语A(一)","teacher":"石少平","place":"北-5-102","day":1,"session":[1,2],"week":{"start":2,"end":17,"type":0}},{"name":"生涯发展与体验教育","teacher":"谢树畅","place":"北-4-113","day":2,"session":[1,2],"week":{"start":10,"end":16,"type":0}},{"name":"线性代数","teacher":"邢雅","place":"北-5-212","day":3,"session":[1,2],"week":{"start":2,"end":17,"type":0}},{"name":"高等数学B(一)","teacher":"胡晓波","place":"北-4-308","day":4,"session":[1,2],"week":{"start":2,"end":17,"type":0}},{"name":"高等数学B(一)","teacher":"胡晓波","place":"北-4-308","day":1,"session":[3,4],"week":{"start":2,"end":17,"type":0}},{"name":"计算机科学导论","teacher":"李名标(李名标)","place":"北-5-210","day":2,"session":[3,4],"week":{"start":2,"end":17,"type":0}},{"name":"大学英语A(一)","teacher":"石少平","place":"北-5-102","day":3,"session":[3,4],"week":{"start":2,"end":17,"type":1}},{"name":"程序设计基础","teacher":"连新泽(连新泽)","place":"北-5-210","day":3,"session":[3,4],"week":{"start":2,"end":16,"type":2}},{"name":"程序设计基础","teacher":"连新泽(连新泽)","place":"北-5-212","day":4,"session":[3,4],"week":{"start":2,"end":16,"type":0}},{"name":"大学英语【口语】","teacher":"石少平","place":"北-5-102","day":5,"session":[3,4],"week":{"start":2,"end":17,"type":2}},{"name":"计算机科学导论","teacher":"李名标(李名标)","place":"北-7-409","day":2,"session":[5,6],"week":{"start":2,"end":16,"type":2}},{"name":"Web前端开发","teacher":"邹董董(邹董董)","place":"北-5-212","day":4,"session":[5,6],"week":{"start":2,"end":17,"type":0}},{"name":"Web前端开发","teacher":"邹董董(邹董董)","place":"北-7-410","day":5,"session":[5,6],"week":{"start":2,"end":17,"type":0}},{"name":"思想道德修养与法律基础","teacher":"杨筱玲","place":"北-5-306","day":1,"session":[7,8],"week":{"start":2,"end":16,"type":0}},{"name":"体育（一）","teacher":"周际明","place":"北-体育场","day":2,"session":[7,8],"week":{"start":2,"end":17,"type":0}},{"name":"大学生心理健康教育","teacher":"陈卯","place":"北-7-202","day":4,"session":[7,8],"week":{"start":2,"end":8,"type":0}},{"name":"程序设计基础","teacher":"连新泽(连新泽)","place":"北-7-403","day":4,"session":[9,10],"week":{"start":3,"end":16,"type":0}}]}});
});

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
		data: data
	});
});

module.exports={
	router: router,
	path: '/schedule'
};
