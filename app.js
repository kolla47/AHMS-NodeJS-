var express = require('express')
var mongojs = require('mongojs')
var JSAlert = require("js-alert");
var shortid = require('shortid');

var db = mongojs('mongodb://kolla:1234@cluster0-shard-00-00-slzkj.mongodb.net:27017/test1?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin', ['sample1','orders','issues'])

var app = express()
app.use(express.static('public'))
app.set('view engine','ejs')
app.use('/images',express.static('views/images'))


app.get('/',function(req,res){
	res.render('home')
})

app.get('/login',function(req,res){
	res.render('login')
})

app.get('/signup',function(req,res){
	res.render('signup')
})

app.get('/loginsubmit',function(req,res){
	var prodata = {
		rno : req.query.rno,
		pwd : req.query.pwd
	}
	db.sample1.find(prodata, function(err,dat){
		if(dat.length>0){
			if(req.query.rno == 'admin' && req.query.pwd == '1234'){
				var odata
				var idata
				db.orders.find({}, function(err,dat){
					if(err){
						console.log(err)
					}
					else{
						odata = dat
						db.issues.find({}, function(err,dat){
							if(err){
								console.log(err)
							}
							else{
								idata = dat
								res.render('admin',{ person : req.query.rno , orders : odata , issues : idata}) 
							}
						})
					}
				})
			}
			else{
				res.redirect('profiles/'+req.query.rno)
			}
		}
		else{
			console.log('profile does not exit or pwd incorrect!!')
			res.send('profile does not exit or pwd incorrect!!')
		}
	})
})

app.get('/signupsubmit',function(req,res){
	var prodata = {
		uid : req.query.uid,
		pwd : req.query.pwd,
		email : req.query.email,
		phno : req.query.phno,
		rno : req.query.rno
	}
	var cpwd = req.query.cpwd
	var pel
	if(prodata.pwd == cpwd && prodata.pwd!=""){
		db.sample1.find(prodata, function(err,dat){
			if(dat.length>0){
				console.log('profile already found')
				pel = "pf"
				res.render('signup', {data: pel})
			}
			else{``
				console.log('not there')
				db.sample1.insert(prodata,function(err,data){
					if (err) {
						console.log(err)
					}
					else{
						console.log('inserted succesfully')
						res.render('login')
					}
				})	
			}
		})
	}
	else{
		console.log('password doesnt match')		
		pel = 'pnm'
		res.render('signup',{data: pel})
	}

})

app.get('/profiles/:code',function(req,res){
	var a = req.params.code
	order = {
		id : a,
	}
	var odata
	var idata
	db.orders.find(order, function(err,dat){
		if(err){
			console.log(err)
		}
		else{
			odata = dat
			db.issues.find(order, function(err,dat){
				if(err){
					console.log(err)
				}
				else{
					idata = dat
					res.render('profiles',{ person : a , orders : odata , issues : idata}) 
				}
			})
		}
	})
})

app.get('/profiles/:code/neworder',function(req,res){
	res.render('neworder',{person : req.params.code})
})

app.get('/profiles/:code/newissue',function(req,res){
	var a = req.params.code
	order = {
		id : a,
	}
	var odata
	db.orders.find(order, function(err,dat){
		if(err){
			console.log(err)
		}
		else{
			odata = dat
			res.render('newissue',{person : req.params.code , orders:odata})
		}
	})
	
})

app.get('/newissuesubmit', function(req, res){
	var datetime = new Date();
    var datet = datetime.toISOString().slice(0,10)
    var uid = req.query.udig
    if(uid == null){
    	uid = ""
    }
	var issue = {
		id : req.query.id,
		uid : uid,
		comment : req.query.comment,
		date : datet,
		status : "pending"
	}
	db.issues.insert(issue,function(err,data){
		if (err) {
			console.log(err)
		}
		else{
			console.log('inserted succesfully')
			res.redirect('/profiles/'+req.query.id)
		}
	})
})

