/*
用来定义路由的路由器模块
 */
const express = require('express')
const md5 = require('blueimp-md5')
const bodyParser=require('body-parser')
const mysql=require('mysql')

const db=mysql.createConnection({
	host:"localhost",
	user:'root',
	password:"1234",
	database:"employ",
	multipleStatements: true // 支持执行多条 sql 语句
})

// 得到路由器对象
const router = express.Router()

// 指定需要过滤的属性
const filter = {password: 0, __v: 0}

// 登陆前台
router.post('/loginu',(req, res) => {
  const {account, password,remember} = req.body
  // 根据username和password查询数据库users, 如果没有, 返回提示错误的信息, 如果有, 返回登陆成功信息(包含user)
 const query=`SELECT * from account where account= '${account}' and password= '${password}'`;
 const query2=`UPDATE account set checked ='${remember}' where account= '${account}' `
 const query3=`UPDATE account set checked ='0' where checked='1' `
 db.query(query,function(err,result){
	if(err)throw err;
	if(result.length==0){
		res.send({status: 1, msg: '用户名或密码不正确!'})
       	 }else{
	    if(remember==1){
            db.query(query3)
            db.query(query2)
        }

		res.send({status: 0, data: result})}
    })
    
})

// 登陆后台
router.post('/loginm',(req, res) => {
	const {username, password,remember} = req.body
	// 根据username和password查询数据库users, 如果没有, 返回提示错误的信息, 如果有, 返回登陆成功信息(包含user)
	const query=`SELECT * from manager_role where username= '${username}' and password= '${password}'`;
	const query2=`UPDATE manager set checked ='${remember}' where username= '${username}' `
	const query3=`UPDATE manager set checked ='0' where checked='1' `
	db.query(query,function(err,result){
		if(err)throw err;
		if(result.length==0){
			res.send({status: 1, msg: '用户名或密码不正确!'})
		}else{
			if(remember==1){
				db.query(query3)
				db.query(query2)
			}
			res.send({status: 0, data: result})}
	})
})

//找checked为1的manager
router.get('/checkedm',(req, res) => {
    const query=`SELECT * from manager_role where checked='1'`;
    const query2=`UPDATE manager set checked ='0' where checked='1' `
    db.query(query,function(err,result){
            res.send({status: 0, data: result})
    })
})

//找checked为1的user
router.get('/checkedu',(req, res) => {
	const query=`SELECT * from account where checked='1'`;
	const query2=`UPDATE account set checked ='0' where checked='1' `
	db.query(query,function(err,result){
		res.send({status: 0, data: result})
	})
})

// 注册管理员
router.post('/registerm',(req, res) => {
    const {username,password1,email,phone}=req.body
	const checked=0
	const user={username,password:password1,email,telephone:phone,checked}
	// 根据username和password查询数据库users, 如果没有, 注册成功并登录, 如果有, 返回用户已存在
	const  query=`Insert INTO manager SET ?`
	db.query(query,user,function(err,result){
		if(err){
			throw err
		    res.send({status: 1, msg: '用户名已经存在!'});
		    return new Promise(() => {})
		}
        else{res.send({status: 0, data: result})}
	})
})

// 注册用户
router.post('/registeru',(req, res) => {
	const {username,account,password1,email,phone}=req.body
	const create_time=Date.now()
	const checked=0
	const user={username,account,password:password1,email,telephone:phone,create_time,checked}
	// 根据username和password查询数据库users, 如果没有, 注册成功并登录, 如果有, 返回用户已存在
	const  query=`Insert INTO account SET ?`
	db.query(query,user,function(err,result){
		if(err){
			throw err
			res.send({status: 1, msg: '用户名已经存在!'});
			return new Promise(() => {})
		}
		else{res.send({status: 0, data: result})}
	})
})

//获取用户user列表
router.get('/user/list',(req, res) => {
	const query = `SELECT * from account `
	db.query(query, function (err, result) {
		if (err) {
			console.log('11111')
			res.send({status: 1, msg: '用户获取列表失败!'});
			return new Promise(() => {})
		} else {
			res.send({status: 0, data: result})
		}
	})
})

