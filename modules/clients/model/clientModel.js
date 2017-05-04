const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const clientSchema = new Schema({
	name: {
		type: String,
		required: true,
		unique: true
	},
	address: String,
	contactPerson: String,
	phoneNumber: {
		type: String,
		required: true,
		unique: true
	},
	mobileNumber: String,
	email: {
		type: String,
		unique: true,
		sparse: true
	},
	areaofBusiness: String,
	logo: String,
	activeStatus: {
		type: Boolean,
		default: true
	},
	mailStatus: {
		type: Boolean,
		default: false
	},
}, {
	timestamps: true
});

const Client = mongoose.model('Client', clientSchema);

module.exports = Client;