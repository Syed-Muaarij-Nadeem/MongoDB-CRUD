const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Middleware
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

// Schema and Model
const employeeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    address: { type: String, required: true },
    designation: { type: String, required: true },
});

const Employee = mongoose.model('Employee', employeeSchema);

// CRUD Routes
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
