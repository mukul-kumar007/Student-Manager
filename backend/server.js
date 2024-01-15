const express = require('express');
const mongoose = require('mongoose');
const app = express();
const bcrypt = require('bcrypt');
const Student = require('./models/Student.js');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const cors = require('cors');
const fs = require('fs');
mongoose.connect('mongodb://127.0.0.1:27017/StudentsApi');

app.use(express.json());
app.use(express.urlencoded());
app.use(cookieParser());

app.use(session({
    secret: 'Please give full number',
}));

app.use(cors());

app.use(express.static(path.join(__dirname, '../frontend')));

app.get('/register',(req,res) => {
    res.sendFile(path.join(__dirname, '../frontend/register.html'));
})

app.get("/",(req,res) => {
    res.sendFile(path.join(__dirname, '../frontend/login.html'));
})

app.get('/login',(req,res) => {
    res.sendFile(path.join(__dirname, '../frontend/login.html'));
})

app.get('/stu',(req,res) => {
    const loggedIn = req.session.loggedIn;
    if(loggedIn) {
        const username = req.session.profile;
        const filepath = path.join(__dirname,'../frontend/students.html');
        let htmlFile = fs.readFileSync(filepath, 'utf8');
        htmlFile = htmlFile.replace('<<USERNAME>>', username);
        res.send(htmlFile);
    }else{
        res.redirect('/login?error=1');
    }  
})

app.post('/register' ,async (req,res) => {
    const user = req.body;
    if(!user.password || !user.username){
        res.send("Username and Password are required");
        return;
    }
    if(user.password.length < 4) {
        res.send("Password Length must be greator than or equal to 4");
        return;
    }

    const newUser = new Student(user);
    const saltRounds = 10;
    const hashedPwd = await bcrypt.hash(newUser.password, saltRounds);
    newUser.password = hashedPwd;
    try{
        await newUser.save();
    } catch(err) {
        res.send("Couldn't Register Account");
    }
    res.redirect('/login');
})

app.post('/login',async (req,res) => {
    const loginData = req.body;

    const account = (await Student.find().where('username').equals(loginData.username))[0];
    if(!account) {
        res.send("User Name not found");
        return;
    }
    const match = await bcrypt.compare(loginData.password, account.password);
    if(!match) {
        return res.send("Incorrent Password");
    }
    req.session.user = account.user;
    req.session.profile = account.username
    req.session.loggedIn = true;
    res.redirect('/stu');
})

app.get('/studentsDetails', async (req,res) => {
    try {
        const students = await Student.find({}, 'username');
        res.json(students);
    }catch (err) {
        console.log(err);
        res.status(500).json({error : 'Internal Server Error'});
    }
});

app.get('/studentsDetails/:username', async (req,res) => {
    const requiredUser = req.params.username;
    try {
        const student = await Student.findOne({username: requiredUser});
        if(!student){
            return res.status(404).send("No Data found for entered username");
        }
        res.json(student);
    }
    catch(err) {
        console.log(err);
        res.status(400).json({error : "Internal Server Error"});
    }
} )

app.delete('/studentsDetails/:id', async (req,res) => {
    const id = req.params.id;
    try{
        await Student.findByIdAndDelete(id);
        res.status(200).send("Student Deleted");
    }catch(err) {
        console.log(err);
        res.status(400).send("Couldn't Delete Student");
    }
})

app.get('/logout', (req,res) => {
    req.session.loggedIn = false;
    res.redirect('/login');
})

app.put('/studentsDetails/:id/:input', async (req,res) => {
    const id = req.params.id;
    const newusername = req.params.input;
    try {
        const updateStudent = await Student.findByIdAndUpdate(
            id,
            {username: newusername},
            {new:true}
        );
        res.status(200).send("Student Updated");
        if(!updateStudent){
            res.status(404).send("Studnet not found");
        }
    }catch(err) {
        console.log(err);
        res.status(400).send("Update Unsuccessfull");
    }
})

app.listen(3000 ,() => {
    console.log("Server Started At: http://localhost:3000");
})
