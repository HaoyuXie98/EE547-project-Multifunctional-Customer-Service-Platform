'use strict';

const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const Personnel = require('./Personnel');
const Message = require('./Message');
const Session = require('./Session');

const PORT = 3000;
const secretKey = '12345';

let personnel = new Personnel();
let message = new Message();
let session = new Session();

app.use(bodyParser.json());
app.use('/api', router);
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(express.static("public"));

app.get('/ping', (req, res) => {
    console.log('GET /ping');
    let statusCode = 200;
    let contentType = 'text/plain';
    let respBody = 'OK';
    res.writeHead(statusCode, {'Content-Type': contentType });
    res.write(respBody);
    res.end();
    console.log('Response:', statusCode, contentType, respBody, '\n');
});

// income phonecall
app.get('/income', async (req, res) => {
    console.log('GET /income \n');
    res.render('pages/income');
});

// income phonecall
app.get('/succ', async (req, res) => {
    console.log('GET /succ \n');
    res.render('pages/success');
});

// Login page
app.get('/login', async (req, res) => {
    console.log('GET /login \n');
    res.render('pages/login');
});

//Signup page
app.get('/sign-up', (req, res) => {
    console.log('GET /sign-up \n');
    res.render('pages/sign-up'); 
});

app.get('/chat', async (req, res) => {
    const token = req.query.token;
    // Render the sign-up page
    console.log('GET /chat \n', token);
    const decoded = jwt.verify(token, secretKey);
    const pid = decoded.username;
    console.log(pid);
    const {sidList, personList} = await personnel.getPersonnel(pid);
    let content = new Object();
    content.personList = personList;
    content.sidList = sidList;
    content.session = [];
    content.messages = [];
    content.pid = pid;
    res.render('pages/chat', content); // Replace 'sign-up' with the actual file name or template
    console.log('Response:', content, '\n');
}); 

// Sign up endpoint
router.post('/signup',async (req, res) => {
    console.log('POST api/signup');
    const signupInfo = req.body;
    console.log("req.body", req.body);
    if (await personnel.signup(signupInfo)) {
        console.log('Response:', 'Successful', '\n');
        res.redirect('/login');
    }
    else{
        console.log('Response:', 'Failed', '\n');
        res.status(400).json({ message: 'Username already existed' });
    }
});
  
// Login API endpoint
router.post('/login', async (req, res) => {
    console.log('POST api/login');
    const loginInfo = req.body;
    console.log("loginInfo", loginInfo);
    // if (await personnel.login(loginInfo)) {
    //     console.log('Response:', 'Successful', '\n');
    //     const username = req.body.username;
    //     const token = jwt.sign({ username }, secretKey);
    //     const content = {
    //         message: 'User created successfully',
    //         token: token
    //     }
    //     res.redirect(`/chat?token=${token}`);
    // }
    if (await personnel.login(loginInfo)) {
        console.log('Response:', 'Successful', '\n');
        const username = req.body.username;
        const token = jwt.sign({ username }, secretKey);
        const content = {
            message: 'User created successfully',
            token: token
        }
        res.status(200).json(content); // Return the content object as JSON
    }
    else{
        console.log('Response:', 'Failed', '\n');
        return res.status(400).json({ message: 'Invalid credentials' });
    }
});

router.post('/voice', async  (req, res) =>{
    console.log('POST api/voice');
    const messageinfo = req.body;
    console.log("messageinfo", messageinfo);
    const signupInfo = {username: messageinfo.name, password: messageinfo.password};
    await personnel.signup(signupInfo);
    const p2 = await personnel.getAgent();
    console.log("p2.name", p2.name);
    const sessionInfo = {p1: messageinfo.name, p2: p2.name, created_at: new Date(), messages: []};
    const {name, sid} = await session.newSession(sessionInfo); // newSession need to return a sid
    console.log("sid", sid);
    const new_message = {pid: messageinfo.name, sid: sid, content: messageinfo.text, created_at: new Date(), type: null, request_type: null};
    if (message.newMsg(new_message)) {
        console.log('Response:', 'Successful', '\n');
        const content = {
            message: 'Message sent successfully',
        }
        return res.status(201).json(content);
    }
    else{
        console.log('Response:', 'Failed', '\n');
        return res.status(400).json({ message: 'Failed to send' });
    }
});

// Protected API endpoint
router.get('/protected', (req, res) => {
    const token = req.headers.authorization.split(' ')[1];
  
    try {
      const decoded = jwt.verify(token, secretKey);
      const username = decoded.username;
      return res.json({ message: `Hello ${username}! This is a protected endpoint` });
    } catch (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }
});

router.post('/message', async  (req, res) =>{
    console.log('POST api/message');
    const messageInfo = req.body;
    console.log(messageInfo);
    if (message.newMsg(messageInfo)) {
        console.log('Response:', 'Successful', '\n');
        const content = {
            message: 'Message sent successfully',
        }
        return res.status(201).json(content);
    }
    else{
        console.log('Response:', 'Failed', '\n');
        return res.status(400).json({ message: 'Failed to send' });
    }
});

router.post('/session', async  (req, res) =>{
    console.log('POST api/session');
    const sessionInfo = req.body;
    console.log(sessionInfo);
    const {name, sid} = await session.newSession(sessionInfo);
    if (name != false) {
        console.log('Response:', 'Successful', '\n');
        const content = {
            message: 'Session created successfully',
            name: name
        }
        return res.status(201).json(content);
    }
    else{
        console.log('Response:', 'Failed', '\n');
        return res.status(400).json({ message: 'Failed to create' });
    }
});

router.get('/personnel/:pid', async  (req, res) =>{
    console.log(`POST api/personnel`);
    const pid = req.params.pid;
    const {sidList, personList} = await personnel.getPersonnel(pid);
    let content = new Object();
    content.personList = personList;
    content.sidList = sidList;
    res.status(200).json(content);
    console.log('Response:', content, '\n');

});

router.get('/session/:sid', async  (req, res) =>{
    const sid = req.params.sid;
    console.log(`GET api/session/${sid}`);
    let msgList = await session.getSession(sid);
    res.status(400).json({msgList: msgList});
    // TODO: change ejs file
    // res.render('pages/chat', {message:msgList});
    console.log('Response:', {msgList: msgList}, '\n');
});

router.get('/protected', (req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    try {
      const decoded = jwt.verify(token, secretKey);
      const username = decoded.username;
      return res.json({ message: `Hello ${username}! This is a protected endpoint` });
    } catch (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }
});

app.listen(PORT, () => {
    console.log('Server is running on port 3000');
}); 