//添加用户user
router.post('/user/add',(req, res) => {
	const {username,password,email,telephone}=req.body
	const create_time=Date.now()
	const query = `INSERT INTO account(username,password,email,telephone,create_time,checked) VALUES ('${username}','${password}','${email}','${telephone}','${create_time}',0) `
	db.query(query, function (err, result) {
		if (err) {
			res.send({status: 1, msg: '用户名已存在，添加用户失败!'});
			return new Promise(() => {})
		} else {
			res.send({status: 0, data: result})
		}
	})
})

//修改用户user
router.post('/user/update',(req, res) => {
	const {username,account,email,telephone,userId}=req.body
	const query = `UPDATE account set username ='${username}',email='${email}',account='${account}',telephone='${telephone}' where userId='${userId}'`
	db.query(query, function (err, result) {
		if (err) {
			res.send({status: 1, msg: '修改用户信息失败!'});
			return new Promise(() => {})
		} else {
			res.send({status: 0, data: result})
		}
	})
})

//删除用户user
router.post('/user/delete',(req, res) => {
	const {userId}=req.body
	const query = `DELETE FROM account where userId='${userId}'`
	db.query(query, function (err, result) {
		if (err) {
			//throw err
			res.send({status: 1, msg: '删除用户失败!'});
			return new Promise(() => {})
		} else {
			res.send({status: 0, data:result})
		}
	})
})

//获取企业enterprise列表
router.get('/enterprise/list',(req, res) => {
	const query = `SELECT * from enterprise `
	//const query2= `SELECT * from role `
	db.query(query, function (err, result) {
		if (err) {
			res.send({status: 1, msg: '企业获取列表失败!'});
			return new Promise(() => {})
		} else {
			res.send({status: 0, data: result})
		}
	})
})

//添加企业enterprise
router.post('/enterprise/add',(req, res) => {
	const {username,password,enterName,founder,enterCreTime,telephone,enterCreti,enterDetail}=req.body
	const query = `INSERT INTO enterprise(username,password,enterName,founder,enterCreTime,telephone,enterCreti,enterDetail) 
					VALUES ('${username}','${password}','${enterName}','${founder}','${enterCreTime}','${telephone}','${enterCreti}','${enterDetail}') `
	db.query(query, function (err, result) {
		if (err) {
			res.send({status: 1, msg: '用户名已存在，添加用户失败!'});
			return new Promise(() => {})
		} else {
			res.send({status: 0, data: result})
		}
	})
})

//修改企业enterprise
router.post('/enterprise/update',(req, res) => {
	const {enterId,username,enterName,founder,enterCreTime,telephone,enterCreti,enterDetail}=req.body
	const query = `UPDATE enterprise set enterName ='${enterName}',username='${username}',enterCreTime='${enterCreTime}',founder='${founder}',telephone='${telephone}' 
						,enterCreti='${enterCreti}',enterDetail='${enterDetail}' where enterId='${enterId}'`
	db.query(query, function (err, result) {
		if (err) {
			res.send({status: 1, msg: '修改用户信息失败!'});
			return new Promise(() => {})
		} else {
			res.send({status: 0, data: result})
		}
	})
})

//删除企业enterprise
router.post('/enterprise/delete',(req, res) => {
	const {enterId}=req.body
	const query = `DELETE FROM enterprise where enterId='${enterId}'`
	db.query(query, function (err, result) {
		if (err) {
			//throw err
			res.send({status: 1, msg: '删除用户失败!'});
			return new Promise(() => {})
		} else {
			res.send({status: 0, data:result})
		}
	})
})


// 一级/二级分类列表
router.get('/category/list',(req, res) => {
	const {parentId}=req.query
	if(parentId=="0"){
		const  query=`SELECT * from profession `
		db.query(query,function(err,result){
			if(err){
				res.send({status: 1, msg: '获取列表失败!'});
				return new Promise(() => {
				})
			}
			else{
				res.send({status: 0, data: result})
			}
		})
	}
	else {
		const  query=`SELECT * from profession_category where profeId='${parentId}'`
		db.query(query,function(err,result){
			if(err){
				res.send({status: 1, msg: '获取列表失败!'});
				return new Promise(() => {
				})
			}
			else{
				res.send({status: 0, data: result})
			}
		})
	}

})

