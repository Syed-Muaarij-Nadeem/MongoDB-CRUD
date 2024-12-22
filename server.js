const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const User = require('./models/user');  // Renamed 'user' to 'User' for consistency
const bcrypt = require('bcrypt');
const path = require('path');
const session = require('express-session');
const cookieParser = require('cookie-parser');



const app = express();
const PORT = 5000;

// Authentication
app.set('view engine', 'ejs');
app.set('views', 'views');
app.use(express.static(__dirname));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
    session({
        secret: 'mysecret',
        resave: false,
        saveUninitialized: false,
    })
);
// Schema and Model
const employeeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    address: { type: String, required: true },
    designation: { type: String, required: true },
});

const Employee = mongoose.model('Employee', employeeSchema);

// Middleware
function isAuthenticated(req, res, next) {
    if (req.session.isLoggedIn) {
        next();
    } else {
        res.redirect('/login');
    }
}
app.use(cors({
    origin: '*', // Allow all origins for development
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allow these methods
    allowedHeaders: ['Content-Type'] // Allow these headers
}));
app.use(express.json());

// Database Connection
mongoose.connect('mongodb://localhost:27017/hotel', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Error connecting to MongoDB:', err));

// CRUD Routes
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Home</title>
            <link rel="stylesheet" href="/style.css">  
        </head>
        <body>
            <h1>Welcome to the Home Page</h1>
            <button class="btn-primary" onclick="window.location.href='/login'">Login</button>
            <button class="btn-primary" onclick="window.location.href='/register'">Signup</button>
        </body>
        </html>
    `);
});



app.get('/register', (req, res) => {
    res.render('register');
});

app.post('/register', async (req, res) => {
    try {
        const { password, username } = req.body;

        // Check if the username already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).send('Username already exists');
        }

        // Hash the password
        const hash = await bcrypt.hash(password, 12);

        // Create a new user
        const user = new User({
            username,
            password: hash
        });

        // Save the user to the database
        await user.save();

        res.send('User registered successfully!');
        res.redirect('/login')
    } catch (err) {
        console.error('Error registering user:', err);
        res.status(500).send('Error registering user');
    }
});


app.get('/CRUD', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'CRUD.html'));
});


app.get('/secret', (req, res) => {
    if (!req.session.user_id) {
        res.redirect('/login');
    }
    res.send('Login required!');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        console.log('Login Attempt:', { username, password });

        const user = await User.findOne({ username });

        if (!user) {
            console.log('User not found');
            return res.send('User not found!');
        }

        const validPass = await bcrypt.compare(password, user.password);

        if (validPass) {
            console.log('Login successful');

            req.session.isLoggedIn = true;

            let loginCount = req.cookies.loginCount || 0;
            loginCount = parseInt(loginCount) + 1;
            res.cookie('loginCount', loginCount, { maxAge: 24 * 60 * 60 * 1000, httpOnly: true });

            res.render('loggedIn', { loginCount });
        } else {
            console.log('Incorrect password');
            res.send('Incorrect Password!');
        }
    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).send('Error logging in');
    }
});




app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send('Error logging out');
        }
        res.status(200).send('Logged out successfully');
    });
});



app.get('/hotelmanagement', async (req, res) => {
    try {
        const employees = await Employee.find();
        res.json(employees);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/hotelmanagement/:id', async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);
        if (!employee) return res.status(404).json({ message: 'Employee not found' });
        res.json(employee);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/hotelmanagement', async (req, res) => {
    try {
        const { name, address, designation } = req.body;
        const newEmployee = new Employee({ name, address, designation });
        await newEmployee.save();
        res.status(201).json(newEmployee);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/hotelmanagement/:id', async (req, res) => {
    try {
        const { name, address, designation } = req.body;
        const updatedEmployee = await Employee.findByIdAndUpdate(
            req.params.id,
            { name, address, designation },
            { new: true }
        );
        if (!updatedEmployee) return res.status(404).json({ message: 'Employee not found' });
        res.json(updatedEmployee);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/hotelmanagement/:id', async (req, res) => {
    try {
        const deletedEmployee = await Employee.findByIdAndDelete(req.params.id);
        if (!deletedEmployee) return res.status(404).json({ message: 'Employee not found' });
        res.json({ message: 'Employee deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Server Listening
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
