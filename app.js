const express = require('express');
const compression = require('compression');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const xss = require('xss-clean');
const hpp = require('hpp');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const bookRouter = require('./routes/bookRouter');
const userRouter = require('./routes/userRouter');
const rentRouter = require('./routes/rentRouter');
const viewRouter = require('./routes/viewRouter');
const aggregateRouter = require('./routes/aggregateRouter');
const notificationRouter = require('./routes/notificationRouter');
const messageRouter = require('./routes/messageRouter');
const globalErrorHandler = require('./controllers/errorController');
const AppError = require('./utils/appError');

const app = express();

//use external middleware to protect our server
app.use(helmet());
app.use(xss());
app.use(
  '/api',
  rateLimit({
    max: 200,
    windowMs: 60000,
    message: process.env.LIMIT_REQUEST_TEXT,
  })
);

app.use(mongoSanitize());
app.use(cors());
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));
app.use(
  hpp({
    whitelist: [
      'publisher',
      'major',
      'existing',
      'reserved',
      'state',
      'year',
      'price',
      'role',
      'active',
      'book',
      'user',
      'level',
    ],
  })
);

//use express middleware and cookieParser
app.use(express.json({ limit: '10kb' }));

app.use(express.static('public'));
app.use(cookieParser({ limit: '10kb' }));
app.use(compression());

//set view settings
app.set('view engine', 'pug');
app.set('views', `${__dirname}/views`);

//set routers
app.use('/api/v1/books', bookRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/rents', rentRouter);
app.use('/api/v1/aggregates', aggregateRouter);
app.use('/api/v1/notification', notificationRouter);
app.use('/api/v1/message', messageRouter);
app.use('/', viewRouter);

app.all('*', (req, res, next) => {
  next(new AppError(404, 'صفحه مورد نظر یافت نشد'));
});

app.use(globalErrorHandler);

module.exports = app;