// 修改分类列表
router.post('/category/update',(req, res) => {
    const {categoryName,categoryId,categoryContent}=req.body
    if(categoryContent==undefined){
        const  query=`UPDATE profession set profetype='${categoryName}' where profeId='${categoryId}' `
				db.query(query,function(err,result){
					if(err){
						res.send({status:1, msg: '更新失败，类别不可为空或已存在相同类别!'});
						return new Promise(() => {})
					}
					else{
						res.send({status:0, data: result})
					}
				})
    }
    else if(categoryContent){
        const  query=`UPDATE profession_category set occuptype='${categoryName}',occupdetail='${categoryContent}' where occupId='${categoryId}'`
				db.query(query,function(err,result){
					if(err){
						res.send({status: 1, msg: '更新失败，类别不可为空或已存在相同类别!'});
						return new Promise(() => {})
					}
					else{
						res.send({status: 0, data: result})
					}
				})
    }
})

// 添加分类列表
router.post('/category/add',(req, res) => {
	const {categoryName,parentId,categoryContent,categoryId}=req.body
	if(categoryContent==undefined){
		const  query=`INSERT INTO  profession VALUES ('${categoryId}','${categoryName}') `
		db.query(query,function(err,result){
			if(err){
				res.send({status: 1, msg: '更新失败，已存在相同类别!'});
				return new Promise(() => {})
			}
			else{
				res.send({status: 0, data: result})
			}
		})
	}
	else if(categoryContent){
		const  query=`INSERT INTO  profession_category(occuptype,occupdetail,profeId) VALUES ('${categoryName}','${categoryName}','${parentId}')`
		db.query(query,function(err,result){
			if(err){
				res.send({status: 1, msg: '更新失败，类别不可为空或已存在相同类别!'});
				return new Promise(() => {})
			}
			else{
				res.send({status: 0, data: result})
			}
		})
	}
})

//删除类别role
router.post('/category/delete',(req, res) => {
	const {categoryId}=req.body
	const query = `DELETE FROM profession_category where occupId='${categoryId}'`
	db.query(query, function (err, result) {
		if (err) {
			//throw err
			res.send({status: 1, msg: '失败!'});
			return new Promise(() => {})
		} else {
			res.send({status: 0, data:result})
		}
	})
})

//获取roles列表
router.get('/role/list',(req, res) => {
    const query = `SELECT * from role `
    db.query(query, function (err, result) {

        if (err) {
            res.send({status: 1, msg: '获取列表失败!'});
            return new Promise(() => {})
        } else {
            res.send({status: 0, data: result})
        }
    })
})

//添加角色role
router.post('/role/add',(req, res) => {
    const {roleName}=req.body
	const date=Date.now()
    const query = `INSERT INTO role(role_name,create_time) value ('${roleName}','${date}')`
    db.query(query, function (err, result) {
        if (err) {
        	//throw err
            res.send({status: 1, msg: '添加角色失败!'});
            return new Promise(() => {})
        } else {
            res.send({status: 0, data:result})
        }
    })
})

//设置角色role权限
router.post('/role/update',(req, res) => {
    const {role_name,menus,auth_time,auth_name}=req.body
    const menus2=menus.join(",")
    const query = `UPDATE role set menus ='${menus2}',auth_time='${auth_time}',auth_name='${auth_name}'where role_name='${role_name}'`
    db.query(query, function (err, result) {
        if (err) {
            //throw err
            res.send({status: 1, msg: '授权失败!'});
            return new Promise(() => {})
        } else {
            res.send({status: 0, data:result})
        }
    })
})

//删除角色role
router.post('/role/delete',(req, res) => {
	const {roleName}=req.body
	const query = `DELETE FROM role where role_name='${roleName}'`
	db.query(query, function (err, result) {
		if (err) {
			//throw err
			res.send({status: 1, msg: '失败!'});
			return new Promise(() => {})
		} else {
			res.send({status: 0, data:result})
		}
	})
})

