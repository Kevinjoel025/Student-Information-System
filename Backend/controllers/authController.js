const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT Helper
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Register a new user (admin or student)
// @route   POST /api/auth/register
// @access  Public (or could be Admin only in prod)
exports.register = async (req, res) => {
  try {
    const {
      name, email, password, role, rollNumber, department, year,
      bloodGroup, parentMobile, studentMobile, residentialAddress
    } = req.body;
    
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with that email' });
    }

    const user = await User.create({
      name, email, password, role, rollNumber, department, year,
      bloodGroup, parentMobile, studentMobile, residentialAddress
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check for user by email OR rollNumber (rollNumber works assuming it's passed as 'email' string)
    const user = await User.findOne({ 
      $or: [{ email: email }, { rollNumber: email }] 
    });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
