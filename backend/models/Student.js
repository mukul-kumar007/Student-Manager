const mongoose = require('mongoose');

const StudentSchema = mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    }
})

const Student = mongoose.model("Student", StudentSchema);
module.exports = Student;
