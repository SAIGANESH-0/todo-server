
// Import packages
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');

// Create express app
const app = express();

// Use middleware
app.use(express.json());
app.use(cors());

const passw = process.env.PASSWORD;

// Connect to MongoDB database
mongoose.connect(`mongodb+srv://saiganeshvoona:${passw}@cluster0.nxggmur.mongodb.net/?retryWrites=true&w=majority`, {useNewUrlParser: true, useUnifiedTopology: true,dbName:"mern"})
.then(() => console.log('Connected to database'))
.catch(err => console.error(err));

// Define schema and model for users
const userSchema = new mongoose.Schema({
  username: {type: String, required: true, unique: true},
  password: {type: String, required: true},
  todos: [{type: mongoose.Schema.Types.ObjectId, ref: 'Todo'}]
});

const User = mongoose.model('User', userSchema);

// Define schema and model for todos
const todoSchema = new mongoose.Schema({
  title: {type: String, required: true},
  completed: {type: Boolean, default: false},
  user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
});

const Todo = mongoose.model('Todo', todoSchema);

// Define a secret key for jwt
const secretKey = process.env.SECRET;

// Define a function to verify jwt
const verifyToken = (req, res, next) => {
  // Get the token from the header
  const token = req.headers['authorization'];
  // Check if the token exists
  if (!token) {
    // Return an error response
    return res.status(401).json({message: 'No token provided'});
  }
  // Verify the token
  jwt.verify(token, secretKey, (err, decoded) => {
    // Check if the token is valid
    if (err) {
        console.log(err)
      // Return an error response
      return res.status(401).json({message: 'Invalid token'});
    }
    // Set the req.user to the decoded payload
    req.user = decoded;
    // Call the next middleware function
    next();
  });
};

// Define a route for user registration
app.post('/register', async (req, res) => {
  // Get the username and password from the request body
  const {username, password} = req.body;
  // Check if the username and password are provided
  if (!username || !password) {
    // Return an error response
    return res.status(400).json({message: 'Username and password are required'});
  }
  try {
    // Create a new user with the username and password
    const user = new User({username, password});
    // Save the user to the database
    await user.save();
    // Return a success response with the user data
    res.status(201).json({user});
  } catch (err) {
    // Return an error response with the error message
    res.status(500).json({message: err.message});
  }
});

// Define a route for user login
app.post('/login', async (req, res) => {
  // Get the username and password from the request body
  const {username, password} = req.body;
  // Check if the username and password are provided
  if (!username || !password) {
    // Return an error response
    return res.status(400).json({message: 'Username and password are required'});
  }
  try {
    // Find the user by the username in the database
    const user = await User.findOne({username});
    // Check if the user exists and the password matches
    if (user && user.password === password) {
      // Generate a jwt with the user id as the payload
      const token = jwt.sign({id: user._id}, secretKey);
      // Return a success response with the token and the user data
      res.status(200).json({token, user});
    } else {
      // Return an error response with an invalid credentials message
      res.status(401).json({message: 'Invalid username or password'});
    }
  } catch (err) {
    // Return an error response with the error message
    res.status(500).json({message: err.message});
  }
});

// Define a route for getting all todos of a user
app.get('/todos', verifyToken, async (req, res) => {
  try {
    // Find the user by the id from the req.user object
    const user = await User.findById(req.user.id).populate('todos');
    // Check if the user exists
    if (user) {
      // Populate the todos field of the user with the todo documents
      // Return a success response with the user's todos
      res.status(200).json({todos: user.todos});
    } else {
      // Return an error response with a user not found message
      res.status(404).json({message: 'User not found'});
    }
  } catch (err) {
    // Return an error response with the error message
    res.status(500).json({message: err.message});
  }
});

// Define a route for creating a new todo for a user
app.post('/todos', verifyToken, async (req, res) => {
  // Get the title from the request body
  const {title} = req.body;
  // Check if the title is provided
  if (!title) {
    // Return an error response
    return res.status(400).json({message: 'Title is required'});
  }
  try {
    // Create a new todo with the title and the user id from the req.user object
    const todo = new Todo({title, user: req.user.id});
    // Save the todo to the database
    await todo.save();
    // Find the user by the id from the req.user object
    const user = await User.findById(req.user.id);
    // Check if the user exists
    if (user) {
      // Push the todo id to the user's todos array
      user.todos.push(todo._id);
      // Save the user to the database
      await user.save();
      // Return a success response with the todo data
      res.status(201).json({todo});
    } else {
      // Return an error response with a user not found message
      res.status(404).json({message: 'User not found'});
    }
  } catch (err) {
    // Return an error response with the error message
    res.status(500).json({message: err.message});
  }
});

// Define a route for updating a todo by id
app.put('/todos/:id', verifyToken, async (req, res) => {
  // Get the id from the request params
  const {id} = req.params;
  // Get the title and completed from the request body
  const {title, completed} = req.body;
  try {
    // Find the todo by the id in the database
    const todo = await Todo.findById(id);
    // Check if the todo exists and belongs to the user
    if (todo && todo.user.equals(req.user.id)) {
      // Update the todo with the title and completed values if provided
      if (title) {
        todo.title = title;
      }
      if (completed !== undefined) {
        todo.completed = completed;
      }
      // Save the todo to the database
      await todo.save();
      // Return a success response with the updated todo data
      res.status(200).json({todo});
    } else {
      // Return an error response with a todo not found or unauthorized message
      res.status(404).json({message: 'Todo not found or unauthorized'});
    }
  } catch (err) {
    // Return an error response with the error message
    res.status(500).json({message: err.message});
  }
});

// Define a route for deleting a todo by id
app.delete('/todos/:id', verifyToken, async (req, res) => {
  // Get the id from the request params
  const {id} = req.params;
  try {
    // Find and delete the todo by the id in the database
    const todo = await Todo.findByIdAndDelete(id);
    // Check if the todo exists and belongs to the user
    if (todo && todo.user.equals(req.user.id)) {
      // Find the user by the id from the req.user object
      const user = await User.findById(req.user.id);
      // Check if the user exists
      if (user) {
        // Pull out the todo id from the user's todos array
        user.todos.pull(todo._id);
        // Save the user to the database
        await user.save();
        // Return a success response with a deleted message
        res.status(200).json({message: 'Todo deleted'});
      } else {
        // Return an error response with a user not found message
        res.status(404).json({message: 'User not found'});
      }
    } else {
      // Return an error responseOk, here is the final part of the code.
      res.status(404).json({message: 'Todo not found or unauthorized'});
    }
  } catch (err) {
    // Return an error response with the error message
    res.status(500).json({message: err.message});
  }
});

// Define a port number
const port = process.env.PORT || 3001;

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