//获取管理员managers列表和role列表
router.get('/manager/list',(req, res) => {
	const query = `SELECT * from manager ;SELECT * from role `
	//const query2= `SELECT * from role `
	db.query(query, function (err, result) {
		if (err) {
			res.send({status: 1, msg: '获取列表失败!'});
			return new Promise(() => {})
		} else {
			res.send({status: 0, data: result})
		}
	})
})

//添加管理员managers
router.post('/manager/add',(req, res) => {
	const {username,password,email,telephone,role_name}=req.body
	const query = `INSERT INTO  manager(username,password,email,telephone,role_name,checked) VALUES ('${username}','${password}','${email}','${telephone}','${role_name}',0) `
	db.query(query, function (err, result) {
		if (err) {
			res.send({status: 1, msg: '添加管理员用户失败!'});
			return new Promise(() => {})
		} else {
			res.send({status: 0, data: result})
		}
	})
})

//修改管理员managers
router.post('/manager/update',(req, res) => {
	const {username,password,email,telephone,role_name,managerId}=req.body
	const query = `UPDATE manager set username ='${username}',email='${email}',telephone='${telephone}',role_name='${role_name}'where managerId='${managerId}'`
	db.query(query, function (err, result) {
		if (err) {
			res.send({status: 1, msg: '添加管理员用户失败!'});
			return new Promise(() => {})
		} else {
			res.send({status: 0, data: result})
		}
	})
})

//删除管理员manager
router.post('/manager/delete',(req, res) => {
	const {roleName}=req.body
	const query = `DELETE FROM manager where role_name='${roleName}'`
	db.query(query, function (err, result) {
		if (err) {
			res.send({status: 1, msg: '失败!'});
			return new Promise(() => {})
		} else {
			res.send({status: 0, data:result})
		}
	})
})

//添加简历resume
router.post('/home/resume/add',(req, res) => {
	const {resume,userId}=req.body
	const createtime=Date.now()
    let defa=0
    const query2=`SELECT * from resume where userId='${userId}'`
    db.query(query2,function (err,result) {
        if(result.length===0)defa=1
        else defa=0
        const query = `INSERT INTO  resume(rname,sex,birth,education,telephone,workclassify,place,salary,introduce,userId,create_time,loadtime,scantime,default1 ) 
                        VALUES ('${resume.name}','${resume.sex}','${resume.birth}','${resume.education}','${resume.telephone}','${resume.workclassify}','${resume.place}','${resume.salary}','${resume.introduce}','${userId}','${createtime}',0,0,'${defa}') `
        db.query(query, function (err, result1) {
            if (err) {
                throw err
                res.send({status: 1, msg: '添加简历失败!'});
                return new Promise(() => {})
            } else {
                res.send({status: 0, data: result1})
            }
        })
        })
})

//获取简历resume
router.post('/home/resume/list',(req, res) => {
	const {userId}=req.body
	const query = `SELECT * from resume where userId='${userId}'`
	db.query(query, function (err, result) {
		if (err) {
			res.send({status: 1, msg: '获取简历失败!'});
			return new Promise(() => {})
		} else {
			res.send({status: 0, data: result})
		}
	})
})

//删除管理员manager
router.post('/home/resume/delete',(req, res) => {
	const {resumeid}=req.body
	const query = `DELETE FROM resume where resumeid='${resumeid}'`
	db.query(query, function (err, result) {
		if (err) {
			//throw err
			res.send({status: 1, msg: '失败!'});
			return new Promise(() => {})
		} else {
			res.send({status: 0, data:result})
		}
	})
})

//修改简历resume
router.post('/home/resume/update',(req, res) => {
    const {resume,resumeid}=req.body
    const {name,sex,birth,worktime,education,telephone,workclassify,place,salary,introduce,userId,create_time,loadtime,scantime}=resume
    const createtime=Date.now()
    const query = `UPDATE resume set rname ='${name}',sex='${sex}',birth='${birth}',worktime='${worktime}',education='${education}',telephone='${telephone}',workclassify='${workclassify}',place='${place}',introduce='${introduce}',create_time='${createtime}'where resumeid='${resumeid}'`
    db.query(query, function (err, result) {
        if (err) {
            res.send({status: 1, msg: '添加管理员用户失败!'});
            return new Promise(() => {})
        } else {
            res.send({status: 0, data: result})
        }
    })
})

