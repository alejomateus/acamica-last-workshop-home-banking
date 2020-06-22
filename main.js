const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const { sequelize, Sequelize } = require('./database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const signature = 'acamica';
app.use(bodyParser.json());

function getPrincipalRoutepath(path) {
    const pathArray = path.split('/');
    let finalpath = pathArray[pathArray.length];
    if (typeof (pathArray[pathArray.length]) == Number)
        finalpath = pathArray[(pathArray.length - 1)];
    return finalpath;
}
function validateFields(req, res, next) {
    let path = getPrincipalRoutepath(req.url);
    status = true;
    const body = req.body;
    console.log(req.method);

    if (req.method != "GET" && req.method != "DELETE")
        switch (path) {
            case 'register':
                if (!body.name || !body.lastname || !body.identification || !body.email || !body.password)
                    status = false;
                break;
            case 'login':
                if ((!body.identification && !body.email) || !body.password)
                    status = false;
                break;
            case 'accounts':
                if (!body.balance)
                    status = false;
                break;
            default:
                break;
        }
    if (status)
        next()
    else
        res.status(400).json({ msg: 'All fields are required' })
    return;
}
function isAdmin(req, res, next) {
    if (req.user.role !== 'admin') {
        res.status(403).json({ error: 'You don´t have permissions to access ' });
        return;
    }
    next();
}

function generateToken(data) {
    return jwt.sign({
        user: data
    }, signature, { expiresIn: 60 * 60 });
}
let tokenVerification = (req, res, next) => {
    if (!req.headers.authorization)
        res.status(401).json({ msg: 'Token no provider ' });
    try {
        let token = req.headers.authorization.split(' ')[1];
        jwt.verify(token, signature, (err, decoded) => {
            if (err) {
                res.status.json({ msg: 'Token error ', error: err });
                return
            }
            req.user = decoded.user;
            next();
        })
    } catch (error) {
        res.status(401).json({ msg: 'Token no provider ' });
    }
};
app.use(validateFields);
app.post('/register', async (req, res) => {
    try {
        const { name, lastname, identification, email, password } = req.body;
        const passwordEncriptado = await bcrypt.hash(password, 10);
        sequelize.query('INSERT INTO Users (name, lastname, identification, email, password) VALUES (?,?,?,?,?)',
            {
                replacements: [name, lastname, identification, email, passwordEncriptado]
            })
            .then(async (result) => {
                let user = await sequelize.query(`SELECT * FROM users WHERE email = '${email}' or identification = '${identification}'`,
                    {
                        type: Sequelize.QueryTypes.SELECT
                    });
                let dataUser = user[0];
                delete dataUser.password;
                let accountCreated = await sequelize.query(`
                    INSERT INTO Accounts (idUser, accountNumber, balance,createdAt) VALUES 
                    (?,?,?, NOW())
                `, {
                    type: Sequelize.QueryTypes.INSERT,
                    replacements: [dataUser.id, Math.floor(100000000 + Math.random() * 900000000), 0]
                });
                const token = generateToken(dataUser);
                res.status(201).json({
                    msg: `User ${name} is created`,
                    data: {
                        token
                    }
                });
            })
            .catch(err => {
                console.log(err);
                res.status(500).json({ error: 'Internal Server Error' });
            })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Internal Server Error' });
    }

});

app.post('/login', async (req, res) => {
    try {
        const { identification, email, password } = req.body;
        let user = await sequelize.query(`SELECT * FROM users WHERE email = '${email}' or identification = '${identification}'`,
            {
                type: Sequelize.QueryTypes.SELECT
            });
        if (user.length === 0) {
            res.status(403).json({ error: 'Invalid credentials' });
            return;
        }
        const passwordValida = await bcrypt.compare(password, user[0].password);
        if (!passwordValida) {
            res.status(403).json({ error: 'Not exist any user with this email or password' });
            return;
        }
        let dataUser = user[0];
        delete dataUser.password;
        const token = generateToken(dataUser);
        res.status(200).json({
            msg: 'Successfull authentication',
            data: {
                token
            }
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
app.get('/accounts', [tokenVerification], async (req, res) => {
    const userData = req.user;
    let accounts = await sequelize.query(`SELECT * FROM Accounts WHERE idUser = '${userData.id}'`,
        {
            type: Sequelize.QueryTypes.SELECT
        });
    res.status(200).json({
        msg: 'Accounts',
        data: accounts
    })

});
app.get('/admin/accounts', [tokenVerification, isAdmin], async (req, res) => {
    let accounts = await sequelize.query(`
    SELECT accounts.*, CONCAT(users.name,' ', users.lastname)  AS 'name'
    , users.identification,users.email
     FROM accounts JOIN users ON accounts.idUser = users.id `,
        {
            type: Sequelize.QueryTypes.SELECT
        });
    res.status(200).json({
        msg: 'Accounts',
        data: accounts
    })
});
app.put('/admin/accounts/:id', [tokenVerification, isAdmin], async (req, res) => {
    try {
        const { balance } = req.body;
        const id = req.params.id;
        await sequelize.query(`
        UPDATE Accounts SET balance = :balance 
        WHERE id = :id`,
            {
                type: Sequelize.QueryTypes.UPDATE,
                replacements: {
                    balance,
                    id
                }
            });
        let account = await sequelize.query(`
        SELECT * FROM Accounts
        WHERE id = :id`,
            {
                type: Sequelize.QueryTypes.SELECT,
                replacements: {
                    id
                }
            });
        res.status(200).json({
            msg: 'Account updated succesfully',
            data: account
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Internal Server Error' });
    }

});
app.post('/transfers', [tokenVerification], async (req, res) => {
    try {
        const { idAccountOrigin, idAccountDestination, amount } = req.body;
        let userData = req.user;
        let accounts = await sequelize.query(`SELECT * FROM Accounts WHERE idUser = '${userData.id}' `,
            {
                type: Sequelize.QueryTypes.SELECT
            });
        activeAccounts = accounts.filter(account => account.id === idAccountOrigin);
        if (activeAccounts.length === 0) {
            res.status(400).json({ msg: 'This account isn´t yours' })
        }
        let transfer = await sequelize.query(`
                INSERT INTO Transfers (idAccountOrigin, idAccountDestination, amount, idUser, createdAt) VALUES 
                (?,?,?,?, NOW())
            `, {
            type: Sequelize.QueryTypes.INSERT,
            replacements: [idAccountOrigin, idAccountDestination, amount, userData.id]
        });
        console.log(transfer);
        if (!transfer)
            res.status(500).json({ error: 'Internal Server Error' });
        else {
            res.status(200).json({ msg: 'Correct transfer' });
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
app.listen(3000, () => {
    console.log("Server on port 3000");
});