<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $file = 'events_data.json';
    
    if (file_exists($file)) {
        $content = file_get_contents($file);
        $events = json_decode($content, true) ?: [];
        
        echo json_encode($events);
    } else {
        echo json_encode([]);
    }
} else {
    echo json_encode(['error' => 'Method not allowed']);
}
?>
