const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetchuser = require('../middleware/fetchuser');

const JWT_SECRET = 'Somethinggood';

//Route 1 : Creating a user using POST '/api/auth/createUser' . No login required
router.post('/createUser',
    [
        body('email', 'Enter a valid email').isEmail(),
        body('name', 'Enter a valid name').isLength({ min: 3 }),
        body('password', 'Password must be atleast 5 characters').isLength({ min: 5 })
    ],
    async (req, res) => {
        let success = false;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success, errors: errors.array() });
        }
        else {
            try {
                let user = await User.findOne({ email: req.body.email });
                if (user) {
                    return res.status(400).json({ success, error: 'Email already exist' })
                }
                else {
                    const salt = await bcrypt.genSalt(10);
                    const secPass = await bcrypt.hash(req.body.password, salt);
                    user = await User.create({
                        name: req.body.name,
                        password: secPass,
                        email: req.body.email
                    })
                }

                const data = {
                    user: {
                        id: user.id
                    }
                }
                success = true;
                const authToken = jwt.sign(data, JWT_SECRET);
                res.json({ success, authToken });
            } catch (error) {
                console.error(error.message);
                res.status(500).send("Internal server error occured");
            }
        }
    })


//Route 2 : Authenticating a user using POST '/api/auth/login' . No login required
router.post('/login',
    [
        body('email', 'Enter a valid email').isEmail(),
        body('password', 'Cannot be blank').exists()
    ],
    async (req, res) => {
        let success = false;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        else {
            const { email, password } = req.body;
            try {
                let user = await User.findOne({ email });
                if (!user) {
                    return res.status(400).json({ success, error: 'Please try to login with correct credentials' });
                }
                else {
                    const passwordCompare = await bcrypt.compare(password, user.password);
                    if (!passwordCompare) {
                        return res.status(400).json({ success, error: 'Please try to login with correct credentials' });
                    }
                    else {
                        const data = {
                            user: {
                                id: user.id
                            }
                        }
                        success = true;
                        const authToken = jwt.sign(data, JWT_SECRET);
                        res.json({ success, authToken });
                    }
                }
            } catch (error) {
                console.error(error.message);
                res.status(500).send("Internal server error occured");
            }
        }
    }
)

//Route 3 : Getting logged in user deatils using POST:'/api/auth/getuser' . Login required
router.post('/getuser', fetchuser,
    async (req, res) => {
        try {
            const user = await User.findById(req.user.id).select("-password");
            res.send(user);
        } catch (error) {
            console.error(error);
            res.status(500).send("Internal server error occured");
        }
    }
)

module.exports = router