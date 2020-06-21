const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const { sequelize, Sequelize } = require('./database');
const jwt = require('jsonwebtoken');
const { json } = require('body-parser');
const signature = 'acamica';
app.use(bodyParser.json());

function getPrincipalRoutepath(path) {
    const pathArray = path.split('/');
    let finalpath = pathArray[pathArray.length];
    if (typeOf(pathArray[pathArray.length]) == Number)
        finalpath = pathArray[(pathArray.length - 1)];
    return finalpath;
}
function validateFields(req, res, next) {
    let path = getPrincipalRoutepath(req.url);
    status = true;
    const body = req.body;
    switch (path) {
        case 'register':
            if (!body.name || !body.lastname || !body.identification || !body.email || !body.password) 
                status = false;
            break;
        case 'login':
            if ((!body.identification && !body.email) || !body.password) 
                status = false;
            break;
        default:
            break;
    }
    if (status)
        next()
    else
        res.status(400).json({ msg: 'All fields are required' })
}
function bycript(password) {
    bycript
}
app.use(validateFields);
app.post('/register', (req, res) => {
    const { name, lastname, identification, email, password } = req.body;
    sequelize.query('INSERT INTO Users (name, lastname, identification, email, password) VALUES (?,?,?,?,?)',
        {
            replacements: [name, lastname, identification, email, password]
        })
        .then(result => {
            res.json({ msg: `User ${name} is created` });
        })
        .catch(err => {
            res.status(500).json({ error: 'Internal Server Error' });
        })
});
app.post('/register/:id/angel', (req, res) => {

});

app.post('/login', (req, res) => {
    const { identification, email, password } = req.body;

});
app.listen(3000, () => {
    console.log("Server on port 3000");
});