const mongoose = require('mongoose');

const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });
const app = require('./app');

const port = 3000;
const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PW);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('connected to database successfully'));
//console.log(process.env);

// const testTour = new Tour({
//   name: 'the rock climber',
//   price: 550,
// });
//testTour.save().then((doc) => console.log(doc));

const server = app.listen(port, () => {
  console.log(process.env.NODE_ENV);
  console.log('listening to server on port 3000...');
});
process.on('unhandledRejection', (err) => {
  // handling the unhandled rejection of asynchronous code..
  console.log('unhandledRejection');
  server.close(() => {
    process.exit(1);
  });
});
