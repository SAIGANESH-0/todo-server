//Import the required packages
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const port=process.env.PORT||3001;
const html = `
<!DOCTYPE html>
<html>
  <head>
    <title>Hello from Render!</title>
    <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.5.1/dist/confetti.browser.min.js"></script>
    <script>
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          disableForReducedMotion: true
        });
      }, 500);
    </script>
    <style>
      @import url("https://p.typekit.net/p.css?s=1&k=vnd5zic&ht=tk&f=39475.39476.39477.39478.39479.39480.39481.39482&a=18673890&app=typekit&e=css");
      @font-face {
        font-family: "neo-sans";
        src: url("https://use.typekit.net/af/00ac0a/00000000000000003b9b2033/27/l?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n7&v=3") format("woff2"), url("https://use.typekit.net/af/00ac0a/00000000000000003b9b2033/27/d?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n7&v=3") format("woff"), url("https://use.typekit.net/af/00ac0a/00000000000000003b9b2033/27/a?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n7&v=3") format("opentype");
        font-style: normal;
        font-weight: 700;
      }
      html {
        font-family: neo-sans;
        font-weight: 700;
        font-size: calc(62rem / 16);
      }
      body {
        background: white;
      }
      section {
        border-radius: 1em;
        padding: 1em;
        position: absolute;
        top: 50%;
        left: 50%;
        margin-right: -50%;
        transform: translate(-50%, -50%);
      }
    </style>
  </head>
  <body>
    <section>
      Hello from Render!
    </section>
  </body>
</html>`;

//Create an express app
const app = express();

//Use cors middleware to enable cross-origin requests
app.use(cors());

//Use express.json middleware to parse JSON requests
app.use(express.json());

//Define a schema for the todo model
const todoSchema = new mongoose.Schema({
  title: String,
  completed: Boolean
});

//Create a model for the todo collection
const Todo = mongoose.model("Todo", todoSchema);

//Connect to the mongodb database
mongoose.connect("mongodb+srv://saiganeshvoona:saiganesh@cluster0.nxggmur.mongodb.net/?retryWrites=true&w=majority", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

app.get("/", (req, res) => res.type('html').send(html));
//Create a route to get all todos
app.get("/todos", async (req, res) => {
  try {
    //Find all todos in the database
    const todos = await Todo.find();
    //Send the todos as a JSON response
    res.json(todos);
  } catch (err) {
    //Handle any errors
    res.status(500).send(err.message);
  }
});

//Create a route to create a new todo
app.post("/todos", async (req, res) => {
  try {
    //Create a new todo from the request body
    const todo = new Todo(req.body);
    //Save the todo to the database
    await todo.save();
    //Send the created todo as a JSON response
    res.json(todo);
  } catch (err) {
    //Handle any errors
    res.status(500).send(err.message);
  }
});

//Create a route to update an existing todo by id
app.put("/todos/:id", async (req, res) => {
  try {
    //Find the todo by id and update it with the request body
    const todo = await Todo.findByIdAndUpdate(req.params.id, req.body, {
      new: true
    });
    //Send the updated todo as a JSON response
    res.json(todo);
  } catch (err) {
    //Handle any errors
    res.status(500).send(err.message);
  }
});

//Create a route to delete an existing todo by id
app.delete("/todos/:id", async (req, res) => {
  try {
    //Find the todo by id and delete it from the database
    const todo = await Todo.findByIdAndDelete(req.params.id);
    //Send the deleted todo as a JSON response
    res.json(todo);
  } catch (err) {
    //Handle any errors
    res.status(500).send(err.message);
  }
});

//Start the server on port 3000
app.listen(port, () => {
  console.log("Server is running on port 3001");
});
