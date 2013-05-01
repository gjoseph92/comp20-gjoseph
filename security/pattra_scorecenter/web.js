// Express initialization
var express = require('express');
var app = express(express.logger());
app.use(express.bodyParser());
app.set('title', 'nodeapp');
app.set('views', __dirname + '/views')
app.set('view engine', 'jade')

var mongo = require('mongodb');
var mongoUri = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost:27017/security';
// var mongoUri = 'mongodb://heroku:go2db88@alex.mongohq.com:10054/app14856668';

app.all('/', function(req, res, next) {
  	res.header("Access-Control-Allow-Origin", "*"); 
  	res.header("Access-Control-Allow-Headers", "X-Requested-With");
	next();
});

app.post('/submit.json', function (request, response){
	if(!request.body["game_title"] ||
	   !request.body["username"] ||
	   !request.body["score"]) {
		console.log("Poorly formed JSON fields. Use game_title, username, score");
	}
	else {
		var date = new Date();
		request.body["created_at"] = date;
		mongo.Db.connect(mongoUri, function (err, db) {
   			db.collection('highscores', function(er, collection) {
	    		collection.insert(request.body, {safe: true}, function(er,rs) {
    			});
	  		});
		});  
	}
});

app.get('/highscores.json', function (request, response) {
    response.set('Content-Type', 'text/json');
	mongo.Db.connect(mongoUri, function (err, db) {
		db.collection('highscores', function(er, collection) {
			var cursor = collection.find(request.query);
			cursor.limit(10);
      		cursor.toArray(function(err, docs) {   
      		var numDocs = docs.length;
			if(numDocs > 0){
				function compare(a, b) {
					if(parseInt(a.score) < parseInt(b.score))
						return 1;
					if(parseInt(a.score) > parseInt(b.score))
						return -1;
					return 0;
				}

				docs.sort(compare);

 			  	var strJson = "";     
				for(var i = 0; i < numDocs;){
					strJson += '{ "game_title":"' + docs[i].game_title + '"'
					        +  ', "username":"' + docs[i].username + '"'
					        +  ', "score":"' + docs[i].score + '"'
					        +  ', "created_at":"' + docs[i].created_at + '"}';
					i=i+1;
					if(i < numDocs){strJson+=',';}
				}
        		strJson = '[' + strJson + ']';
				response.send(JSON.parse(strJson)); 	
				}
        	});
    	});
	});
});

app.get('/usersearch', function (request, response) {
    response.set('Content-Type', 'text/html');
	response.render('usersearch');
});

app.get('/user_results', function(request, response) {
    response.set('Content-Type', 'text/html');
	mongo.Db.connect(mongoUri, function (err, db) {
		db.collection('highscores', function(er, collection) {
			var cursor = collection.find(request.query);
      		cursor.toArray(function(err, docs) {
      			var results = new Array();
      			var numDocs = docs.length;

				if(numDocs > 0){
					function compare(a, b) {
						if(parseInt(a.score) < parseInt(b.score))
							return 1;
						if(parseInt(a.score) > parseInt(b.score))
							return -1;
						return 0;
					}

					docs.sort(compare);

					for(var i = 0; i < numDocs;){
						results[i] = {
							username: docs[i].username,
							game_title: docs[i].game_title,
							score: docs[i].score,
							created_at: docs[i].created_at
						};

						i=i+1;
					}
				} else {
					results[0] = {
						username: "User not found!",
						game_title: "n/a",
						score: "n/a"
					}
				}

				response.render('user_results', { content: results });
        	});
    	});
	});
});

app.get('/', function (request, response) {
	mongo.Db.connect(mongoUri, function (err, db) {
		db.collection('highscores', function(er, collection) {
			var cursor = collection.find();
      		cursor.toArray(function(err, docs) {
      			var scoresinfo = new Array();
      			var numDocs = docs.length;

				if(numDocs > 0){
					function compare(a, b) {
						if(parseInt(a.score) < parseInt(b.score))
							return 1;
						if(parseInt(a.score) > parseInt(b.score))
							return -1;
						return 0;
					}

					docs.sort(compare);

					for(var i = 0; i < numDocs;){
						scoresinfo[i] = {
							username: docs[i].username,
							game_title: docs[i].game_title,
							score: docs[i].score,
							created_at: docs[i].created_at
						};

						i=i+1;
					}
				}
				response.render('index', { content: scoresinfo });
        	});
    	});
	});
});

// Oh joy! http://stackoverflow.com/questions/15693192/heroku-node-js-error-web-process-failed-to-bind-to-port-within-60-seconds-of
app.listen(process.env.PORT || 3000);
