jwt에 대한 자세한 정보는 블로그에 작성 해놓았습니다.<br>
[jwt 블로그 링크](https://velog.io/@qmdch1/JWT%EC%97%90-%EB%8C%80%ED%95%B4%EC%84%9C-%EC%95%8C%EA%B3%A0-%EA%B3%84%EC%8B%AD%EB%8B%88%EA%B9%8C)

# 개념을 알았으니 JWT 소스를 구현 해봅시다.
```
"dependencies": {
	"body-parser": "^1.20.2",
	"express": "^4.18.2",
	"jsonwebtoken": "^9.0.1"
}
```
1. body-parser는 express req에서 body의 데이터를 가져오기 위하여 사용합니다.
body-parser에서 urlencoded를 true로 설정하는 이유는 false로 되어있을경우 key-value로만 데이터를 조회하기 때문에 중첩된 객체에서는 데이터를 제대로 가져 올 수가 없으니, true로 설정해줍니다.

2. express는 웹 서버를 구동 시키기 위해서 사용합니다.

3. jsonwebtoken은 jwt를 사용하기 편리하게 해주는 패키지 입니다.



## 먼저 login 했을 경우에 토큰을 반환 해주는 기능 입니다.
```
router.post('/login', (req, res, next) => {
	const token = jsonwebtoken.sign(
	{
		type: 'JWT',
		name: req.body.name,
		profile: req.body.profile
	}, secret_key, {
		expiresIn: '15m',
		issuer: '토큰 발급자',
	});
	
	return res.status(200).json({
		code: 200,
		message: '토큰이 발급 되었습니다.',
		token: token
	});
});
```
jsonwebtoken을 이용해서 token이라는 변수를 생성 해 주었고, 이를 반환해주고 있습니다.

<br>

## 두번째는 jwt가 정상적인지 확인하는 미들웨어 입니다.
```
app.use((req, res, next) => {
    try{
        const decode = jsonwebtoken.verify(req.headers.authorization, secret_key);
        return res.status(200).json({
            code: 200,
            message: '정상적인 토큰입니다.',
            data: decode
        });
        // return next();
    }

    catch(error){
        console.log(error);
        if(error.name === 'TokenExpiredError'){
            return res.status(419).json({
                code: 419,
                message: '토큰이 만료되었습니다.'
            });
        }

        if(error.name === 'JsonWebTokenError'){
            return res.status(401).json({
                code: 401,
                message: '유효하지 않은 토큰입니다.'
            });
        }
    }
});
```
header에 authorization로 토큰을 보냈을때, 복호화를 시도하며,

토큰 기간 만료 : TokenExpiredError

유효하지 않은 토큰 : JsonWebTokenError

비 정상적인 토큰일 경우 에러를 반환 해줍니다.

본 예제에서는 return 을 해주었지만 middle웨어를 사용하기 위해서는 return next(); 로 다음 과정 넘어가게 수정해야 합니다.

<br>

## 전체 소스 입니다.
```
import jsonwebtoken from 'jsonwebtoken';
import express from 'express';
import bodyParser from 'body-parser';

const app = express();
const router = express.Router();
const secret_key = "secret_key";

app.use(bodyParser.json()); // body의 데이터를 가져오기 위해서
app.use(bodyParser.urlencoded({ extended: true})); // 중첩된 파싱을 사용하기 위해서
app.use('/', router);

app.listen(3000, () => {
    console.log('http oepn : localhost:3000')
});

router.post('/login', (req, res, next) => {
    const token = jsonwebtoken.sign(
    {
        type: 'JWT',
        name: req.body.name,
        profile: req.body.profile
    }, secret_key, {
        expiresIn: '15m',
        issuer: '토큰 발급자',
    });

    return res.status(200).json({
        code: 200,
        message: '토큰이 발급 되었습니다.',
        token: token
    });
});

app.use((req, res, next) => {
    try{
        const decode = jsonwebtoken.verify(req.headers.authorization, secret_key);
        return res.status(200).json({
            code: 200,
            message: '정상적인 토큰입니다.',
            data: decode
        });
        // return next();
    }

    catch(error){
        console.log(error);
        if(error.name === 'TokenExpiredError'){
            return res.status(419).json({
                code: 419,
                message: '토큰이 만료되었습니다.'
            });
        }

        if(error.name === 'JsonWebTokenError'){
            return res.status(401).json({
                code: 401,
                message: '유효하지 않은 토큰입니다.'
            });
        }
    }
});
```
