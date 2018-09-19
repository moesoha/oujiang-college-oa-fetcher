# oujiang-college-oa-fetcher

## Prerequisite

  - MongoDB
  - Redis
  - *Internet Connection*

## Start Server

	git clone https://github.com/moesoha/oujiang-college-oa-fetcher.git
	cd oujiang-college-oa-fetcher
	cp config.js.example config.js # edit as you like
	npm install
	node .

## Request Hint

### Login

#### Start Login

```
GET /user/oa/start
```

  - `data.token` Access token with this server, valid in 10 min.
  - `data.captcha` An CAPTCHA image in datauri.

#### Submit Form

```
POST /user/oa/login/{TOKEN}

username={USERNAME}&password={PASSWORD}&captcha={CAPTCHA}
```

  - `data.success` Tells if the login process finished successfully. If `false` here, you should restart from "Start Login" section to get a CAPTCHA again. If `true`, the TOKEN's expire time will be extended to 45min.

### Get Schedule

#### Current Semester's Schedule

```
POST /schedule/oa/get/{TOKEN}/current
```

  - `data.success` Tells if the process finished successfully.
  - `data.schedule` An array of classes in schedule.

## License

MIT

## Author

Soha Jin <soha@lohu.info>

Student from Grade 2018.
