"use strict";

const async = require('async');
const ClientModel = require('../model/clientModel');
const UserModel = require('../../users/model/userModel');
const randomstring = require('randomstring');
const nodemailer = require("nodemailer");
const smtpTransport = require('../../../config/nodemailer.config');
const helper = require('../../../helpers/titleCase');

const mapRequest = (client, clientDetails) => {
	if (clientDetails.name)
		client.name = helper.titleCase(clientDetails.name);
	if (clientDetails.address)
		client.address = helper.titleCase(clientDetails.address);
	if (clientDetails.contactPerson)
		client.contactPerson = helper.titleCase(clientDetails.contactPerson);
	if (clientDetails.phoneNumber)
		client.phoneNumber = clientDetails.phoneNumber;
	if (clientDetails.mobileNumber)
		client.mobileNumber = clientDetails.mobileNumber;
	if (clientDetails.email)
		client.email = clientDetails.email.toLowerCase().trim();
	if (clientDetails.areaofBusiness)
		client.areaofBusiness = helper.titleCase(clientDetails.areaofBusiness);
	if (clientDetails.logo)
		client.logo = helper.titleCase(clientDetails.logo);
	if (clientDetails.activeStatus == true)
		client.activeStatus = true;
	if (clientDetails.activeStatus == false)
		client.activeStatus = false;

	return client;
};

// Create endpoint /api/clients - new user for POSTS
exports.postClients = function(clientDetails) {
	return new Promise(function(resolve, reject) {
		const newModel = new ClientModel();
		const newClient = mapRequest(newModel, clientDetails);
		ClientModel.findOne({
			name: helper.titleCase(clientDetails.name),
			phoneNumber: clientDetails.phoneNumber,
			email: clientDetails.email ? clientDetails.email.toLowerCase().trim() : null
		}, (err, existingClient) => {
			if (err)
				reject(err);
			if (existingClient)
				reject({
					result: 'Client with that username already exists!'
				});

			newClient.save((err) => {
				if (err) {
					reject(err);
				}
				resolve({
					result: 'New client profile sucessfully created!',
				});
			});
		});
	});
};

// Create endpoint /api/clients for GET
exports.getClients = function(cond) {
	return new Promise(function(resolve, reject) {
		ClientModel.aggregate([{
			"$match": cond
		}, {
			$lookup: {
				"from": "users",
				"localField": "_id",
				"foreignField": "client_id",
				"as": "user"
			}
		}], function(err, clients) {
			if (err)
				reject(err);
			resolve(clients);
		});
	});
};

// Create endpoint /api/clients/:client_id for GET
exports.getClientById = function(client_id) {
	return new Promise(function(resolve, reject) {
		ClientModel.findById({
			_id: client_id
		}, function(err, client) {
			if (err)
				reject(err);
			if (client)
				resolve(client);
			else
				reject({
					message: "User not found!"
				})
		});
	});
};

// Create endpoint /api/clients/:client_id for DELETE
// TODO: Delete client only if no devices assigned exists for client
// if device assigned only deactivate the client
exports.deleteClient = function(client_id) {
	return new Promise(function(resolve, reject) {
		ClientModel.findOneAndRemove({
			_id: client_id
		}, function(err, client) {
			if (err)
				reject(err);
			if (client)
				resolve({
					message: 'Client account has been deleted!'
				});
			else
				reject({
					message: "Client not found!"
				});
		});
	});
};


// Create endpoint /api/clients/:client_id for PUT
exports.updateClient = function(client_id, clientUpdates) {
	return new Promise(function(resolve, reject) {
		ClientModel.findById({
			_id: client_id
		}, function(err, client) {
			if (err)
				reject(err);
			if (!client) {
				reject({
					message: "Client not found!"
				});
			} else {
				const Client = mapRequest(client, clientUpdates);
				Client.save(function(err) {
					if (err)
						reject(err);
					resolve({
						message: 'Client details updated sucessfully!'
					});
				});
			}
		});
	});
};

// Create endpoint /api/clients/add-credentilas for POST
exports.createUser = function(client_id) {
	return new Promise(function(resolve, reject) {
		ClientModel.findById({
			_id: client_id
		}, function(err, client) {
			if (err)
				reject(err);
			if (!client) {
				reject({
					message: "Client not found!"
				});
			} else {
				let clientEmail = client.email;
				let clientId = client._id;
				let newUserName = client.name.toLowerCase().substring(0, 3) + Math.floor((Math.random() * 999) + 1);
				let newPassword = randomstring.generate(6);
				let clientName = client.name;

				async.waterfall([
					function newLoginCredentials(done) {
						UserModel.findOne({
							client_id: clientId
						}, (err, user) => {
							if (err) {
								return done(err);
							}
							if (user) {
								return done({
									result: `Account for ${clientEmail} exist.`
								});
							}

							let newUserCredentials = new UserModel({
								username: newUserName,
								password: newPassword,
								client_id: clientId
							});

							newUserCredentials.save((err, newCredentials) => {
								done(err, newCredentials);
							});
						});
					},
					function updateClientMailStatus(newCredentials, done) {
						ClientModel.findByIdAndUpdate(client._id, {
							mailStatus: true
						}, (err, updated) => {
							if (err) {
								return done(err);
							} else {
								done(null, updated);
							}
						});
					},
					function mailLoginCredentials(newCredentials, done) {
						const mailOptions = {
							to: clientEmail + ',nastracking@gmail.com',
							from: 'Nepal Ambulance Tracking System - Automail <nastracking@gmail.com>',
							subject: 'Nepal Ambulance Tracking System - Login credentials ✔',
							html: 'Hello Mr. and  Mrs. <b>' +
								clientName + '</b>, </br><p>Welcome to Nepal Ambulance Tracking System. To finish setting up Nepal Ambulance Tracking System account, please follow the simple steps outlined below: </br><div><ul>Please login using following credentials </ul> <li>Username : <strong>' +
								newUserName + '</strong></li> <li>Password: <b>' +
								newPassword + '</b></li> </ul> </ul> </div> <p>If you have already logged in – that`s great. If you have trouble logging in, feel free to talk to our team. Our customer support team is always here for you.</p> </br> <div><a href="#" target="_blank">Contact Spark Customer Support</a></br><p>Please refer to this email, if in the future you have trouble accessing your account. </p><p>All the best</p><div>'
						};
						smtpTransport.sendMail(mailOptions, (err) => {
							done(err);
						});
					}
				], (err) => {
					if (err) {
						reject(err);
					}
					resolve({
						result: 'New user credentials has been created and mailed.'
					});
				});
			}
		});
	});
};