//获取收藏信息favorite
router.post('/home/favorite',(req, res) => {
    const {userId}=req.body
    const query = `SELECT * from favorite where userId='${userId}'`
    db.query(query, function (err, result) {
        if (err) {
            res.send({status: 1, msg: '获取收藏列表失败!'});
            return new Promise(() => {})
        } else {
            res.send({status: 0, data: result})
        }
    })
})

//获取被收藏信息befavorite
router.get('/home/befavorite',(req, res) => {
    const {userId}=req.body
    const query = `SELECT * from befavorite `
    db.query(query, function (err, result) {
        if (err) {
            res.send({status: 1, msg: '获取收藏列表失败!'});
            return new Promise(() => {})
        } else {
            res.send({status: 0, data: result})
        }
    })
})

//删除收藏favorite
router.post('/home/favorite/delete',(req, res) => {
    const {favoriteid}=req.body
    const query = `DELETE FROM favorite where favoriteid='${favoriteid}'`
    db.query(query, function (err, result) {
        if (err) {
            res.send({status: 1, msg: '失败!'});
            return new Promise(() => {})
        } else {
            res.send({status: 0, data:result})
        }
    })
})

//获取投递信息deliver
router.post('/home/deliver',(req, res) => {
    const {userId}=req.body
    const query = `SELECT * from deliver where userId='${userId}'`
    db.query(query, function (err, result) {
        if (err) {
            res.send({status: 1, msg: '获取收藏列表失败!'});
            return new Promise(() => {})
        } else {
            res.send({status: 0, data: result})
        }
    })
})

//获取指定投递信息详情
router.post('/home/deliver/emdetail',(req, res) => {
    const {employid,userId}=req.body
    const query = `SELECT * from recruit where employid='${employid}'and userId='${userId}'`
    db.query(query, function (err, result) {
        if (err) {
            res.send({status: 1, msg: '获取收藏列表失败!'});
            return new Promise(() => {})
        } else {
            res.send({status: 0, data: result})
        }
    })
})

//获取指定投递信息详情
router.post('/home/deliver/emdetail',(req, res) => {
    const {employid,userId}=req.body
    const query = `SELECT * from recruit where employid='${employid}'and userId='${userId}'`
    db.query(query, function (err, result) {
        if (err) {
            res.send({status: 1, msg: '获取收藏列表失败!'});
            return new Promise(() => {})
        } else {
            res.send({status: 0, data: result})
        }
    })
})

//获取简历resume
router.post('/recruit/list',(req, res) => {
	const query = `SELECT * from profession_category `
	db.query(query, function (err, result) {
		if (err) {
			res.send({status: 1, msg: '获取列表失败!'});
			return new Promise(() => {})
		} else {
			res.send({status: 0, data: result})
		}
	})
})




//fore

//获取企业enterprise详细
router.post('/business/enterprise/detail',(req, res) => {
	const {userId}=req.body
	const query = `SELECT * from enterprise Where  userId='${userId}'`
	//const query2= `SELECT * from role `
	db.query(query, function (err, result) {
		if (err) {
			res.send({status: 1, msg: '企业获取信息失败!'});
			return new Promise(() => {})
		} else {
			res.send({status: 0, data: result})
		}
	})
})

//修改企业enterprise
router.post('/business/enterprise/update',(req, res) => {
	const {enterId,enterName,industry,properties,enterscale,personscale,contactper,telephone,email,enterDetail,address,welfare,feature}=req.body
	const query = `UPDATE enterprise set enterName ='${enterName}',industry='${industry}',properties='${properties}',enterscale='${enterscale}',personscale='${personscale}',contactper='${contactper}'
					,telephone='${telephone}',email='${email}',enterDetail='${enterDetail}',address='${address}',welfare='${welfare}',feature='${feature}' where enterId='${enterId}'`
	db.query(query, function (err, result) {
		if (err) {
			res.send({status: 1, msg: '修改用户信息失败!'});
			return new Promise(() => {})
		} else {
			res.send({status: 0, data: result})
		}
	})
})

