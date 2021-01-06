<h1> Logging out... </h1>
<?php
session_destroy();
$_SESSION['logged_in'] = null;
header('location: login.php');
?>