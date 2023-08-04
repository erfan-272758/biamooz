process.on('uncaughtException', (err) => {
  if (process.env.NODE_ENV === 'development')
    console.log('There is an error:\n', err.message, '\n', err);
  process.exit(1);
});
//
// eslint-disable-next-line import/newline-after-import
const dotenv = require('dotenv');
dotenv.config({ path: `${__dirname}/config.env` });

const mongoose = require('mongoose');
const app = require('./app');

const server = app.listen(process.env.PORT, () => {
  if (process.env.NODE_ENV === 'development')
    console.log('listening on port', process.env.PORT);
});

mongoose.connect(
  process.env.DB_URL,
  {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  },
  () => {
    if (process.env.NODE_ENV === 'development') console.log('connecting to DB');
  }
);

require('./utils/checkAdmin');

process.on('unhandledRejection', (err) => {
  if (process.env.NODE_ENV === 'development')
    console.log('There is an error:\n', err.message, '\n', err);
  server.close(() => {
    process.exit(1);
  });
});
