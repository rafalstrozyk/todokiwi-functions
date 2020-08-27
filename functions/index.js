const functions = require('firebase-functions');
const { db } = require('./utils/admin');
require('dotenv').config();

// firebase serve

const serviceAccount = require('./key/key.json');

const express = require('express');
const app = express();

const fbAuth = require('./utils/fbAuth');
const { signup, login, logout } = require('./handlers/users');
const { createColumn, getColumns, deleteColumn } = require('./handlers/userColumn');
const { createTodo, getTodos,deleteTodo } = require('./handlers/todos');

// Users handle
app.post('/signup', signup);
app.post('/login', login);
app.post('/logout', logout);

// columns handle
app.post('/column', fbAuth, createColumn);
app.get('/columns', fbAuth, getColumns);
app.delete('/column', fbAuth, deleteColumn);

// todos handle
app.post('/todo', fbAuth, createTodo);
app.get('/todos', fbAuth, getTodos);
app.delete('/todo', fbAuth, deleteTodo);

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

exports.api = functions.region('europe-west1').https.onRequest(app);
