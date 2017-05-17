<?php

session_start();

if (isset($_SESSION['availableCourses']))
	$_SESSION['availableCourses'] = $_SESSION['availableCourses'];

if (isset($_SESSION['addedCourses']))
	$_SESSION['addedCourses'] = $_SESSION['addedCourses'];

if (isset($_SESSION['schedules']))
	$_SESSION['schedules'] = $_SESSION['schedules'];

echo "OK";

?>