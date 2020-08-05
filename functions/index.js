const functions = require('firebase-functions');
//const admin = require('firebase-admin');
const { db } = require('./utils/admin');
require('dotenv').config();

const serviceAccount = require('./key/key.json');

// admin.initializeApp({
// 	credential: admin.credential.cert(serviceAccount),
// 	databaseURL: process.env.REACT_APP_BASEURL
// });

const express = require('express');
const app = express();

const { signup, login } = require('./handlers/users');

// Users handle
app.post('/signup', signup);
app.post('/login', login);

// todos handle
app.get('/todos', (req, res) => {
	db.collection('todo')
		.get()
		.then((data) => {
			let todos = [];
			data.forEach((doc) => {
				todos.push(doc.data());
			});
			return res.json(todos);
		})
		.catch((err) => {
			console.error(err);
		});
});

app.post('/todo', (req, res) => {
	const newToDo = {
		title: req.body.title,
		body: req.body.body,
		createdAt: new Date().toISOString()
	};

	db.collection('todo')
		.add(newToDo)
		.then((doc) => {
			const resTodo = newToDo;
			resTodo.todoId = doc.id;
			res.json(resTodo);
		})
		.catch((err) => {
			res.status(500).json({ error: 'something went wrong' });
			console.error(err);
		});
});

exports.api = functions.region('europe-west1').https.onRequest(app);
