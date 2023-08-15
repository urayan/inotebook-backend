const express = require('express');
const router = express.Router();
const fetchuser = require('../middleware/fetchuser');
const Note = require('../models/Note');
const { body, validationResult } = require('express-validator');

//Route 1 : Fecthing all notes using GET '/api/notes/fetchallnotes' . Login required
router.get('/fetchallnote', fetchuser,
    async (req, res) => {
        try {
            const note = await Note.find({ user: req.user.id })
            res.json(note)
        } catch (error) {
            console.error(error);
            res.status(500).send("Internal server error occured");
        }
    }
)

//Route 2 : Adding a note using POST '/api/notes/addnote' . Login required
router.post('/addnote', fetchuser,
    [
        body('title', 'Enter a valid title').isLength({ min: 3 }),
        body('description', 'Description must be atleast 5 characters').isLength({ min: 5 })
    ],
    async (req, res) => {
        const { title, description, tag } = req.body;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        else {
            try {
                const note = new Note({
                    title, description, tag, user: req.user.id
                })
                const savedNote = await note.save();
                res.json(savedNote)
            } catch (error) {
                console.error(error);
                res.status(500).send("Internal server error occured");
            }
        }
    }
)

//Route 3 : Updating a note using PUT '/api/notes/updatenote/noteID' . Login required
router.put('/updatenote/:id', fetchuser,
    async (req, res) => {
        try {
            const { title, description, tag } = req.body;
            const newNote = {};

            if (title) { newNote.title = title };
            if (description) { newNote.description = description };
            if (tag) { newNote.tag = tag };

            let note = await Note.findById(req.params.id);
            if (!note) {
                return res.status(404).send("note not found");
            }
            if (note.user.toString() !== req.user.id) {
                return res.status(401).send("Not allowed");
            }
            else {
                note = await Note.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true })
                res.json({note});
            }

        } catch (error) {
            console.error(error.message);
            res.status(500).send("Internal server error occured");
        }
    }
)

//Route 4 : Deleting a note using DELETE '/api/notes/deletenote/noteId' . Login required
router.delete('/deletenote/:id', fetchuser,
    async (req, res) => {
        try {
            let note = await Note.findById(req.params.id);
            if (!note) {
                return res.status(404).send("note not found");
            }
            if (note.user.toString() !== req.user.id) {
                return res.status(401).send("Not allowed");
            }
            else {
                note = await Note.findByIdAndDelete(req.params.id)
                res.send(note);
            }

        } catch (error) {
            console.error(error);
            res.status(500).send("Internal server error occured");
        }
    }
)

module.exports = router