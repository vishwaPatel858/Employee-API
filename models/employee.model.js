
const mongoose = require('mongoose');
const EmployeeSchema = mongoose.Schema(
    {
        name : {
            type : 'string',
            required : [true,"employee name is required"],
        },
        email :{
            type : 'string',
            required : [true,"employee email is required"],
        },
        password : {
            type : 'string',
            required : [true,"employee password is required"],
        }
    },
    {
        timestamps: true 
    }
);

const empployee = mongoose.model('Employee',EmployeeSchema);
module.exports = empployee;