// Car Rental JavaScript with PHP Backend Integration
document.addEventListener("DOMContentLoaded", function () {
    
    // Check if user is logged in
    checkAuthStatus();
    
    // Load cars if on cars page
    if (window.location.pathname.includes('cars.html')) {
        loadCars();
    }
    
    // Load user bookings if on bookings page
    if (window.location.pathname.includes('bookings.html')) {
        loadUserBookings();
    }
    
    // Load admin data if on admin page
    if (window.location.pathname.includes('admin.html')) {
        loadAdminData();
    }

    // --- Login Form ---
    let loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", function (e) {
            e.preventDefault();
            handleLogin();
        });
    }

    // --- Register Form ---
    let registerForm = document.getElementById("registerForm");
    if (registerForm) {
        registerForm.addEventListener("submit", function (e) {
            e.preventDefault();
            handleRegister();
        });
    }

    // --- Booking Form ---
    let bookingForm = document.getElementById("bookingForm");
    if (bookingForm) {
        bookingForm.addEventListener("submit", function (e) {
            e.preventDefault();
            handleBooking();
        });
    }

    // --- Admin Car Form ---
    let addCarForm = document.getElementById("addCarForm");
    if (addCarForm) {
        addCarForm.addEventListener("submit", function (e) {
            e.preventDefault();
            handleAddCar();
        });
    }
});

// Authentication functions
function handleLogin() {
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value.trim();
    
    if (!email || !password) {
        showMessage("Συμπλήρωσε όλα τα πεδία!", "error");
        return;
    }
    
    const formData = new FormData();
    formData.append('action', 'login');
    formData.append('email', email);
    formData.append('password', password);
    
    fetch('auth.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showMessage(data.message, "success");
            setTimeout(() => {
                if (data.role === 'admin') {
                    window.location.href = 'admin.html';
                } else {
                    window.location.href = 'index.html';
                }
            }, 1000);
        } else {
            showMessage(data.message, "error");
        }
    })
    .catch(error => {
        showMessage("Σφάλμα δικτύου", "error");
        console.error('Error:', error);
    });
}

function handleRegister() {
    const name = document.getElementById("regName").value.trim();
    const email = document.getElementById("regEmail").value.trim();
    const password = document.getElementById("regPassword").value.trim();
    
    if (!name || !email || !password) {
        showMessage("Όλα τα πεδία είναι υποχρεωτικά!", "error");
        return;
    }
    
    // Email validation
    const emailPattern = /^[^ ]+@[^ ]+\.[a-z]{2,3}$/;
    if (!email.match(emailPattern)) {
        showMessage("Δώσε έγκυρο email!", "error");
        return;
    }
    
    // Password validation
    if (password.length < 6) {
        showMessage("Ο κωδικός πρέπει να έχει τουλάχιστον 6 χαρακτήρες!", "error");
        return;
    }
    
    const formData = new FormData();
    formData.append('action', 'register');
    formData.append('name', name);
    formData.append('email', email);
    formData.append('password', password);
    
    fetch('auth.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showMessage(data.message, "success");
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        } else {
            showMessage(data.message, "error");
        }
    })
    .catch(error => {
        showMessage("Σφάλμα δικτύου", "error");
        console.error('Error:', error);
    });
}

function handleLogout() {
    const formData = new FormData();
    formData.append('action', 'logout');
    
    fetch('auth.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showMessage(data.message, "success");
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        }
    })
    .catch(error => {
        console.error('Logout error:', error);
        window.location.href = 'index.html';
    });
}

// Cars functions
function loadCars() {
    fetch('cars_api.php?action=get_cars')
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            displayCars(data.data);
        } else {
            showMessage("Σφάλμα κατά τη φόρτωση αυτοκινήτων", "error");
        }
    })
    .catch(error => {
        showMessage("Σφάλμα δικτύου", "error");
        console.error('Error:', error);
    });
}

function displayCars(cars) {
    const carList = document.querySelector('.car-list');
    if (!carList) return;
    
    carList.innerHTML = '';
    
    cars.forEach(car => {
        if (car.available) {
            const carElement = document.createElement('div');
            carElement.className = 'car';
            carElement.innerHTML = `
                <h3>${car.brand} ${car.model}</h3>
                <p>Κατηγορία: ${car.category}</p>
                <p>Τιμή: ${car.price_per_day}€/μέρα</p>
                <p>${car.description || ''}</p>
                <button class="btn" onclick="selectCar(${car.id}, '${car.brand} ${car.model}', ${car.price_per_day})">Κράτηση</button>
            `;
            carList.appendChild(carElement);
        }
    });
}

