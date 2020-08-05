const { admin, db } = require('../utils/admin');

const config = require('../utils/config');
const firebase = require('firebase');
firebase.initializeApp(config);

const { user } = require('firebase-functions/lib/providers/auth');

const {
	validateSignupData,
	validateLoginData
} = require('../utils/validators');

// Sign user up
exports.signup = (req, res) => {
	const newUser = {
		email: req.body.email,
		password: req.body.password,
		confirmPassword: req.body.confirmPassword,
		userName: req.body.userName
	};

	const { errors, valid } = validateSignupData(newUser);
	if (!valid) return res.status(400).json(errors);

	let token, userId;
	db.doc(`/users/${newUser.userName}`)
		.get()
		.then((doc) => {
			if (doc.exists) {
				return res.status(400).json({ userName: 'This name is alrety taken' });
			} else {
				return firebase
					.auth()
					.createUserWithEmailAndPassword(newUser.email, newUser.password);
			}
		})
		.then((data) => {
			userId = data.user.uid;
			return data.user.getIdToken();
		})
		.then((idToken) => {
			token = idToken;
			const userCredentials = {
				userName: newUser.userName,
				email: newUser.email,
				createdAt: new Date().toISOString(),
				userId
			};
			return db.doc(`/users/${newUser.userName}`).set(userCredentials);
		})
		.then(() => {
			return res.status(201).json({ token });
		})
		.catch((err) => {
			console.error(err);
			if (err.code === 'auth/email-already-in-use') {
				return res.status(400).json({ email: 'Email is already is use' });
			} else {
				return res
					.status(500)
					.json({ general: 'Something went wront, please try again.' });
			}
		});
};

exports.login = (req, res) => {
	const user = {
		email: req.body.email,
		password: req.body.password
	};

	const { errors, valid } = validateLoginData(user);
	if (!valid) return res.status(400).json(errors);

	firebase
		.auth()
		.signInWithEmailAndPassword(user.email, user.password)
		.then((data) => {
			return data.user.getIdToken();
		})
		.then((token) => {
			return res.json({ token });
		})
		.catch((err) => {
			console.error(err);

			return res
				.status(403)
				.json({ general: 'Wrong credentials, please try again' });
		});
};