app.get('/newordersubmit',function(req,res){
	var wp = {
		shirts : 10,
		pants : 15,
		jeans : 20,
		shorts : 15,
		towels : 6,
		mundu : 10,
		bsheets : 15,
		pillowc : 5,
	}
	var ip = {
		shirts : 10,
		pants : 15,
		jeans : 15,
		shorts : 10,
		towels : 0,
		mundu : 10,
		bsheets : 7,
		pillowc : 0,
	}
	var tamount

	var wamount = (wp.shirts*req.query.shirts + wp.pants*req.query.pants + wp.jeans*req.query.jeans + wp.shorts*req.query.shorts + 
	wp.towels*req.query.towel + wp.mundu*req.query.mundu + wp.bsheets*req.query.bsheet + wp.pillowc*req.query.pillow)
	var iamount = (ip.shirts*req.query.shirts + ip.pants*req.query.pants + ip.jeans*req.query.jeans + ip.shorts*req.query.shorts + 
	ip.towels*req.query.towel + ip.mundu*req.query.mundu + ip.bsheets*req.query.bsheet + ip.pillowc*req.query.pillow) 
	
	if(req.query.wash == "on" && req.query.iron == "on"){
		tamount = wamount+iamount
	}
	else if(req.query.wash == "on" && req.query.iron != "on"){
		tamount = wamount
	}
	else if(req.query.wash != "on" && req.query.iron == "on"){
		tamount = iamount
	}
	var unid = shortid.generate()

    var datetime = new Date();
    var datet = datetime.toISOString().slice(0,10)

	var order = {
		date : datet,
		uid : unid,
		id : req.query.id,
		sem : req.query.sem,
		hostel : req.query.hostel,
		room: req.query.room,
		shirts : req.query.shirts,
		pants : req.query.pants,
		jeans : req.query.jeans,
		shorts : req.query.shorts,
		towels : req.query.towel,
		mundu : req.query.mundu,
		bsheets : req.query.bsheet,
		pillowc : req.query.pillow,
		wash :  req.query.wash,
		iron : req.query.iron,
		amount : tamount,
		status : "pending"
	}
	console.log(order)
	db.orders.insert(order,function(err,data){
		if (err) {
			console.log(err)
		}
		else{
			console.log('inserted succesfully')
			res.redirect('/profiles/'+req.query.id)
		}
	})
})

app.get('/profiles/admin/updateorder',function(req, res){
	var odata
	var idata
	db.orders.find({}, function(err,dat){
		if(err){
			console.log(err)
		}
		else{
			odata = dat
			db.issues.find({}, function(err,dat){
				if(err){
					console.log(err)
				}
				else{
					idata = dat
					res.render('updateorder',{ person : "admin", orders : odata , issues : idata}) 
				}
			})
		}
	})
}) 

app.get('/profiles/admin/updateissue',function(req, res){
	var odata
	var idata
	db.orders.find({}, function(err,dat){
		if(err){
			console.log(err)
		}
		else{
			odata = dat
			db.issues.find({}, function(err,dat){
				if(err){
					console.log(err)
				}
				else{
					idata = dat
					res.render('updateissue',{ person : "admin", orders : odata , issues : idata}) 
				}
			})
		}
	})
}) 

app.get('/updateordersubmit',function(req,res){
	var upid = req.query.udig
	var nstatus = req.query.stat

	db.orders.findAndModify({
	    query: { uid: upid },
	    update: { $set: { status: nstatus } },
	    new: true
	}, function (err, doc, lastErrorObject) {
	})
	db.orders.find({}, function(err,dat){
		if(err){
			console.log(err)
		}
		else{
			odata = dat
			db.issues.find({}, function(err,dat){
				if(err){
					console.log(err)
				}
				else{
					idata = dat
					res.render('admin',{ person : 'admin' , orders : odata , issues : idata}) 
				}
			})
		}
	})
})

app.get('/updateissuesubmit',function(req,res){
	var upid = req.query.udig
	var nstatus = req.query.stat

	db.issues.findAndModify({
	    query: { uid: upid },
	    update: { $set: { status: nstatus } },
	    new: true
	}, function (err, doc, lastErrorObject) {
	})
	db.orders.find({}, function(err,dat){
		if(err){
			console.log(err)
		}
		else{
			odata = dat
			db.issues.find({}, function(err,dat){
				if(err){
					console.log(err)
				}
				else{
					idata = dat
					res.render('admin',{ person : 'admin' , orders : odata , issues : idata}) 
				}
			})
		}
	})
})

app.listen(8000, function(){
	console.log("server started.")
})