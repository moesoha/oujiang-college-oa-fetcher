let urlBase="http://ojjx.wzu.edu.cn/";

let requestPromise=require('request-promise'),cookieJar=requestPromise.jar();
let requestDefaultConfig={
	headers: {
		'User-Agent': 'oujiang-college-schedule/1.0 Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.116 Safari/537.36',
		'Referer': urlBase
	},
	forever: true,
	jar: cookieJar,
	resolveWithFullResponse: true
};
let request=requestPromise.defaults(requestDefaultConfig);
let uri=require('uri-js');
let iconv=require('iconv-lite');
let cheerio=require('cheerio');
let striptags=require('striptags');

let week=['日','一','二','三','四','五','六'];

module.exports.fetchCaptcha=async ()=>{
	let jar=requestPromise.jar();
	let page=await request({
		uri: uri.resolve(urlBase,'CheckCode.aspx'),
		method: "GET",
		encoding: null,
		jar: jar
	});

	return {
		cookies: jar.getCookieString(urlBase),
		captcha: page.body
	}
};

module.exports.doLogin=async (cookieString,username,password,captcha)=>{
	let jar=requestPromise.jar();
	jar.setCookie(cookieString,urlBase);
	// console.log(jar);
	let statusCode=200;
	try{
		let page=await request({
			uri: uri.resolve(urlBase,'default2.aspx'),
			method: "POST",
			form: {
				txtUserName: username,
				TextBox2: password,
				txtSecretCode: captcha,
				__VIEWSTATE: "dDwxNTMxMDk5Mzc0Ozs+yQtK1YbYY9vpBrR/vl1f+XLx3Qk=",
				// RadioButtonList1: decodeURIComponent('%D1%A7%C9%FA'),
				Button1: '',
				// TextBox1: '',
				// lbLanguage: '',
				// hidPdrs: '',
				// hidsc: ''
			},
			encoding: null,
			jar: jar
		});
	}catch(e){
		if(e.statusCode==302){
			return {
				success: true,
				cookies: jar.getCookieString(urlBase)
			}
		}else{
			throw e;
		}
	}
	return {
		success: false
	};
	// console.log(page);
	// console.log(iconv.decode(page.body,'gb2312'));
};

let fetchPlan=async (cookieJar)=>{
	let page=await request({
		uri: uri.resolve(urlBase,'/xsxkqk.aspx?xh=18219110216&gnmkdm=N121615'),
		method: "GET",
		jar: cookieJar,
		encoding: null
	});
	let $=cheerio.load(iconv.decode(page.body,'gb2312'));
	// console.log($.text());

	let year=$('#ddlXN option[selected]').attr('value');
	let semester=$('#ddlXQ option[selected]').attr('value');

	let $table=$('#DBGrid');
	let titleName=[];
	$table.find('.datelisthead td').each(function (){
		titleName.push($table.find(this).text().trim());
	});
	
	$table.remove($table.find('.datelisthead'));
	$table.find('tr:not(.datelisthead)').each(function (){
		let a={
			semester: semester,
			year: year,
			classId: null,
			course: {
				id: null,
				name: null,
				type: null,
			},
			isChoose: null,
			teacher: {
				name: null
			},
			credit: 0,
			weekLearningHour: null,
			time: [],
			place: null
		};
		$table.find(this).find('td').each(function (i,e){
			let key=titleName[i];
			let value=$table.find(this).text().trim();
			switch(key){
				case '选课课号':
					a.classId=value;
					break;
				case '课程代码':
					a.course.id=value;
					break;
				case '课程名称':
					a.course.name=value;
					break;
				case '课程性质':
					a.course.type=value;
					break;
				case '是否选课':
					a.isChoose=(value!='否');
					break;
				case '教师姓名':
					a.teacher=value;
					break;
				case '学分':
					a.credit=parseFloat(value);
					break;
				case '周学时':
					a.weekLearningHour=value;
					break;
				case '上课时间':
					let arr=value.split(';');
					arr.forEach((v,i)=>{
						let regex=new RegExp('周(.+?)第(.+?)节\\{(.+?)\\}','g');
						let regex2=new RegExp('第([0-9]+)\-([0-9]+)周','g')
						let match=regex.exec(v);
						let splitWeek=match[3].trim().split('|');
						let match2=regex2.exec(splitWeek[0]);
						arr[i]={
							day: week.indexOf(match[1].trim()),
							session: match[2].trim().split(',').map((v)=>parseInt(v)),
							week: {
								start: parseInt(match2[1]),
								end: parseInt(match2[2]),
								type: (splitWeek.length>1)?((splitWeek[1]=='双周')?2:1):0 // 0 所有 1 单周 2 双周
							}
						};
					});
					a.time=arr;
					break;
				case '上课地点':
					a.place=value.split(';');
					break;
			}
		});
		console.log(JSON.stringify(a));
	});
};

let fetchSchedule=async (cookieJar)=>{
	let page=await request({
		uri: uri.resolve(urlBase,'/xskbcx.aspx?xh=18219110216&gnmkdm=N121603'),
		method: "GET",
		jar: cookieJar,
		encoding: null
	});
	let $=cheerio.load(iconv.decode(page.body,'gb2312'),{
		decodeEntities: false
	});
	// console.log($.text());

	let year=$('#xnd option[selected]').attr('value');
	let semester=$('#xqd option[selected]').attr('value');

	$('#Table1').find('td:not(td[align="Center"])').each((i,e)=>$(e).remove());
	$('#Table1').find('td').each((i,e)=>{
		if($(e).text().trim()==''){
			$(e).remove();
		}
	});
	let tableHtml=$('#Table1').html();

	let regexFetchAllClass=new RegExp(">(.+?)<br>(.+?)<br>(.+?)<br>(.+?)<",'gi');
	let matchFetchAllClass=regexFetchAllClass.exec(tableHtml);

	let lessons=[];
	while(matchFetchAllClass){
		let match=new RegExp('周(.+?)第(.+?)节\\{(.+?)\\}','g').exec(striptags(matchFetchAllClass[2]));
		let splitWeek=match[3].trim().split('|');
		let match2=new RegExp('第([0-9]+)\-([0-9]+)周','g').exec(splitWeek[0]);
		lessons.push({
			semester: semester,
			year: year,
			name: striptags(matchFetchAllClass[1]), // striptags
			teacher: striptags(matchFetchAllClass[3]),
			place: striptags(matchFetchAllClass[4]),
			day: week.indexOf(match[1].trim()),
			session: match[2].trim().split(',').map((v)=>parseInt(v)),
			week: {
				start: parseInt(match2[1]),
				end: parseInt(match2[2]),
				type: (splitWeek.length>1)?((splitWeek[1]=='双周')?2:1):0 // 0 所有 1 单周 2 双周
			}
		});
		matchFetchAllClass=regexFetchAllClass.exec(tableHtml);
	}

	console.log(lessons);
};

// fetchCaptcha();
// module.exports.doLogin('ASP.NET_SessionId=j2vi0z2jlfh1d***ztzbizem','18219110216','***','q3i0');
