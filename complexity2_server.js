require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const ComplexityVid = require('./variables/variables-vid-logger.js');

const app = express();
const port = process.env.PORT || 3020;

// Middleware to parse JSON
app.use(express.json());

// Serve static files from the "experiment" directory
app.use(express.static(path.join(__dirname, 'video_experiment')));

// Serve static files from the "familiar_objects" directory
app.use('/familiar_objects', express.static(path.join(__dirname, 'familiar_objects')));

// Serve video files from the general_assests directory
app.use('/general_assests', express.static(path.join(__dirname, 'general_assests')));

// Set up a route for the root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'video_experiment', 'complexity_videos.html'));
});

// Route for familiar objects experiment
app.get('/familiar', (req, res) => {
    res.sendFile(path.join(__dirname, 'familiar_objects', 'familiar_obj_ratings.html'));
});

// MongoDB connection
let raw_data = fs.readFileSync('mongo_auth.json');
let auth = JSON.parse(raw_data);
let mongoDBUri = `mongodb://${auth.user}:${auth.password}@127.0.0.1:27017/samah?authSource=admin`;

// API endpoint to get video files from videos_familiarobjs directory
app.get('/api/videos', (req, res) => {
    try {
        const videosDir = path.join(__dirname, 'general_assests', 'videos_familiarobjs');
        const files = fs.readdirSync(videosDir);
        
        // Filter only video files (mp4, mov, avi, etc.)
        const videoFiles = files.filter(file => {
            const ext = path.extname(file).toLowerCase();
            return ['.mp4', '.mov', '.avi', '.mkv', '.webm'].includes(ext);
        });
        
        console.log(`Found ${videoFiles.length} video files`);
        res.json(videoFiles);
    } catch (error) {
        console.error('Error reading videos directory:', error);
        res.status(500).json({ error: 'Failed to read videos directory' });
    }
});

// MongoDB
mongoose.connect(mongoDBUri)
    .then(() => console.log('Connected to MongoDB...'))
    .catch(err => console.error('Could not connect to MongoDB...', err));

// Logging
app.post('/api/log', (req, res) => {
    console.log("req.body");
    try {
        console.log(req.body);
    } catch (error) {
        console.error('Error in POST request:', error);
        res.status(500).send('Internal Server Error');
    }
    const { rt, trial_type, trial_index, time_elapsed, internal_node_id, subject, response, pic, stimulus, block, study_id, session_id } = req.body;

    const newLog = new ComplexityVid({ rt, trial_type, trial_index, time_elapsed, internal_node_id, subject, response, pic, stimulus, block, study_id, session_id });

    newLog.save()
        .then(() => res.send('Action logged successfully'))
        .catch(err => res.status(500).send('Error logging action: ' + err.message));
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
