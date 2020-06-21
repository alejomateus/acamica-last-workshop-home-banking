const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const { sequelize, Sequelize } = require('./database');
const jwt = require('jsonwebtoken');
const { json } = require('body-parser');
const signature = 'acamica';

app.use(bodyParser.json());

let users;

const jwtMiddleware = (req, res, next) => {
    const { identification, password } = req.body;
    let valid = false;
    sequelize.query('SELECT * FROM Users',
        {
            type: Sequelize.QueryTypes.SELECT
        })
        .then(usersQuery => {
            if (usersQuery) {
                users = usersQuery;
                users.map((existingUser) => {
                    if (existingUser.identification == identification && existingUser.password == password) {
                        valid = true;
                    }
                });
                if (valid) {
                    next();
                } else {
                    res.status(401).json({ error: 'Invalid credentials' });
                }
            }
        })
};

function validateUserIdentification(req, res, next) {
    const identification = req.params.identification;

    sequelize.query('SELECT * FROM Users WHERE identification = ?',
        {
            type: Sequelize.QueryTypes.SELECT,
            replacements: [identification]
        })
        .then(result => {
            if (result) {
                next();
            } else {
                res.status(404).json({ error: 'user not found' });
            }
        })
        .catch(err => {
            res.status(500).json({ error: err });
        });
}

function decryptUser(req, res, next) {
    const token = req.headers.authorization.split(' ')[1];
    const tokenVerification = jwt.verify(token, signature);
    console.log(tokenVerification);

    if (tokenVerification) {
        req.user = tokenVerification;
        if (req.user.rol == "admin") {
            next();
        } else {
            res.status(403).json({ msg: "User without permissions" });
        }

    } else {
        res.status(401).json({ msg: "Invalid token" });
    }
}

app.post('/register', (req, res) => {
    const { name, lastname, identification, password, rol } = req.body;
    sequelize.query('INSERT INTO Users (name, lastname, identification, password, rol) VALUES (?,?,?,?,?)',
        {
            replacements: [name, lastname, identification, password, rol]
        })
        .then(result => {
            res.json({ msg: `User ${name} is created` });
        })
        .catch(err => {
            res.status(500).json({ error: err });
        })
});

app.post('/login', [jwtMiddleware], (req, res) => {
    const { identification, password } = req.body;
    const userFound = users.filter(user => user.identification == identification)
    res.json({ token: jwt.sign(userFound[0], signature) });
});

app.post('/userTransfer', (req, res) => {

});

app.post('/adminTransfer', decryptUser, (req, res) => {
    res.json({ msg: "Works!!!" })
});

app.listen(3000, () => {
    console.log("Server on port 3000");
});