function selectCar(carId, carName, pricePerDay) {
    // Store selected car data
    sessionStorage.setItem('selectedCar', JSON.stringify({
        id: carId,
        name: carName,
        pricePerDay: pricePerDay
    }));
    
    window.location.href = 'booking.html';
}

// Booking functions
function handleBooking() {
    const startDate = document.getElementById("startDate").value;
    const endDate = document.getElementById("endDate").value;
    const selectedCar = JSON.parse(sessionStorage.getItem('selectedCar') || '{}');
    
    if (!startDate || !endDate) {
        showMessage("Συμπλήρωσε και τις δύο ημερομηνίες!", "error");
        return;
    }
    
    if (!selectedCar.id) {
        showMessage("Δεν έχει επιλεγεί αυτοκίνητο", "error");
        return;
    }
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start >= end) {
        showMessage("Η ημερομηνία λήξης πρέπει να είναι μετά την ημερομηνία έναρξης!", "error");
        return;
    }
    
    const formData = new FormData();
    formData.append('action', 'create_booking');
    formData.append('car_id', selectedCar.id);
    formData.append('start_date', startDate);
    formData.append('end_date', endDate);
    
    fetch('bookings_api.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showMessage(`Η κράτηση δημιουργήθηκε επιτυχώς! Συνολικό κόστος: ${data.total_price}€`, "success");
            sessionStorage.removeItem('selectedCar');
            setTimeout(() => {
                window.location.href = 'bookings.html';
            }, 2000);
        } else {
            showMessage(data.message, "error");
        }
    })
    .catch(error => {
        showMessage("Σφάλμα δικτύου", "error");
        console.error('Error:', error);
    });
}

function loadUserBookings() {
    fetch('bookings_api.php?action=get_user_bookings')
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            displayUserBookings(data.data);
        } else {
            showMessage(data.message, "error");
        }
    })
    .catch(error => {
        showMessage("Σφάλμα δικτύου", "error");
        console.error('Error:', error);
    });
}

function displayUserBookings(bookings) {
    const bookingsList = document.getElementById('bookingsList');
    if (!bookingsList) return;
    
    if (bookings.length === 0) {
        bookingsList.innerHTML = '<p>Δεν έχεις κρατήσεις.</p>';
        return;
    }
    
    bookingsList.innerHTML = bookings.map(booking => `
        <div class="booking-item">
            <h3>${booking.brand} ${booking.model}</h3>
            <p>Κατηγορία: ${booking.category}</p>
            <p>Ημερομηνίες: ${booking.start_date} - ${booking.end_date}</p>
            <p>Συνολικό κόστος: ${booking.total_price}€</p>
            <p>Κατάσταση: ${getStatusText(booking.status)}</p>
            <p>Πληρωμή: ${getPaymentStatusText(booking.payment_status)}</p>
            ${booking.status === 'pending' ? `<button class="btn cancel-btn" onclick="cancelBooking(${booking.id})">Ακύρωση</button>` : ''}
        </div>
    `).join('');
}

function cancelBooking(bookingId) {
    if (!confirm('Είσαι σίγουρος ότι θέλεις να ακυρώσεις την κράτηση;')) {
        return;
    }
    
    const formData = new FormData();
    formData.append('action', 'cancel_booking');
    formData.append('booking_id', bookingId);
    
    fetch('bookings_api.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showMessage(data.message, "success");
            loadUserBookings();
        } else {
            showMessage(data.message, "error");
        }
    })
    .catch(error => {
        showMessage("Σφάλμα δικτύου", "error");
        console.error('Error:', error);
    });
}

// Admin functions
function loadAdminData() {
    loadCars();
    loadAllBookings();
}

function handleAddCar() {
    const model = document.getElementById("carModel").value.trim();
    const brand = document.getElementById("carBrand").value.trim();
    const category = document.getElementById("carCategory").value.trim();
    const pricePerDay = parseFloat(document.getElementById("carPrice").value);
    const description = document.getElementById("carDescription").value.trim();
    
    if (!model || !brand || !category || !pricePerDay) {
        showMessage("Συμπλήρωσε όλα τα απαραίτητα πεδία!", "error");
        return;
    }
    
    const formData = new FormData();
    formData.append('action', 'add_car');
    formData.append('model', model);
    formData.append('brand', brand);
    formData.append('category', category);
    formData.append('price_per_day', pricePerDay);
    formData.append('description', description);
    
    fetch('cars_api.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showMessage(data.message, "success");
            document.getElementById("addCarForm").reset();
            loadCars();
        } else {
            showMessage(data.message, "error");
        }
    })
    .catch(error => {
        showMessage("Σφάλμα δικτύου", "error");
        console.error('Error:', error);
    });
}

