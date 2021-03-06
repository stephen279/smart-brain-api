const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');
const { response } = require('express');
var session = require('express-session');
var jwt = require('jsonwebtoken');
const { json } = require('body-parser');


//const baseURL = "http://localhost:3001/"

const db = knex({
  // Enter your own database information here based on what you created
  client: 'pg',
  connection: {
  /*  host : 'protected-gorge-67490',
    user : 'ukgalxtnaedflh',
    password : '',
	 database : 'smart-brain'
	 
	 ec2-54-157-100-65.compute-1.amazonaws.com
	 database: d7eh0ncbgjqr8t
	user: ukgalxtnaedflh
5432
59c9a7ef6a603ea37b1c8721ea761c468feeca1760bdd9fe8ca513db9a65c86e


  host : 'ec2-54-157-100-65.compute-1.amazonaws.com',
    user : 'ukgalxtnaedflh',
    password : '59c9a7ef6a603ea37b1c8721ea761c468feeca1760bdd9fe8ca513db9a65c86e',
	 database : 'd7eh0ncbgjqr8t'
	 user: ukgalxtnaedflh


	 const db = knex({
  // connect to your own database here
  client: 'pg',
  connection: {
    host : 'ec2-54-157-100-65.compute-1.amazonaws.com',
    user : 'aneagoie',
    password : '59c9a7ef6a603ea37b1c8721ea761c468feeca1760bdd9fe8ca513db9a65c86e',
    database : 'd7eh0ncbgjqr8t'
  }
});
	 
	 
	 
	 */
	  
	  //from docs
	  connectionString: process.env.DATABASE_URL,
	  ssl: {
      rejectUnauthorized: false
    }
	  
  }
});



const database = {
	users: [
		{
			id: '123',
			name: 'stephen',
			password: 'cookies'
		},
		{
			id: '124',
			namme: 'stephen',
			password: 'cookies'
		}
	]
}

const app = express();


app.use(cors({
    origin: '*'
}));
app.options('*', cors()) // include before other routes
app.use(bodyParser.json());

app.use(session({
  secret: 'secret',
  resave: false,
  secure: false,
	cookie: {
	   path    : '/',
    httpOnly: false,
    maxAge: 24 * 60 * 60 * 365 * 1000
	},
	
  

}))




app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


/*app.get('/', (req, res) => {
	res.send(database.users);
});*/

const redirectlogin = (req, res) => {
	if (!req.session) {
		res.redirect('/signin')
	} else {
		next();
	}

}

const signToken = (email) =>{
	const jwtPayload = { email };
	var token = jwt.sign(jwtPayload, 'JWT_SECRET');
	
}

const createSessions = (user) => {
	//LWT toke and return user data install package
	const { email, id } = user;
	var token = signToken(email);
	return {success: 'true', userId:id, token}

}



app.post('/signin',  (req, res) => {
	
console.log("session inside /signin"+req.session.authenticated);


	if (!req.session.authenticated) {
		 


		db.select('email', 'hash')
			.from('logins')
			.where('email', '=', req.body.email)

			.then((data) => {

				//new line
			
			

				const isValid = bcrypt.compareSync(req.body.password, data[0].hash);
				console.log(isValid);
				if (isValid) {
					//console.log("inside signinhh server valid");
console.log("inside signinhhtest server valid");
					return db.select('*').from('users')
						.where('email', '=', req.body.email)
						.then(user => {
		
						
							req.session.authenticated = true;
							req.session.user = req.body.email;
		
							//res.send("/home");
							const { email, id } = user;
							var token = signToken(email);
      	
							res.json(user[0], token);
							console.log(user[0], token);
							//posible fault
							//return data.id && data.email ? createSessions(data) : Promise.reject(data);
							//return token;
						})
						.catch(err => res.status(400).json('unable to get user and no seesion set ' + req.session.user))
				
				} else {
					res.status(400).json('wrong Credential');
				}
			})
			.then(session => res => json(session))
		.catch(err => res.status(400).json('wrong password credentials'));
	}

	  else {
    res.status(200).json({ msg: "Already signind in" });
  }
	
})




app.get('/' , (req, res) => {
	

	console.log("inside home route and session userauth " + req.session.authenticated);

	//session = req.session;
	//session.userid = "stephennew";
	
	if (req.session.authenticated) {

		res.status(200).json('session');
		//console.log(res.send("session ok" + req.session.userid + " "));
	} else {
		//next();
		res.status(400).json('No session');
		//res.send("session NO" + req.session.userid + " ");
		//}
	
	}

});

