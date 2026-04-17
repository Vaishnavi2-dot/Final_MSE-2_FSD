const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// THIS MUST WORK - Direct approach without next parameter issues
userSchema.pre('save', function(next) {
  console.log('🔐 Pre-save middleware triggered');
  console.log('Password before hash:', this.password);
  
  const user = this;
  
  // Only hash if password is modified
  if (!user.isModified('password')) {
    console.log('Password not modified, skipping hash');
    return next();
  }
  
  console.log('Hashing password...');
  
  // Generate salt and hash
  bcrypt.genSalt(10, (err, salt) => {
    if (err) {
      console.error('Salt generation error:', err);
      return next(err);
    }
    
    bcrypt.hash(user.password, salt, (err, hash) => {
      if (err) {
        console.error('Hash generation error:', err);
        return next(err);
      }
      
      user.password = hash;
      console.log('Password hashed successfully:', hash);
      next();
    });
  });
});

// Compare password method
userSchema.methods.comparePassword = function(candidatePassword) {
  console.log('Comparing password...');
  console.log('Candidate:', candidatePassword);
  console.log('Stored hash:', this.password);
  
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);