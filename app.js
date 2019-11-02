const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const session = require('express-session');
const Mongo = require('connect-mongo')(session);
const mongoose = require('mongoose');
const authRouter = require('./routes/auth.js');
require('dotenv').config();

mongoose.connect(process.env.MONGODB, {
  keepAlive: true,
  reconnectTries: Number.MAX_VALUE,
  useFindAndModify: false,
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  // eslint-disable-next-line no-console
  .then(() => console.log('🚀 Connected to the database 🚀'))
  // eslint-disable-next-line no-console
  .catch((error) => console.log(error));

const app = express();

app.use(cors({
  credentials: true,
  origin: process.env.FRONTEND_URL,
}));
app.use(session({
  store: new Mongo({
    mongooseConnection: mongoose.connection,
    ttl: 24 * 60 * 60,
  }),
  secret: process.env.SECRET_SESSION,
  resave: true,
  saveUninitialized: true,
  cookie: { maxAge: 24 * 60 * 60 * 1000 },
}));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/auth', authRouter);

app.use((req, res) => res.status(404).json({ code: 'not found' }));
app.use((err, req, res) => !res.headersSent && res.status(err.status || 500).json(err));

module.exports = app;
