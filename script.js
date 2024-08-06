document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('token');

    if (token) {
        document.getElementById('login-container').style.display = 'none';
        document.getElementById('request-container').style.display = 'block';
        loadRequests();
    }

    document.getElementById('login-form').addEventListener('submit', function(event) {
        event.preventDefault();
        login();
    });

    document.getElementById('request-form').addEventListener('submit', function(event) {
        event.preventDefault();
        submitRequest();
    });
});

function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    fetch('/api/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => {
        localStorage.setItem('token', data.token);
        document.getElementById('login-container').style.display = 'none';
        document.getElementById('request-container').style.display = 'block';
        loadRequests();
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function submitRequest() {
    const date = document.getElementById('date').value;
    const reason = document.getElementById('reason').value;
    const token = localStorage.getItem('token');

    fetch('/api/request', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ date, reason })
    })
    .then(response => {
        if (response.status === 201) {
            loadRequests();
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function loadRequests() {
    const token = localStorage.getItem('token');

    fetch('/api/requests', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(data => {
        const requestsList = document.querySelector('.requests');
        requestsList.innerHTML = '';
        data.forEach(request => {
            const requestItem = document.createElement('li');
            requestItem.classList.add('list-group-item');
            requestItem.classList.add('request');
            requestItem.classList.add(request.status);
            requestItem.innerHTML = `
                <p><strong>Date:</strong> ${new Date(request.date).toLocaleDateString()}</p>
                <p><strong>Reason:</strong> ${request.reason}</p>
                <p><strong>Status:</strong> ${request.status}</p>
            `;
            if (request.status === 'pending' && (token.role === 'cc' || token.role === 'hod')) {
                const approveButton = document.createElement('button');
                approveButton.classList.add('btn', 'btn-success', 'mr-2');
                approveButton.textContent = 'Approve';
                approveButton.onclick = () => updateRequestStatus(request._id, 'approved');
                const declineButton = document.createElement('button');
                declineButton.classList.add('btn', 'btn-danger');
                declineButton.textContent = 'Decline';
                declineButton.onclick = () => updateRequestStatus(request._id, 'declined');
                requestItem.appendChild(approveButton);
                requestItem.appendChild(declineButton);
            }
            requestsList.appendChild(requestItem);
        });
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function updateRequestStatus(id, status) {
    const token = localStorage.getItem('token');

    fetch(`/api/request/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
    })
    .then(response => {
        if (response.status === 200) {
            loadRequests();
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}
