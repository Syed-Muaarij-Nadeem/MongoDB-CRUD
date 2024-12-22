const apiUrl = 'http://localhost:5000/hotelmanagement';

$(document).ready(function () {
    // Fetch employees and display in the list
    function fetchEmployees() {
        $.get(apiUrl, function (employees) {
            $('#employeeList').empty();
            employees.forEach(employee => {
                const listItem = $(`
                    <li>
                        <div class="employee-details">
                            <div class="employee-name">${employee.name}</div>
                            <div class="employee-address">Address: ${employee.address}</div>
                            <div class="employee-designation">Designation: ${employee.designation}</div>
                        </div>
                        <div class="employee-buttons">
                            <button class="btn-info edit-btn" data-id="${employee._id}">Edit</button>
                            <button class="btn-danger delete-btn" data-id="${employee._id}">Delete</button>
                        </div>
                    </li>
                `);
                $('#employeeList').append(listItem);
            });
        }).fail(function () {
            alert('Failed to fetch employees.');
        });
    }

    // Add or Update Employee
    $('#employeeForm').on('submit', function (e) {
        e.preventDefault();
        const id = $('#employeeId').val();
        const employeeData = {
            name: $('#name').val(),
            address: $('#address').val(),
            designation: $('#designation').val()
        };

        if (id) {
            // Update existing employee
            $.ajax({
                url: `${apiUrl}/${id}`,
                method: 'PUT',
                contentType: 'application/json',
                data: JSON.stringify(employeeData),
                success: function () {
                    alert('Employee updated successfully!');
                    $('#employeeForm')[0].reset();
                    $('#employeeId').val('');
                    fetchEmployees();
                },
                error: function (err) {
                    console.error(err);
                    alert('Failed to update employee.');
                }
            });
        } else {
            // Add new employee
            $.ajax({
                url: apiUrl,
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(employeeData),
                success: function () {
                    alert('Employee added successfully!');
                    $('#employeeForm')[0].reset();
                    fetchEmployees();
                },
                error: function (err) {
                    console.error(err);
                    alert('Failed to add employee.');
                }
            });
        }
    });

    // Edit Employee
    $('#employeeList').on('click', '.edit-btn', function () {
        const id = $(this).data('id');
        $.get(`${apiUrl}/${id}`, function (employee) {
            $('#employeeId').val(employee._id);
            $('#name').val(employee.name);
            $('#address').val(employee.address);
            $('#designation').val(employee.designation);
        }).fail(function () {
            alert('Failed to fetch employee details.');
        });
    });

    // Delete Employee
    $('#employeeList').on('click', '.delete-btn', function () {
        const id = $(this).data('id');
        if (confirm('Are you sure you want to delete this employee?')) {
            $.ajax({
                url: `${apiUrl}/${id}`,
                method: 'DELETE',
                success: function () {
                    alert('Employee deleted successfully!');
                    fetchEmployees();
                },
                error: function (err) {
                    console.error(err);
                    alert('Failed to delete employee.');
                }
            });
        }
    });

    $(document).ready(function () {
        $('#logoutButton').on('click', function () {
            $.ajax({
                url: '/logout',
                type: 'GET',
                success: function () {
                    window.location.href = '/login';
                },
                error: function (xhr, status, error) {
                    console.error('Error logging out:', error);
                }
            });
        });
    });


    // Fetch employees on page load
    fetchEmployees();
});