//添加招聘信息employ
router.post('/business/employ/add',(req, res) => {
	const {recruit,enter,userId}=req.body
	const {emname,category,needamount,salarymin,salarymax,education,welfare,workplace,workdetail,contactper,telephone,email}=recruit
	const {entername,workclassify,enterdetail,enterplace,fulladdress}=enter
	const createtime=Date.now()
	const query = `INSERT INTO  recruit(emname,category,needamount,salarymin,salarymax,education,welfare,workplace,workdetail,
									   contactper,telephone,email,entername,workclassify,enterdetail,enterplace,fulladdress,create_time,userId) 
					VALUES ('${emname}','${category}','${needamount}','${salarymin}','${salarymax}','${education}','${welfare}','${workplace}','${workdetail}',
					'${contactper}','${telephone}','${email}','${entername}','${workclassify}','${enterdetail}','${enterplace}','${fulladdress}','${createtime}','${userId}')`
	db.query(query, function (err, result) {
		if (err) {
			throw err
			res.send({status: 1, msg: '添加简历失败!'});
			return new Promise(() => {})
		} else {
			res.send({status: 0, data: result})
		}
	})
})

//获取招聘信息recruit
router.post('/business/employ/list',(req, res) => {
	const {userId}=req.body
	const query = `SELECT * from recruit Where  userId='${userId}'`
	db.query(query, function (err, result) {
		if (err) {
			res.send({status: 1, msg: '获取招聘信息失败!'});
			return new Promise(() => {})
		} else {
			res.send({status: 0, data: result})
		}
	})
})

//修改招聘信息employ
router.post('/business/employ/update',(req, res) => {
	const {employid,value}=req.body
	const {emname,category,needamount,salarymin,salarymax,education,welfare,workplace,workdetail,contactper,telephone,email,entername,workclassify,enterdetail,enterplace,fulladdress}=value
	const create_time=Date.now()
	const query = `Update recruit set emname='${emname}',category='${category}',needamount='${needamount}',salarymin='${salarymin}',salarymax='${salarymax}',education='${education}',welfare='${welfare}',
                    workplace='${workplace}',workdetail='${workdetail}',contactper='${contactper}',telephone='${telephone}',email='${email}',entername='${entername}',workclassify='${workclassify}',
                    enterdetail='${enterdetail}',enterplace='${enterplace}',fulladdress='${fulladdress}',create_time='${create_time}'where employid='${employid}' `
	db.query(query, function (err, result) {
		if (err) {
			res.send({status: 1, msg: '修改简历失败!'});
			return new Promise(() => {})
		} else {
			res.send({status: 0, data: result})
		}
	})
})

//删除招聘信息employ
router.post('/business/employ/delete',(req, res) => {
	const {employid}=req.body
	const query = `DELETE FROM recruit where employid='${employid}'`
	db.query(query, function (err, result) {
		if (err) {
			//throw err
			res.send({status: 1, msg: '失败!'});
			return new Promise(() => {})
		} else {
			res.send({status: 0, data:result})
		}
	})
})

//获取全部简历resume
router.get('/recruit/recruit/list',(req, res) => {
    const query = `SELECT * from recruit `
    db.query(query, function (err, result) {
        if (err) {
            res.send({status: 1, msg: '获取列表失败!'});
            return new Promise(() => {})
        } else {
            res.send({status: 0, data: result})
        }
    })
})

//获取招聘信息recruit是否被收藏
router.post('/recruit/recruit/detail/favor',(req, res) => {
	const {employid,userId}=req.body
	const query = `SELECT * from favorite Where  userId='${userId}' and employid='${employid}'`
	db.query(query, function (err, result) {
		if (err) {
			res.send({status: 1, msg: '获取招聘信息失败!'});
			return new Promise(() => {})
		} else {
			res.send({status: 0, data: result})
		}
	})
})

