const mongoose = require('mongoose');
const schema = mongoose.Schema;

const valueSchema = schema({
    idDevice1:{
        type: String
    },
    idDevice2:{
        type: String
    },
    ipDevice1:{
        type: String
    },
    ipDevice2:{
        type: String
    },
    deviceType1:{
        type: String
    },
    deviceType2:{
        type: String
    },
    valuePh:{
        type: Number
    },
    valueTurbidty:{
        type: Number
    }, 
    StatusTimeServer_pH: {
        type: String
    },
    StatusTimeServer_turbid: {
        type: String
    },
    displayLog1:{
        type: String
    },
    displayLog2:{
        type: String
    }
}, {timestamps: true});
const db = mongoose.model('water-environment', valueSchema);
module.exports = db;