const { db } = require('../utils/admin');

// create column
exports.createColumn = (req, res) => {
	if (req.body.title.trim() === '') {
		return res.status(400).json({ title: 'Title must not be empty' });
	}

	const newColumn = {
		title: req.body.title,
		userName: req.user.userName,
		createdAt: new Date().toISOString(),
		todos: 0
	};

	db.collection('columns')
		.add(newColumn)
		.then((doc) => {
			const resColumn = newColumn;
			(resColumn.columnId = doc.id), res.json(resColumn);
		})
		.catch((err) => {
			res.status(500).json({ error: 'Something went wrong' });
			console.log(err);
		});
};

// Show all user columns
exports.getColumns = (req, res) => {
	db.collection('columns')
		.orderBy('createdAt', 'desc')
		.where('userName', '==', req.user.userName)
		.get()
		.then((data) => {
			data.forEach((doc) => {
				let userColumns = [];
				data.forEach((doc) => {
					userColumns.push({
                        columnId: doc.id,
                        createdAt: doc.data().createdAt,
						title: doc.data().title,
						todos: doc.data().todos,
						userName: doc.data().userName
					});
				});
				return res.json(userColumns);
			});
		})
		.catch((err) => {
			console.error(err);
		});
};


