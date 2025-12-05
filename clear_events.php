<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $file = 'events_data.json';
    file_put_contents($file, json_encode([]));

    echo json_encode([
        'success' => true,
        'message' => 'Events cleared'
    ]);
} else {
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
}
?>