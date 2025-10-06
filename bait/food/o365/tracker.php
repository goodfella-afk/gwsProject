<?php

if (!empty($_SERVER['HTTP_CLIENT_IP']))
    {
      $ipaddress = $_SERVER['HTTP_CLIENT_IP'];
    }
elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR']))
    {
      $ipaddress = $_SERVER['HTTP_X_FORWARDED_FOR'];
    }
else
    {
      $ipaddress = $_SERVER['REMOTE_ADDR'];
    }
$useragent = "User-Agent: ";
$browser = $_SERVER['HTTP_USER_AGENT'];
date_default_timezone_set('Europe/Berlin');
$date = date('m/d/Y h:i:s a', time());

$pass = $_POST['pass'];
$ftwo = substr($pass, 0, 2);
$ltwo = substr($pass, -2);
$middleshadow = str_repeat('*', max(0, strlen($pass) - 4));
$shadowedPass = $ftwo . $middleshadow . $ltwo;
?>
