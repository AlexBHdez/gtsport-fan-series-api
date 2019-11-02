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
  const { username, password } = req.body;
  (!username || !password) && next(createError(422, 'Fields are empty'));

  try {
    const user = await User.findOne({ username });
    user && next(createError(422, 'User aldready exists'));

    const salt = bcrypt.genSaltSync(parseInt(process.env.BCRYPT));
    const hashPass = bcrypt.hashSync(password, salt);
    const newUser = await User.create({ username, password: hashPass });

    req.session.currentUser = newUser;
    res.status(200).json(newUser);
  } catch (error) {
    next(error);
  }
});

router.post('/login', isNotLogged(), async (req, res, next) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });

    if (user) {
      if (bcrypt.compare(password, user.password)) {
        req.session.currentUser = user;
        return res.status(200).json(user);
      } else {
        next(createError(401, 'Wrong user or password'));
      }
    } else {
      next(createError(422, 'You dont have an account, please signup'));
    }
  } catch (error) {
    next(error);
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy();
  return res.status(204).json({ loggedOut: true });
});

module.exports = router;
