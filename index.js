// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

// Initialize express app
const app = express();

// Enable CORS and JSON body parsing
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(process.env.DB_URL, { useNewUrlParser: true, useUnifiedTopology: true });

// Define a schema and model for questionnaire results
const resultSchema = new mongoose.Schema({
    questionScores: Object,
    userIP: String,
    timestamp: Date
});
const Result = mongoose.model('Result', resultSchema);

// Create an endpoint to store questionnaire results
app.post('/store-results', (req, res) => {
    const newResult = new Result({
        questionScores: req.body.questionScores,
        userIP: req.body.userIP,
        timestamp: new Date()
    });

    console.log(newResult['questionScores'])
    console.log(newResult['userIP'])
    console.log(newResult['timestamp'])

    newResult.save()
        .then(() => res.json('Results added: ' + newResult))
        .catch(err => res.status(400).json('Error: ' + err));
});

app.get('/all-results', (req, res) => {
    Result.find()
        .then(results => res.json(results))
        .catch(err => res.status(400).json('Error: ' + err));
});

// Start the server
app.listen(5000, () => console.log('Server started on port 5000'));
