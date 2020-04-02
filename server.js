/*
应用的启动模块
1. 通过express启动服务器
2. 通过mongoose连接数据库
  说明: 只有当连接上数据库后才去启动服务器
3. 使用中间件
 */
const mysql= require('mysql')
const express = require('express')
const bodyParser=require('body-parser')
const app = express() // 产生应用对象

// 声明使用静态中间件

// 声明使用解析post请求的中间件
app.use(express.urlencoded({extended: true})) // 请求体参数是: name=tom&pwd=123
app.use(express.json()) // 请求体参数是json结构: {name: tom, pwd: 123}
// 声明使用解析cookie数据的中间件
const cookieParser = require('cookie-parser')
app.use(cookieParser())
// 声明使用路由器中间件
const indexRouter = require('./routers/backindex')
app.use('/', indexRouter)  //

const fs = require('fs')

// 必须在路由器中间之后声明使用
/*app.use((req, res) => {
  fs.readFile(__dirname + '/public/index.html', (err, data)=>{
    if(err){
      console.log(err)
      res.send('后台错误')
    } else {
      res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
      });
      res.end(data)
    }
  })
})*/


const db=mysql.createConnection({
    host:"localhost",
    user:'root',
    password:"1234",
    database:"employ"
})

db.connect((err)=>{
    if(err){
        throw err;
    } else {
        console.log('连接成功')
    }

})
app.listen(5000,()=>{
    console.log("服务器开启在5000端口")
})

