const { db } = require('../utils/admin');

// Create todo
exports.createTodo = (req, res) => {
	if (req.body.body.trim() === '') {
		return res.status(400).json({ body: 'Body must not be empty' });
	}

	const newTodo = {
		columnId: req.body.columnId,
		userName: req.user.userName,
		body: req.body.body,
		createdAt: new Date().toISOString()
	};

	db.doc(`/columns/${req.body.columnId}`)
		.get()
		.then((doc) => {
			if (!doc.exists) {
				return res.status(400).json({ columnId: 'Column not found' });
			}
			return doc.ref.update({ todos: doc.data().todos + 1 });
		})
		.then(() => {
			return db.collection('todo').add(newTodo);
		})
		.then(() => {
			return res.json(newTodo);
		})
		.catch((err) => {
			console.log(err);
			res.status(500).json({ error: 'Something went wrong' });
		});
};

// get todos from column
exports.getTodos = (req, res) => {
	if (req.body.columnId.trim() === '') {
		return res.status(400).json({ columnId: 'columnId must not be empty' });
	}

	db.collection('todo')
		.orderBy('createdAt', 'desc')
		.where('columnId', '==', req.body.columnId)
		.get()
		.then((data) => {
			data.forEach((doc) => {
				let todoColumn = [];
				data.forEach((doc) => {
					todoColumn.push({
						id: doc.data().uid,
						body: doc.data().body,
						columnId: doc.data().columnId,
						createdAt: doc.data().createdAt,
						userName: doc.data().userName
					});
                });
                return res.json(todoColumn)
            });   
        })
        .catch(err => {
            console.error(err);
        })
        
};
