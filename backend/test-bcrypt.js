import mongoose from 'mongoose';
import User from './models/User.js'; // adjust the path

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/employee_management', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('MongoDB connected');
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

// Function to create a new user
async function createUser() {
  try {
    const newUser = new User({
      name: 'John Doe',
      email: 'rohit2@example.com',
      password: 'rohit123',
      role: 'admin'
      // employeeId, isActive, lastLogin are optional or default
    });

    const savedUser = await newUser.save();
    console.log('User created:', savedUser);
  } catch (error) {
    console.error('Error creating user:', error);
  } finally {
    mongoose.connection.close(); // close connection when done
  }
}

// Run the function
createUser();
