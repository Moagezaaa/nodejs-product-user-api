const { dbGet, dbAll, dbRun } = require('../utils/dbproduct');
const appErrors = require('../utils/appError');
const asyncWrap = require('../middlewares/asyncWrapper');
const httpStatusText = require('../utils/httpStatusText');
const userRoles = require('../utils/userRoles');
const validator = require('validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const ValidateUser = require('../utils/ValidateUser');
require("dotenv").config();
const users = asyncWrap(async (req, res) => {
    const page = Number(req.body.page) || 1;
    const limit = Number(req.body.limit) || 10;
 if(!ValidateUser.validatePage(page)||!ValidateUser.validateLimit(limit)){
    return res.status(400).json({ status: httpStatusText.FAIL, message: 'Invalid page or limit number' });
  }
    const offset = (page - 1) * limit;

    const countResult = await dbGet('SELECT COUNT(*) as total FROM users');
    if (offset >= countResult.total) {
        if (countResult.total === 0) {
            return res.json({ status: httpStatusText.SUCCESS, data: [] });
        }
        return res.status(400).json({ status: httpStatusText.FAIL, message: 'Invalid page number' });
    }

    const rows = await dbAll(`SELECT * FROM users LIMIT ? OFFSET ?`, [limit, offset]);

    res.json({ status: httpStatusText.SUCCESS, data: rows });
});



const register = asyncWrap(async (req, res, next) => {
    let { name, email, password} = req.body;
    if( !ValidateUser.validateName(name) ){
        return res.status(400).json({ status: httpStatusText.FAIL, data: 'Invalid name' });
    }
    if( !ValidateUser.validatePassword(password) ){
        return res.status(400).json({ status: httpStatusText.FAIL, data: 'Password must be at least 6 characters' });
    }
    if (!validator.isEmail(email)) {
        return res.status(400).json({ status: httpStatusText.FAIL, data: 'Invalid email format' });
    }
    const user = await dbGet('SELECT * FROM users WHERE email = ?', [email]);
    if (user) {
        return res.status(400).json({ status: httpStatusText.FAIL, data: 'Email already exists' });
    }
    // const find = [userRoles.ADMIN, userRoles.MANGER, userRoles.CUSTOMER];
    // if (!find.includes(role)) {
    //     return res.status(400).json({ status: httpStatusText.FAIL, data: 'Invalid role' });
    // }
    const hashedPassword = await bcrypt.hash(password, 10);
    const result=await dbGet('SELECT COUNT(*) as count FROM users');
    const token = await jwt.sign({ id: result.count+1,email,name }, process.env.JWT_SECRET_KEY, { expiresIn: '1d' });
    await dbRun('INSERT INTO users (name, email, password,token) VALUES (?, ?, ?,?)', [name, email, hashedPassword, token]);
    res.status(201).json({ status: httpStatusText.SUCCESS, data: 'User registered successfully', token });
});

const login = asyncWrap(async (req, res, next) => {
    const { email, password } = req.body;
    if (!validator.isEmail(email)) {
        return res.status(400).json({ status: httpStatusText.FAIL, data: 'Invalid email format' });
    }
    const user = await dbGet('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
        return res.status(400).json({ status: httpStatusText.FAIL, data: 'Invalid email ' });
    }
     if( !ValidateUser.validatePassword(password) ){
        return res.status(400).json({ status: httpStatusText.FAIL, data: 'Password must be at least 6 characters' });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        return res.status(400).json({ status: httpStatusText.FAIL, data: 'Invalid password' });
    }
    const token = await jwt.sign({ id: user.id,email, name:user.name }, process.env.JWT_SECRET_KEY, { expiresIn: '1d' });
    res.status(200).json({ status: httpStatusText.SUCCESS, data: 'Login successful', token });
});

module.exports = {
    users,
    register,
    login
};
