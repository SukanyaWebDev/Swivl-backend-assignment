const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = 5001;

app.use(bodyParser.json());

// Database setup
const db = new sqlite3.Database('recipes.db');

// User Class
class User {
  constructor(username, password, email) {
    this.username = username;
    this.password = password;
    this.email = email;
  }

  register() {
    return new Promise((resolve, reject) => {
      const query = 'INSERT INTO users (username, password, email) VALUES (?, ?, ?)';
      db.run(query, [this.username, this.password, this.email], (err) => {
        if (err) {
          reject(err);
        } else {
          resolve('User registered successfully');
        }
      });
    });
  }

  login() {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM users WHERE username = ? AND password = ?';
      db.get(query, [this.username, this.password], (err, row) => {
        if (err) {
          reject(err);
        } else if (row) {
          const token = jwt.sign({ username: this.username }, 'secret_key', { expiresIn: '1h' });
          resolve(token);
        } else {
          reject('Invalid credentials');
        }
      });
    });
  }

  manageProfile(updatedEmail) {
    return new Promise((resolve, reject) => {
      const query = 'UPDATE users SET email = ? WHERE username = ?';
      db.run(query, [updatedEmail, this.username], (err) => {
        if (err) {
          reject(err);
        } else {
          resolve('Profile updated successfully');
        }
      });
    });
  }
}

// Recipe Class
class Recipe {
  constructor(title, description, ingredients, instructions, images) {
    this.title = title;
    this.description = description;
    this.ingredients = ingredients;
    this.instructions = instructions;
    this.images = images;
  }

  createRecipe() {
    return new Promise((resolve, reject) => {
      const query =
        'INSERT INTO recipes (title, description, ingredients, instructions, images) VALUES (?, ?, ?, ?, ?)';
      db.run(
        query,
        [this.title, this.description, this.ingredients, this.instructions, this.images],
        (err) => {
          if (err) {
            reject(err);
          } else {
            resolve('Recipe created successfully');
          }
        }
      );
    });
  }

  readRecipe(recipeId) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM recipes WHERE id = ?';
      db.get(query, [recipeId], (err, row) => {
        if (err) {
          reject(err);
        } else if (row) {
          resolve(row);
        } else {
          reject('Recipe not found');
        }
      });
    });
  }

  updateRecipe(recipeId, updatedData) {
    return new Promise((resolve, reject) => {
      const query =
        'UPDATE recipes SET title = ?, description = ?, ingredients = ?, instructions = ?, images = ? WHERE id = ?';
      const { title, description, ingredients, instructions, images } = updatedData;
      db.run(
        query,
        [title, description, ingredients, instructions, images, recipeId],
        (err) => {
          if (err) {
            reject(err);
          } else {
            resolve('Recipe updated successfully');
          }
        }
      );
    });
  }

  deleteRecipe(recipeId) {
    return new Promise((resolve, reject) => {
      const query = 'DELETE FROM recipes WHERE id = ?';
      db.run(query, [recipeId], (err) => {
        if (err) {
          reject(err);
        } else {
          resolve('Recipe deleted successfully');
        }
      });
    });
  }
}

// Authentication Middleware
function authenticate(req, res, next) {
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader) {
    return res.status(401).json({ error: 'Authorization header not provided' });
  }

  const token = authorizationHeader.split(' ')[1];

  if (token) {
    jwt.verify(token, 'secret_key', (err, decoded) => {
      if (err) {
        return res.status(401).json({ error: 'Invalid token' });
      } else {
        req.username = decoded.username;
        next();
      }
    });
  } else {
    return res.status(401).json({ error: 'Token not provided' });
  }
}

// Database Initialization
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT,
    password TEXT,
    email TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS recipes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    description TEXT,
    ingredients TEXT,
    instructions TEXT,
    images TEXT
  )`);

  // Sample data insertion
  const sampleUser = new User('user1', 'password123', 'user1@example.com');
  sampleUser.register();

  const sampleRecipe = new Recipe('Recipe 1', 'Description 1', 'Ingredient 1', 'Instruction 1', 'image1.jpg');
  sampleRecipe.createRecipe();
});

// User routes
app.post('/register', async (req, res) => {
  try {
    const { username, password, email } = req.body;
    const newUser = new User(username, password, email);
    const result = await newUser.register();
    res.json({ message: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const loginUser = new User(username, password);
    const token = await loginUser.login();
    res.json({ token });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

app.put('/profile', authenticate, async (req, res) => {
  try {
    const { email } = req.body;
    const updateUser = new User(req.username, null, email);
    const result = await updateUser.manageProfile(email);
    res.json({ message: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Recipe routes
app.post('/recipes', authenticate, async (req, res) => {
  try {
    const { title, description, ingredients, instructions, images } = req.body;
    const newRecipe = new Recipe(title, description, ingredients, instructions, images);
    const result = await newRecipe.createRecipe();
    res.json({ message: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/recipes/:id', authenticate, async (req, res) => {
  try {
    const recipeId = req.params.id;
    const recipe = await new Recipe().readRecipe(recipeId);
    res.json({ recipe });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

app.put('/recipes/:id', authenticate, async (req, res) => {
  try {
    const recipeId = req.params.id;
    const updatedData = req.body;
    const result = await new Recipe().updateRecipe(recipeId, updatedData);
    res.json({ message: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/recipes/:id', authenticate, async (req, res) => {
  try {
    const recipeId = req.params.id;
    const result = await new Recipe().deleteRecipe(recipeId);
    res.json({ message: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
