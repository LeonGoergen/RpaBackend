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
mongoose.connect("mongodb+srv://leongoergen:Rpa-suitabilitY@rpa.htm7lfo.mongodb.net/?retryWrites=true&w=majority", { useNewUrlParser: true, useUnifiedTopology: true });

// Define a schema and model for questionnaire results
const resultSchema = new mongoose.Schema({
    questionScores: Object,
    sessionToken: String,
    timestamp: Date
});
const Result = mongoose.model('Result', resultSchema);

// Create an endpoint to store questionnaire results
app.post('/store-results', (req, res) => {
    const newResult = new Result({
        questionScores: req.body.questionScores,
        sessionToken: req.body.sessionToken,
        timestamp: new Date()
    });

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
const port = process.env.PORT || 9001
app.listen(port, () => console.log('Server started on port '  + port));
