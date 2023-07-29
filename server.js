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