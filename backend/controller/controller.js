const express = require('express');

const router = express.Router();

const Link = require('../models/SubmitLink');

const { YoutubeTranscript } = require('youtube-transcript');

const he = require('he');

const mongoose = require('mongoose');

// API Endpoints

// adds link to db and transcribes
router.post('/submit-link', async (req,res) => {
    const { input, userEmail = null } = req.body;
    const stringInput = input.toString();  

     const youtubeUrlRegex = /^(https?\:\/\/)?(www\.youtube\.com|youtu\.?be)\/.+$/;
     if (!youtubeUrlRegex.test(input)) {
         return res.status(400).json({ message: 'Invalid YouTube URL' });
     }

    try {
    const transcript = await YoutubeTranscript.fetchTranscript(stringInput);
    //console.log("transcript", transcript);
    const transcriptToString = transcript.map(obj => he.decode(he.decode(obj.text))).join(' ');
    //console.log(transcriptToString);
    const newLink = new Link ({
        user: userEmail,
        videoURL: input,
        transcript: transcriptToString,
    });

    await newLink.save();
    res.status(200).json({ message: 'link and transcript saved successfully', transcript: transcriptToString});
} catch (error) {
    console.log(error);
    res.json({ message: 'failed at /submit-link'})
}
})

router.get('/getTranscriptionHistory/:userEmail', async (req,res) => {
    const { userEmail } = req.params;

    if (!userEmail) {
        return res.status(400).json( { message : "User Email is Required"});
    }
    const makeEmailString = userEmail.toString();
    try {
        const history = await Link.find({ user: makeEmailString });
        console.log(history);
        console.log(typeof history);

        res.status(200).json({ message: "User Transcriptions found!", history: history});
    } catch (error) {
        console.log(error);
    }


})



module.exports = router;