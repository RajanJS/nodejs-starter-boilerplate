const UserModel = require('../model/userModel');

// Create endpoint /api/users - new user for POSTS
exports.postUsers = function(userDetails) {
	return new Promise(function(resolve, reject) {
		const user = new UserModel({
			username: userDetails.username,
			password: userDetails.password
		});

		UserModel.findOne({
			username: userDetails.username
		}, (err, existingUser) => {
			if (err)
				reject(err);

			if (existingUser)
				reject({
					result: 'Account with that username already exists!'
				});

			user.save((err) => {
				if (err) {
					reject(err);
				}
				resolve({
					result: 'New client, login credentials created!'
				});
			});
		});
	});
};

// Create endpoint /api/users for GET
exports.getUsers = function() {
	return new Promise(function(resolve, reject) {
		UserModel.find({}, function(err, user) {
			if (err)
				reject(err);
			resolve(user);
		});
	});
};

// Create endpoint /api/users/:user_id for GET
exports.getUserById = function(user_id) {
	return new Promise(function(resolve, reject) {
		UserModel.findById({
			_id: user_id
		}, function(err, user) {
			if (err)
				reject(err);
			if (user)
				resolve(user);
			else
				reject({
					result: "User not found!"
				})
		});
	});
};

// Create endpoint /api/users/:user_id for DELETE
exports.deleteUser = function(user_id) {
	return new Promise(function(resolve, reject) {
		UserModel.findOneAndRemove({
			_id: user_id
		}, function(err, user) {
			if (err)
				reject(err);
			if (user)
				resolve({
					result: 'User account has been deleted!'
				});
			else
				reject({
					result: "User not found!"
				});
		});
	});
};

// Create endpoint /api/users/:user_id for PUT
exports.updatePassword = function(user_id, passwords) {
	return new Promise(function(resolve, reject) {
		UserModel.findById({
			_id: user_id
		}, {
			password: 1
		}, function(err, user) {
			if (err)
				res.send(err);
			if (!user) {
				reject({
					result: "User not found!"
				});
			} else {
				user.verifyPassword(passwords.oldPassword, function(err, isMatch) {
					if (isMatch && !err) {
						user.password = passwords.newPassword;
						user.save(function(err) {
							if (err)
								reject(err);
							resolve({
								result: 'Password updated sucessfully!'
							});
						});
					} else {
						reject({
							result: 'Authentication failed, Wrong password!'
						});
					}
				});
			}

		});
	});
};
exports.updateUser = (id, userData) => {
	return new Promise(function(resolve, reject) {
		UserModel.findById(id, (err, User) => {
			if (err) {
				reject(err);
			}
			if (!User) {
				reject({
					result: "User not found"
				});
			} else {
				if (userData.activeStatus == true)
					User.activeStatus = true;
				if (userData.activeStatus == false)
					User.activeStatus = false;
				User.save((err) => {
					if (err) {
						reject(err);
					} else {
						resolve({
							result: "user status updated"
						})
					}
				})
			}

		})

	});
}