require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const ComplexityPairwiseVid = require('./general_assests/variables/variables-pairwise-logger.js');

const app = express();
const port = process.env.PORT || 3021;

// Middleware to parse JSON
app.use(express.json());

// Serve static files from the "novel_objects" directory
app.use(express.static(path.join(__dirname, 'novel_objects')));

// Serve static files from the "general_assests" directory
app.use('/general_assests', express.static(path.join(__dirname, 'general_assests')));

// Set up a route for the root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'novel_objects', 'novel_obj_pairwise.html'));
});

// MongoDB connection
let raw_data = fs.readFileSync('mongo_auth.json');
let auth = JSON.parse(raw_data);
let mongoDBUri = `mongodb://${auth.user}:${auth.password}@127.0.0.1:27017/samah?authSource=admin`;

// API endpoint to get video files from 25-abstract-animations directory
app.get('/api/videos', (req, res) => {
    try {
        const videosDir = path.join(__dirname, 'general_assests', '25-abstract-animations');
        const folders = fs.readdirSync(videosDir).filter(item => {
            const itemPath = path.join(videosDir, item);
            return fs.statSync(itemPath).isDirectory() && !isNaN(parseInt(item));
        });
        
        const allVideos = [];
        
        folders.forEach(folder => {
            const folderPath = path.join(videosDir, folder);
            const files = fs.readdirSync(folderPath);
            
            const videoFiles = files.filter(file => {
                const ext = path.extname(file).toLowerCase();
                return ['.mp4', '.mov', '.avi', '.mkv', '.webm'].includes(ext);
            });
            
            videoFiles.forEach(file => {
                allVideos.push({
                    path: `/general_assests/25-abstract-animations/${folder}/${file}`,
                    folder: parseInt(folder),
                    fullName: file
                });
            });
        });
        
        console.log(`Found ${allVideos.length} video files across ${folders.length} folders`);
        res.json(allVideos);
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
    const { rt, trial_type, trial_index, time_elapsed, internal_node_id, subject, response, pic, stimulus, block, study_id, session_id, video1, video2, chosen_video, chosen_object, explanation, leftVideo, rightVideo, leftObject, rightObject, left_video, right_video } = req.body;

    const newLog = new ComplexityPairwiseVid({ rt, trial_type, trial_index, time_elapsed, internal_node_id, subject, response, pic, stimulus, block, study_id, session_id, video1, video2, chosen_video, chosen_object, explanation, leftVideo, rightVideo, leftObject, rightObject, left_video, right_video });

    newLog.save()
        .then(() => res.send('Action logged successfully'))
        .catch(err => res.status(500).send('Error logging action: ' + err.message));
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
