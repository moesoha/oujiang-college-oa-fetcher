let {Router}=require('express');

let router=Router();

router.all('/',function (req,res,next){
	res.send('<h1>orz</h1><br /><i>by Soha Jin</i>')
});

module.exports={
	router: router,
	path: '/'
};
