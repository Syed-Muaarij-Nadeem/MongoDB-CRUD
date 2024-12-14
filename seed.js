const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/hotel', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Error connecting to MongoDB', err));

const employeeSchema = new mongoose.Schema({
    name: String,
    address: String,
    designation: String,
});

const Employee = mongoose.model('Employee', employeeSchema);

const seedEmployees = [
    { name: "John Doe", address: "154 Maple St, New York, NY", designation: "Front Desk Manager" },
    { name: "Emily Smith", address: "456 Elm Ave, Los Angeles, CA", designation: "Housekeeping Supervisor" },
    { name: "Michael Johnson", address: "789 Oak Blvd, Chicago, IL", designation: "Concierge" },
    { name: "Sarah Brown", address: "101 Pine Rd, Houston, TX", designation: "General Manager" },
    { name: "David Wilson", address: "202 Cedar Ln, Miami, FL", designation: "Head Chef" },
    { name: "Jessica Davis", address: "303 Birch St, San Francisco, CA", designation: "Event Coordinator" },
    { name: "Laura Martinez", address: "707 Fir Pl, Phoenix, AZ", designation: "Food & Beverage Manager" },
];

Employee.deleteMany({}).then(() => {
    Employee.insertMany(seedEmployees)
        .then(() => {
            console.log('Employees seeded successfully');
            mongoose.connection.close();
        })
        .catch(err => {
            console.error('Error seeding employees', err);
            mongoose.connection.close();
        });
});