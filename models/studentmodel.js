const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    fname:{
        type:String,
    },
    lname:{
        type:String,
    },
    prn_no:{
        type:String,
    },
    branch:{
        type: String,
    },
    coursedetails:[
        {
            course: String,
            credit: Number,
            grade: String
        }
    ]
});

module.exports = new mongoose.model("student",studentSchema);