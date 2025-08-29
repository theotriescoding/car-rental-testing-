<?php
require 'db_connect.php';
session_start();

$action = $_POST['action'] ?? $_GET['action'] ?? '';

if ($action === 'createbooking' && isset($_SESSION['userid'])) {
    // Price calculation
    $stmt = $pdo->prepare("SELECT priceperday FROM cars WHERE id = ?");
    $stmt->execute([$_POST['carid']]);
    $car = $stmt->fetch();
    $days = max(1, (strtotime($_POST['enddate']) - strtotime($_POST['startdate'])) / (60*60*24));
    $totalPrice = $days * $car['priceperday'];
    $stmt = $pdo->prepare("INSERT INTO bookings (carid, userid, startdate, enddate, totalprice) VALUES (?, ?, ?, ?, ?)");
    $success = $stmt->execute([$_POST['carid'], $_SESSION['userid'], $_POST['startdate'], $_POST['enddate'], $totalPrice]);
    echo json_encode(['success' => $success, 'totalprice' => $totalPrice, 'message' => $success ? 'Booking created!' : 'Booking failed']);
    exit;
}

// Fetch own bookings
if ($action === 'getuserbookings' && isset($_SESSION['userid'])) {
    $stmt = $pdo->prepare("SELECT b.*, c.brand, c.model, c.category FROM bookings b JOIN cars c ON b.carid = c.id WHERE b.userid = ?");
    $stmt->execute([$_SESSION['userid']]);
    $bookings = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(['success' => true, 'data' => $bookings]);
    exit;
}

// Admin fetch all bookings
if ($action === 'getbookings' && $_SESSION['role'] === 'admin') {
    $bookings = $pdo->query("SELECT b.*, u.name as customername, u.email as customeremail, c.brand, c.model, c.category FROM bookings b JOIN users u ON b.userid = u.id JOIN cars c ON b.carid = c.id")->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(['success' => true, 'data' => $bookings]);
    exit;
}

// Cancel booking
if ($action === 'cancelbooking' && isset($_SESSION['userid'])) {
    $stmt = $pdo->prepare("UPDATE bookings SET status = 'cancelled' WHERE id = ? AND userid = ?");
    $success = $stmt->execute([$_POST['bookingid'], $_SESSION['userid']]);
    echo json_encode(['success' => $success, 'message' => $success ? 'Booking cancelled!' : 'Failed to cancel']);
    exit;
}

// Admin update status
if ($action === 'updatebookingstatus' && $_SESSION['role'] === 'admin') {
    $stmt = $pdo->prepare("UPDATE bookings SET status = ? WHERE id = ?");
    $success = $stmt->execute([$_POST['status'], $_POST['bookingid']]);
    echo json_encode(['success' => $success, 'message' => $success ? 'Status updated!' : 'Failed']);
    exit;
}
?>
