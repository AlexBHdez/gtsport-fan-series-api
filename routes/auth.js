/* eslint-disable consistent-return */
/* eslint-disable no-unused-expressions */
const express = require('express');
const createError = require('http-errors');
const bcrypt = require('bcrypt');
const User = require('../models/user');

const router = express.Router();
const { isLogged, isNotLogged } = require('../middlewares/auth');

router.get('/me', isLogged(), (req, res) => res.status(200).json(req.session.currentUser));

router.post('/signup', isNotLogged(), async (req, res, next) => {
  const { email, password } = req.body;
  (!email || !password) && next(createError(422, 'Fields are empty'));

  try {
    const user = await User.findOne({ email });
    user && next(createError(422, 'User aldready exists'));

    const salt = bcrypt.genSaltSync(parseInt(process.env.BCRYPT));
    const hashPass = bcrypt.hashSync(password, salt);
    const newUser = await User.create({ email, password: hashPass });

    req.session.currentUser = newUser;
    res.status(200).json(newUser);
  } catch (error) {
    next(error);
  }
});

router.post('/login', isNotLogged(), async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    !user && next(createError(422, 'User already exists'));

    if (bcrypt.compare(password, user.password)) {
      req.session.currentUser = user;
      return res.status(200).json(user);
    }
    next(createError(401, 'Wrong user or password'));
  } catch (error) {
    next(error);
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy();
  return res.status(204);
});

module.exports = router;
