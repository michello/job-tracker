const mongoose = require('mongoose');
const User = require('../app/models/user');
const Application = require('../app/models/application');
const Interview = require('../app/models/interview');

const helper = require('../app/helper.js');
const moment = require('moment');
const stringify = require('json-stringify-safe');

module.exports = function(app, passport) {
	app.use((req, res, next) => {
		res.locals.user = req.user;
		res.locals.error = req.flash('error');
		next();
	});

	app.get('/', isLoggedIn, function(req, res) {
		Application.find({'user': res.locals.user}, function(err, apps) {
			if (err) {
				res.render('index', {error: err});
			} else {
				applications = helper.organize(apps);
				res.render('index', {
					applied: applications.applied,
					hackerrank: applications.hackerrank,
					phone: applications.phone,
					onsite: applications.onsite,
					rejected: applications.rejected
				});
			}
		});
	});

	app.get('/login', function(req, res) {
		let errorMessage = req.flash('error');
		res.render('login');
	});

	app.post('/login', passport.authenticate('local-login', {
		successRedirect: '/',
		failureRedirect:'/login',
		failureFlash: true
	}));

	app.get('/logout', function(req, res) {
		req.logOut();
		res.redirect('/');
	});

	app.get('/register', function(req, res) {
		res.render('register');
	});

	app.post('/register', passport.authenticate('local-register', {
		successRedirect: '/',
		failureRedirect: '/register',
		failureFlash: true
	}));

	app.get('/add-app', isLoggedIn, function(req, res) {
		res.render('add-app');
	});
	app.post('/add-app', isLoggedIn, function(req, res) {
		let date =  moment().format('MMMM Do YYYY');

		new Application({
			company: req.body.company,
			position: req.body.position,
			applied: date,
			user: req.user
		}).save(function(err, app) {
			if (err) {
				res.render('add-app', {error: err});
			}
			res.redirect('/');
		});
	});

	app.get('/edit/:slug', isLoggedIn, function(req, res) {
		Application.findOne({'_id': req.params.slug}, 
			function(err, app) {
				if (err) {
					res.redirect('/', {error:'You are editing an invalid application!'});
				} else {
					Interview.find({'job_id': app._id}, function(err, interviews) {
							let inter = interviews.filter(interview => interview.type != "Applied");
							res.render('edit-app', {app:app, interviews:inter});
					});
				};
		});
	});

	app.post('/edit/:slug', isLoggedIn, function(req, res) {
		if (req.body.stage === 'rejected') {
			Application.findOneAndUpdate({'_id': req.params.slug}, {
				$set: {
					status: false,
					stage: req.body.stage
				}
			}, function(err, app) {
				if (err) {
					res.render('index', {error: 'Something with wrong with editing the application!'});
				} else {
					res.redirect('/');
				}
			});
		} else {
			Application.findOneAndUpdate({'_id': req.params.slug}, {
				$set: {
					stage: req.body.stage
				}
			}, function(err, app) {
				if (err) {
					res.render('index', {error: 'Something with wrong with editing the application!'});
				} else {
					if (req.body.stage != 'Applied' && req.body.stage != 'Rejected') {
						new Interview({
							job_id: app._id,
							type: req.body.stage,
							user: res.locals.user
						}).save(function(err, interview) {
							if (err) {
								res.redirect('/', {error:err});
							} else {
								res.redirect('/');
							}
						});
					} else {
						res.redirect('/');
					}
				}
			});
		}
	});

	app.post('/add-comment/:app_id/:status', isLoggedIn, function(req, res) {
		
		let app_id = req.params.app_id;
		let status = req.params.status;
		let comment = req.body.comment;

		Interview.findOneAndUpdate({'job_id': app_id, 'type': status},
			{ $addToSet: {"comments": comment}}, 
			function(err, app) {
				if (err) {
					console.log(err);
				}
				res.redirect(`/edit/${app_id}`);

		});
	});

	app.get('/filter', isLoggedIn, function(req, res) {
		let request = req.query.search;
		const data = [];
		Application.find({'company': request}, function(err, apps){
			if (err) {

			} else {
				apps.forEach(function(app) {
					data.push(app);
				});
			}
			
		});
		Application.find({'position': request}, function(err, apps){
			if (!err) {
				apps.forEach(function(app) {
					data.push(app);
				});
			}
			
		});
		Application.find({'status': request}, function(err, apps){
			if (!err) {
				apps.forEach(function(app) {
					data.push(app);
				});
			}
			
		});
		res.render('filter', {data:data});
	});


	app.get('/:user/progress', isLoggedIn, function(req, res) {
		if (req.params.user != res.locals.user.local.username) {
			res.redirect('/');
		}
		Application.find({'user': res.locals.user}, function(err, apps) {
			let apps_obj = {};
			apps.forEach(function(app) {
				apps_obj[app._id] = {};
				apps_obj[app._id].meta_data = {};
				apps_obj[app._id].interviews = [];
				apps_obj[app._id].meta_data.company = app.company;
				apps_obj[app._id].meta_data.position = app.position;
			});
			Interview.find({'user': res.locals.user}, function(err, interviews) {
				interviews.forEach(function(interview){
					apps_obj[interview.job_id]['interviews'].push(interview.type);
				});
				res.render('progress', {apps: JSON.stringify(apps_obj)});
			});
		});
	});

	app.get('*', isLoggedIn, function(req, res) {
		Application.find({}, function(err, apps) {
			if (err) {
				res.render('index', {error: err});
			} else {
				applications = helper.organize(apps);
				res.render('index', {
					applied: applications.applied,
					hackerrank: applications.hackerrank,
					phone: applications.phone,
					onsite: applications.onsite,
					rejected: applications.rejected,
					error: "Page not found!"
				});
			}
		});
	});

	function isLoggedIn(req, res, next) {
		if (req.isAuthenticated()) {
			return next();
		}
		res.redirect('/login');
	}

};
