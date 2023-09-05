const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const {body, validationResult} = require('express-validator');

require('dotenv').config();

const app = express();

const errorHandler = (err, req, res, next) => {
  console.error(err);
  res.status(500).send('Internal Server Error: ' + err.message);
};

app.use(cors());
app.use(bodyParser.json());

mongoose.connect(process.env.MONGODB_URL, {useNewUrlParser: true, useUnifiedTopology: true})
  .catch(error => {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  });

const resultSchema = new mongoose.Schema({
  questionScores: Object,  // Should ideally specify a more detailed schema
  userToken: String,
  timestamp: Date
});
const messageSchema = new mongoose.Schema({
  userToken: String,
  name: String,
  email: String,
  message: String,
  timestamp: Date
});
const ratingSchema = new mongoose.Schema({
  userToken: String,
  title: String,
  rating: String,
  message: String,
  timestamp: Date
});

const Result = mongoose.model('Result', resultSchema);
const Message = mongoose.model('Message', messageSchema);
const Rating = mongoose.model('Rating', ratingSchema);

app.post('/store-results',
  [
    body('questionScores').exists().withMessage('questionScores is required'),
    body('userToken').exists().withMessage('userToken is required')
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({errors: errors.array()});
    }

    try {
      const newResult = new Result({
        questionScores: req.body.questionScores,
        userToken: req.body.userToken,
        timestamp: new Date()
      });

      await newResult.save();
      res.json(`Results added: ${newResult}`);
    } catch (err) {
      next(err);
    }
  }
);

app.post('/store-message',
  [
    body('name').exists().withMessage('Name is required'),
    body('email').isEmail().withMessage('Email must be valid'),
    body('message').exists().withMessage('Message is required')
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const newMessage = new Message({
        userToken: req.body.userToken,
        name: req.body.name,
        email: req.body.email,
        message: req.body.message,
        timestamp: new Date()
      });

      await newMessage.save();
      res.json(`Message added: ${newMessage}`);
    } catch (err) {
      next(err);
    }
  }
);

app.post('/store-rating',
    [
        body('title').exists().withMessage('Title is required'),
        body('rating').exists().withMessage('Rating is required'),
        body('message').exists().withMessage('Message is required')
    ],
    async (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      try {
        const newRating = new Rating({
          userToken: req.body.userToken,
          title: req.body.title,
          rating: req.body.rating,
          message: req.body.message,
          timestamp: new Date()
        });

        await newRating.save();
        res.json(`Rating added: ${newRating}`);
      } catch (err) {
        next(err);
      }
    }
);

app.get('/all-results', async (req, res, next) => {
  try {
    const results = await Result.find();
    res.json(results);
  } catch (err) {
    next(err);
  }
});

app.get('/all-messages', async (req, res, next) => {
  try {
    const messages = await Message.find();
    res.json(messages);
  } catch (err) {
    next(err);
  }
});

app.get('/all-ratings', async (req, res, next) => {
  try {
    const ratings = await Rating.find();
    res.json(ratings);
  } catch (err) {
    next(err);
  }
});

app.use(errorHandler);

const port = process.env.PORT || 9001;
app.listen(port, () => console.log(`Server started on port ${port}`));
