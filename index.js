const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const { body, validationResult } = require('express-validator');

require('dotenv').config();

const app = express();

const errorHandler = (err, req, res) => {
    console.error(err);
    res.status(500).send('Internal Server Error');
};

app.use(cors());
app.use(bodyParser.json());

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .catch(error => {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    });

const resultSchema = new mongoose.Schema({
    questionScores: Object,  // Should ideally specify a more detailed schema
    userToken: String,
    timestamp: Date
});
const Result = mongoose.model('Result', resultSchema);

app.post('/store-results',
    [
        body('questionScores').exists().withMessage('questionScores is required'),
        body('userToken').isString().withMessage('userToken must be a string')
    ],
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
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
    });

app.get('/all-results', async (req, res, next) => {
    try {
        const results = await Result.find();
        res.json(results);
    } catch (err) {
        next(err);
    }
});

app.use(errorHandler);

const port = process.env.PORT || 9001;
app.listen(port, () => console.log(`Server started on port ${port}`));
