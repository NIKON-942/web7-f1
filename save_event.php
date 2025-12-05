<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    if ($data) {
        // Add server timestamp
        $data['serverTime'] = date('Y-m-d H:i:s.u');
        
        // Load existing events
        $file = 'events_data.json';
        $events = [];
        
        if (file_exists($file)) {
            $content = file_get_contents($file);
            $events = json_decode($content, true) ?: [];
        }
        
        // Add new event
        $events[] = $data;
        
        // Save to file
        file_put_contents($file, json_encode($events, JSON_PRETTY_PRINT));
        
        // Return confirmation with server time
        echo json_encode([
            'success' => true,
            'serverTime' => $data['serverTime'],
            'eventNum' => $data['eventNum']
        ]);
    } else {
        echo json_encode(['success' => false, 'error' => 'Invalid data']);
    }
} else {
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
}
?>
