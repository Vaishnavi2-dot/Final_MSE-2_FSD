const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (userId, email, name) => {
  return jwt.sign(
    { userId, email, name },
    process.env.JWT_SECRET_KEY,
    { expiresIn: '7d' }
  );
};

// @route   POST /api/register
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    console.log('📝 Registration attempt:', { name, email, password });
    
    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ 
        message: 'Please provide all required fields'
      });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ 
        message: 'User already exists with this email'
      });
    }
    
    // Create new user
    const user = new User({
      name,
      email: email.toLowerCase(),
      password
    });
    
    console.log('👤 User object before save:', user);
    
    // Save user - this will trigger the pre-save hook
    await user.save();
    
    console.log('💾 User saved successfully');
    console.log('Password in DB:', user.password);
    
    // Generate token
    const token = generateToken(user._id, user.email, user.name);
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      message: 'Server error during registration',
      error: error.message 
    });
  }
};

// @route   POST /api/login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('🔑 Login attempt:', { email, password });
    
    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Please provide email and password'
      });
    }
    
    // Check if user exists
    const user = await User.findOne({ email: email.toLowerCase() });
    console.log('User found:', user ? 'Yes' : 'No');
    
    if (!user) {
      return res.status(401).json({ 
        message: 'Invalid credentials',
        error: 'User not found'
      });
    }
    
    console.log('Stored password hash:', user.password);
    
    // Check password
    const isPasswordValid = await user.comparePassword(password);
    console.log('Password valid:', isPasswordValid);
    
    if (!isPasswordValid) {
      return res.status(401).json({ 
        message: 'Invalid credentials',
        error: 'Wrong password'
      });
    }
    
    // Generate token
    const token = generateToken(user._id, user.email, user.name);
    
    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: 'Server error during login',
      error: error.message 
    });
  }
};

module.exports = {
  registerUser,
  loginUser
};