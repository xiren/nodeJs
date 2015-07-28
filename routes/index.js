/*
 * GET home page.
 */
var crypto = require('crypto');
var User = require('../node_modules/user');
var Post = require('../node_modules/post');

exports.index = function(req, res) {
	Post.get(null, function(err, posts) {
		if (err) {
			posts = [];
		}
		res.render('index', {
			title: '首页',
			posts: posts
		})
	})
};

/*
exports.hello = function(req, res) {
	res.send('The time is ' + new Date().toString());
};

exports.user = function(req, res) {
	res.send('user : ' + req.params.username);
};

var util = require('util');

exports.userAll = function(req, res, next) {
	var user = {
		'vs': {
			name: 'VS',
			description: 'VS is a girl'
		}
	}
	if (user[req.params.username]) {
		console.log(util.inspect(user[req.params.username],true));
		next();
	} else {
		next(new Error(req.params.username + ' does not exit.'));
	}
};
*/

exports.user = function(req, res) {
	User.get(req.params.user, function(err, user) {
		if (!user) {
			req.flash('error', '用户不存在');
			return res.redirect('/');
		}
		Post.get(user.name, function(err, posts) {
			if (err) {
				req.flash('error', err);
				return res.redirect('/');
			}
			res.render('user', {
				title: user.name,
				posts: posts,
			})
		})
	})
};
exports.post = function(req, res) {
	var currentUser = req.session.user;
	var post = new Post(currentUser.name, req.body.post);
	post.save(function(err) {
		if (err) {
			req.flash('error', err);
			return res.redirect('/');
		}
		req.flash('success', '发表成功');
		return res.redirect('/u/' + currentUser.name);
	})
};
exports.reg = function(req, res) {
	res.render('reg', {
		title: '用户注册'
	});
};
exports.doReg = function(req, res) {
	if (req.body['repeat-password'] != req.body['password']) {
		req.flash('error', '两次口令不一致');
		return res.redirect('/reg');
	}
	var md5 = crypto.createHash('md5');
	var password = md5.update(req.body.password).digest('base64');
	var newUser = new User({
		name: req.body.username,
		password: password,
	});
	User.get(newUser.name, function(err, user) {
		if (user)
			err = '用户名已经存在';
		if (err) {
			req.flash('error', err);
			return res.redirect('/reg');
		}
		newUser.save(function(err) {
			if (err) {
				req.flash('error', err);
				return res.redirect('/reg');
			}
			req.session.user = newUser;
			req.flash('success', '注册成功');
			res.redirect('/')
		})
	});
};
exports.login = function(req, res) {
	res.render('login', {
		title: '用户登入'
	})
};
exports.doLogin = function(req, res) {
	var md5 = crypto.createHash('md5');
	var password = md5.update(req.body.password).digest('base64');

	User.get(req.body.username, function(err, user) {
		if (!user) {
			req.flash('error', '用户不存在');
			return res.redirect('/login');
		}
		if (user.password != password) {
			req.flash('error', '用户名或密码不对');
			return res.redirect('/login');
		}
		req.session.user = user;
		req.flash('success', '登录成功');
		res.redirect('/')
	})
};

exports.logout = function(req, res) {
	req.session.user = null;
	req.flash('success', '登出成功');
	res.redirect('/')
};


exports.checkLogin = function(req, res, next) {
	if (!req.session.user) {
		req.flash('error', '未登入');
		return res.redirect('/login');
	}
	next();
};

exports.checkNotLogin = function(req, res, next) {
	if (req.session.user) {
		req.flash('error', '已登入');
		return res.redirect('/')
	}
	next();
};
/*
module.exports = function(app){
	app.get('/', function(req, res){
		res.render('index', {
			title : 'index'
		});
	});

	app.get('/reg', function(req, res){
		res.render('reg', {
			title:'regist'
		});
	});
}
*/