function ensureAuthentication(req, res, next) {
	console.log(req.session);
  // Complete the if statmenet below:
  if (!req.session.authenticated) {
    return next();
  } else {
    res.status(200).json({ msg: "Already signind in" });
  }
}



/*
app.get('/', (req, res) => {
	if (req.session.views) {
		req.session.userid = "test";
		console.log(req.session.views);
		console.log(req.sessionID);
		
    req.session.views++;
  }
  else {
    req.session.views = 1;
  }
  res.send(`${req.session.userid} views`);
})

	//req.session.user = "tom@m.com";
	//req.session.user = req.body.email;
	//console.log("check session is ---------"+req.session.user);

	//return condition ? session : Nosession;
	/*	if (req.session.user != "") {
			res.send("session");
		}else {
			//res.send("NoSession");
			res.status(400).json('No Session');
		}
		next();
		
	});
	
	
	
	
	
	app.get('/', function(req, res){
		if(req.session.userid){
			req.session.page_views++;
			res.send("You visited this page " + req.session.userid + " times");
		} else {
			req.session.page_views = 1;
			res.send("Welcome to this page for the first time!");
		}
	});
	
	
	*/
	


app.post('/signout', (req, res) => {
	//req.session = req.body.email;

	req.session.destroy();
	//req.session.destroy();
	const user = "11111";
	  //userId=req.session.userid;
	//req.session.id = user;
	//req.session = null // Deletes the cookie.

	console.log("session after logout user is--------"+req.session);
	console.log("inside lougout");
	res.json("signedout"+req.session);



	
	
})


	
  /*if (req.body.email === database.users[0].email && req.body.passwords) {
    res.json('success');
  } else {
    res.status(400).json('error logging in');
  }
})*/



/*app.post('/signin', (req, res) => {
	db
		.select('email', 'hash')
		.from('login')
		.where('email', '=', req.body.email)
		.then((data) => {
			const isValid = bcrypt.compareSync(req.body.password, data[0].hash);
			if (isValid) {
				return db
					.select('*')
					.from('users')
					.where('email', '=', req.body.email)
					.then((user) => {
						res.json(user[0]);
					})
					.catch((err) => res.status(400).json('unable to get user'));
			} else {
				res.status(400).json('wrong credentials');
			}
		})
		.catch((err) => res.status(400).json('wrong credentials'));
});
*/



app.post('/register', (req, res) => {
  const { email, name, password } = req.body;
	const hash = bcrypt.hashSync(password);
	console.log("inside register in server");
    db.transaction(trx => {
      trx.insert({
        hash: hash,
        email: email
      })
      .into('logins')
      .returning('email')
      .then(loginEmail => {
        return trx('users')
          .returning('*')
          .insert({
            email: loginEmail[0],
            name: name,
            joined: new Date()
          })
          .then(user => {
            res.json(user[0]);
          })
      })
      .then(trx.commit)
      .catch(trx.rollback)
    })
    .catch(err => res.status(400).json('unable to register'))
})

/*
app.post('/register', (req, res) => {
	
	const { email, name, password } = req.body;
	console.log(name);
		
	db('users')
		.returning('*')
		.insert({
			email: email,
			name: name,
			joined: new Date()
		})
		.then(user => {
			
			res.json(user[0]);
		})
		.catch(err => res.status(400).json("unable to register"))
	
})

*/
app.get('/profile/:id', (req, res) => {
	const { id } = req.params;
	db
		.select('*')
		.from('users')
		.where({ id })
		.then((user) => {
			if (user.length) {
				res.json(user[0]);
			} else {
				res.status(400).json('Not found');
			}
		})
		.catch((err) => res.status(400).json('error getting user'));
});

app.put('/image', (req, res) => {

		console.log("inside signinhh");
	const { id } = req.body;
	db('users')
		.where('id', '=', id)
		.increment('entries', 1)
		.returning('entries')
		.then((entries) => {
			res.json(entries[0]);
		})
		.catch((err) => res.status(400).json('unable to get entries'));
});

/*app.listen(3000, () => {
	console.log('app is running on port 3000');
});*/

app.listen(process.env.PORT || 3000, () => {
console.log(`app is running on port ${process.env.PORT}`);
});