const functions = require('firebase-functions');
require('dotenv').config();

const app = require('express')();

const cors = require('cors');
// firebase serve

const fbAuth = require('./utils/fbAuth');
const { signup, login, logout } = require('./handlers/users');
const { createColumn, getColumns, deleteColumn } = require('./handlers/userColumn');
const { createTodo, getTodos,deleteTodo } = require('./handlers/todos');

app.use(cors);

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


exports.api = functions.region('europe-west1').https.onRequest(app);
