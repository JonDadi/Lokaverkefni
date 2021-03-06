const express = require('express');

const app = express();
const path = require('path');
const logger = require('morgan');
const bodyParser = require('body-parser');
const router = require('./routes');
const cors = require('cors');

app.use(cors());

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', router);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development

  const response = res;
  response.locals.message = err.message;
  response.locals.error = req.app.get('env') === 'development' ? err : {};

  if (err.status === 404) {
    response.render('error', { message: 'Something happened...', notFound: true });
  }
  // render the error page
  response.status(err.status || 500);
  response.render('error');
});

module.exports = app;