//添加收藏效信息favorite
router.post('/recruit/recruit/detail/setfavor',(req, res) => {
	const {employid,emname,userId,icon}=req.body
	const create_time=Date.now()
	const query1 = `INSERT INTO  favorite(employid,emname,userId,create_time) VALUES ('${employid}','${emname}','${userId}','${create_time}')`
	const query2 = `DELETE from favorite WHERE userId='${userId}'`
	if(icon===false){
		db.query(query1, function (err, result) {
			if (err) {
				res.send({status: 1, msg: '收藏失败!'});
				return new Promise(() => {})
			} else {
				res.send({status: 0, data: true})
			}
		})
	}else {
		db.query(query2, function (err, result) {
			if (err) {
				res.send({status: 1, msg: '取消收藏失败!'});
				return new Promise(() => {})
			} else {
				res.send({status: 0, data: false})
			}
		})
	}

})

//获取招聘信息公司信息
router.post('/recruit/recruit/enterdetail',(req, res) => {
	const {enterId}=req.body
	const query = `SELECT * from enterprise Where  enterId='${enterId}' `
	db.query(query, function (err, result) {
		if (err) {
			res.send({status: 1, msg: '获取招聘信息失败!'});
			return new Promise(() => {})
		} else {
			res.send({status: 0, data: result})
		}
	})
})


//添加申请职位deliver
router.post('/recruit/recruit/detail/apply',(req, res) => {
	const {employid,emname,rename,userId}=req.body
	const state='投递成功，等待审核'
	const create_time=Date.now()
    const query3= `SELECT resumeid from resume Where  userId='${userId}' and default1=1`
    db.query(query3,function (err, result) {
        const {resumeid}=result[0]
        const query = `INSERT INTO  deliver(employid,emname,state,userId,resumeid,create_time) VALUES ('${employid}','${emname}','${state}','${userId}','${resumeid}','${create_time}') `
        const query2 =`UPDATE recruit set apply=apply+1 where employid='${employid}'`
        db.query(query, function (err, result1) {
            if (err) {
                throw err
                res.send({status: 1, msg: '申请失败!'});
                return new Promise(() => {})
            } else {
                db.query(query2)
                res.send({status: 0, data: result1})
            }
        })
    })

})

//获取是否已经投递该职位
router.post('/recruit/recruit/posidetail',(req, res) => {
	const {employid,userId}=req.body
	const query = `SELECT * from deliver Where  userId='${userId}' and employid='${employid}'`
	db.query(query, function (err, result) {
		if (err) {
			res.send({status: 1, msg: '获取投递信息失败!'});
			return new Promise(() => {})
		} else {
			res.send({status: 0, data: result})
		}
	})
})

//查看招聘信息并增加浏览次数
router.post('/recruit/recruit/addscan',(req, res) => {
	const {employid}=req.body
	const query = `UPDATE  recruit set scan=scan+1 where employid='${employid}'`
	db.query(query, function (err, result) {
		if (err) {
			res.send({status: 1, msg: '获取列表失败!'});
			return new Promise(() => {})
		} else {
			res.send({status: 0, data: result})
		}
	})
})


/*
//获取简历resume
router.get('/manager/list',(req, res) => {
	const query = `SELECT * from manager `
	db.query(query, function (err, result) {
		
		if (err) {
			res.send({status: 1, msg: '获取列表失败!'});
			return new Promise(() => {})
		} else {
			res.send({status: 0, data: result})
		}
	})
})

//添加管理员managers
router.post('/manager/add',(req, res) => {
	const {username,password,email,telephone,role_name}=req.body
	const query = `INSERT INTO  manager(username,password,email,telephone,role_name,checked) VALUES ('${username}','${password}','${email}','${telephone}','${role_name}',0) `
	db.query(query, function (err, result) {
		if (err) {
			res.send({status: 1, msg: '添加管理员用户失败!'});
			return new Promise(() => {})
		} else {
			res.send({status: 0, data: result})
		}
	})
})

//删除管理员users
router.post('/manager/delete',(req, res) => {
	const {roleName}=req.body
	const query = `DELETE FROM manager where role_name='${roleName}'`
	db.query(query, function (err, result) {
		if (err) {
			//throw err
			res.send({status: 1, msg: '失败!'});
			return new Promise(() => {})
		} else {
			res.send({status: 0, data:result})
		}
	})
})
* */

module.exports = router