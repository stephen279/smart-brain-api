const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');
const { response } = require('express');

//const baseURL = "http://localhost:3001/"

const db = knex({
  // Enter your own database information here based on what you created
  client: 'pg',
  connection: {
  /*  host : 'protected-gorge-67490',
    user : 'ukgalxtnaedflh',
    password : '',
	 database : 'smart-brain'*/
	  //from docs
	  connectionString: process.env.DATABASE_URL,
	  ssl: true,
	  
  }
});

//console.log(db.select('*').from('users').then(data => {
	//console.log(data);
//})); 

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

app.use(cors());
app.use(bodyParser.json());

/*app.get('/', (req, res) => {
	res.send(database.users);
});*/

app.get('/', (req, res) => {
res.send("it's working!");
});



app.post('/signin', (req, res) => {
	db.select('email', 'hash')
		.from('logins')
		.where('email', '=', req.body.email)
		.then((data) => {
			const isValid = bcrypt.compareSync(req.body.password, data[0].hash);
			console.log(isValid);
			if (isValid) {
				return db.select('*').from('users')
					.where('email', '=', req.body.email)
					.then(user => {
						console.log(user);
						res.json(user[0])
					})
					.catch(err => res.status(400).json('unable to get user'))
				
			} else {
				res.status(400).json('wrong Credential');
			}
		})
		.catch(err => res.status(400).json('wrong password credentials'));
	
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