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

exports.deleteColumn = (req, res) => {
	if (req.body.columnId.split() === '') {
		return res.status(400).json({ columnId: 'Column id must not be empty' });
	}

	const column = db.collection('columns').doc(req.body.columnId);

	column
		.get()
		.then((doc) => {
			if (doc.exists) {
				if (doc.data().userName !== req.user.userName) {
					return res.status(403).json({ error: 'Unauthorized' });
				} else {
					db.collection('todo')
						.where('userName', '==', req.user.userName)
						.where('columnId', '==', req.body.columnId)
						.get()
						.then((document) => {
							const batch = db.batch();

							document.forEach((doc) => {
								batch.delete(doc.ref);
							});

							return batch.commit();
						})
						.then(() => {
							column.delete();
						})
						.then(() => {
							res.json({ message: 'Column and todos deleted succesfully' });
						})
						.catch((err) => {
							console.error(err);
							res.status(500).json({ error: err.code });
						});
				}
			} else {
				console.log('No such document!');
				return res.status(404).json({ message: 'No such column' });
			}
		})
		.catch((err) => {
			console.log('Error getting document: ' + err);
		});
};