function deleteCar(carId) {
    if (!confirm('Είσαι σίγουρος ότι θέλεις να διαγράψεις αυτό το αυτοκίνητο;')) {
        return;
    }
    
    const formData = new FormData();
    formData.append('action', 'delete_car');
    formData.append('id', carId);
    
    fetch('cars_api.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showMessage(data.message, "success");
            loadCars();
        } else {
            showMessage(data.message, "error");
        }
    })
    .catch(error => {
        showMessage("Σφάλμα δικτύου", "error");
        console.error('Error:', error);
    });
}

function loadAllBookings() {
    fetch('bookings_api.php?action=get_bookings')
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            displayAllBookings(data.data);
        } else {
            showMessage(data.message, "error");
        }
    })
    .catch(error => {
        showMessage("Σφάλμα δικτύου", "error");
        console.error('Error:', error);
    });
}

function displayAllBookings(bookings) {
    const bookingsList = document.getElementById('adminBookingsList');
    if (!bookingsList) return;
    
    if (bookings.length === 0) {
        bookingsList.innerHTML = '<p>Δεν υπάρχουν κρατήσεις.</p>';
        return;
    }
    
    bookingsList.innerHTML = bookings.map(booking => `
        <div class="booking-item">
            <h3>${booking.brand} ${booking.model}</h3>
            <p>Πελάτης: ${booking.customer_name} (${booking.customer_email})</p>
            <p>Ημερομηνίες: ${booking.start_date} - ${booking.end_date}</p>
            <p>Συνολικό κόστος: ${booking.total_price}€</p>
            <p>Κατάσταση: ${getStatusText(booking.status)}</p>
            <p>Πληρωμή: ${getPaymentStatusText(booking.payment_status)}</p>
            <button class="btn" onclick="updateBookingStatus(${booking.id}, 'confirmed')">Επιβεβαίωση</button>
            <button class="btn cancel-btn" onclick="updateBookingStatus(${booking.id}, 'cancelled')">Ακύρωση</button>
        </div>
    `).join('');
}

function updateBookingStatus(bookingId, status) {
    const formData = new FormData();
    formData.append('action', 'update_booking_status');
    formData.append('booking_id', bookingId);
    formData.append('status', status);
    
    fetch('bookings_api.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showMessage(data.message, "success");
            loadAllBookings();
        } else {
            showMessage(data.message, "error");
        }
    })
    .catch(error => {
        showMessage("Σφάλμα δικτύου", "error");
        console.error('Error:', error);
    });
}

// Utility functions
function checkAuthStatus() {
    // This would typically check session status
    // For now, we'll update navigation based on current page
    updateNavigation();
}

function updateNavigation() {
    const nav = document.querySelector('nav');
    if (!nav) return;
    
    // Add logout functionality if needed
    const logoutLink = nav.querySelector('.logout-link');
    if (logoutLink) {
        logoutLink.addEventListener('click', function(e) {
            e.preventDefault();
            handleLogout();
        });
    }
}

function showMessage(message, type = 'info') {
    // Create or update message element
    let messageEl = document.getElementById('message');
    if (!messageEl) {
        messageEl = document.createElement('div');
        messageEl.id = 'message';
        document.body.insertBefore(messageEl, document.body.firstChild);
    }
    
    messageEl.textContent = message;
    messageEl.className = `message ${type}`;
    messageEl.style.display = 'block';
    
    // Auto hide after 5 seconds
    setTimeout(() => {
        messageEl.style.display = 'none';
    }, 5000);
}

function getStatusText(status) {
    const statusTexts = {
        'pending': 'Εκκρεμεί',
        'confirmed': 'Επιβεβαιωμένη',
        'cancelled': 'Ακυρωμένη',
        'completed': 'Ολοκληρωμένη'
    };
    return statusTexts[status] || status;
}

function getPaymentStatusText(paymentStatus) {
    const paymentStatusTexts = {
        'pending': 'Εκκρεμεί',
        'paid': 'Πληρωμένη',
        'failed': 'Απέτυχε',
        'refunded': 'Επιστράφηκε'
    };
    return paymentStatusTexts[paymentStatus] || paymentStatus;
}