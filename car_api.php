<?php
require 'db_connect.php';
session_start();

$action = $_POST['action'] ?? $_GET['action'] ?? '';

if ($action === 'getcars') {
    $cars = $pdo->query("SELECT * FROM cars")->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(['success' => true, 'data' => $cars]);
    exit;
}

if ($action === 'addcar' && $_SESSION['role'] === 'admin') {
    $stmt = $pdo->prepare("INSERT INTO cars (brand, model, category, priceperday, description) VALUES (?, ?, ?, ?, ?)");
    $success = $stmt->execute([$_POST['brand'], $_POST['model'], $_POST['category'], $_POST['priceperday'], $_POST['description']]);
    echo json_encode(['success' => $success, 'message' => $success ? 'Car added!' : 'Failed to add car']);
    exit;
}

if ($action === 'deletecar' && $_SESSION['role'] === 'admin') {
    $stmt = $pdo->prepare("DELETE FROM cars WHERE id = ?");
    $success = $stmt->execute([$_POST['id']]);
    echo json_encode(['success' => $success, 'message' => $success ? 'Car deleted!' : 'Failed to delete car']);
    exit;
}
?>
