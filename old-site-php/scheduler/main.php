<?php
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
    echo "PHP is running correctly.<br>";
    if (!defined('ROOT_PATH')) define('ROOT_PATH',__DIR__.'/');

    require_once ROOT_PATH.'time.php';
    require_once ROOT_PATH.'section.php';
    require_once ROOT_PATH.'course.php';
    require_once ROOT_PATH.'schedule.php';
    require_once ROOT_PATH.'standardPreferences.php';
    require_once ROOT_PATH.'uci_websoc.php';
    echo "All classes loaded correctly.<br>";
    /**
     * A quick hack to load the test data.
     * A small amount of this code will be transferrable to classretrieval.
     */
    function readCSV($file) {
        $handle = fopen($file, "r");
        if (!$handle) {
            throw new Exception("Could not open file.");
        }
        $courses = array(); //name => course
        $lastLecture = NULL;
        $dayCodes = array(
                          "M"  => "monday",
                          "Tu" => "tuesday",
                          "W"  => "wednesday",
                          "Th" => "thursday",
                          "F"  => "friday"
                          );
        while (($line = fgets($handle, 4096)) !== false) {
            list($course,$type,$shortDays,$start,$end,$final,$code,$openings) = explode(',', $line);
            
            $days = array();
            foreach ($dayCodes as $short => $long) {
                $days[$long] = is_int(strpos($shortDays,$short)); //shortDays has short
            }
            $startTime = new Time($start);
            $endTime   = new Time($end);
            $final = preg_replace("/-\d{1,2}:\d{2}/","",$final); //trim out ending time
            $finalDateTime = new DateTime($final);
            if (!array_key_exists($course, $courses)) {
                $courses[$course] = new Course($course);
            }
            $sec = new Section($days, $startTime, $endTime, $finalDateTime, $course, $type, $code, $openings);

            if ($type == 'Lec') {
              $lastLecture = $sec;
            } else if ($type != 'Lab') {
              $sec->addCoreq($lastLecture);
            }

            $courses[$course]->addSection($sec);
        }
        fclose($handle);
        return $courses;
    }
    echo "readCSV function defined.<br>";
    
    $courses = readCSV(ROOT_PATH."testdata.csv");
    
    echo "<h1>Courses from CSV (David)</h1>";
    foreach ($courses as $name => $course) {
        echo "<h2>$name</h2>";
        foreach ($course->sectionArr as $type => $sections) {
            echo "<h3>$type</h3>";
            foreach ($sections as $s) {
                echo $s,"<br>"; //use default section toString
            }
        }
    }

    $courses = array();
    foreach (array('Soc Sci H1F', 'Physics 7D', 'Math 9', 'Stats 67') as $courseName) {
        $courses[$courseName] = UCI_WebSoc::getCourse($courseName);
    }

    echo "<h1>Courses from Web (David)</h1>";
    foreach ($courses as $name => $course) {
        echo "<h2>$name</h2>";
        foreach ($course->sectionArr as $type => $sections) {
            echo "<h3>$type</h3>";
            foreach ($sections as $s) {
                echo $s,"<br>"; //use default section toString
            }
        }
    }

    
    echo "<hr/><h1>Courses from CSV (Alex)</h1>";
    echo "<h3>Writing 39C not included</h3>";
    $courses = readCSV(ROOT_PATH."testdata_air.csv");
    
    foreach ($courses as $name => $course) {
        echo "<h2>$name</h2>";
        foreach ($course->sectionArr as $type => $sections) {
            echo "<h3>$type</h3>";
            foreach ($sections as $s) {
                echo $s,"<br>"; //use default section toString
            }
        }
    }
    
    $courses = array();
    foreach (array('CSE 90', 'CSE 70A', 'Math 3D', 'Writing 39C') as $courseName) {
        $courses[$courseName] = UCI_WebSoc::getCourse($courseName);
    }
    
    echo "<h1>Courses from Web (Alex)</h1>";
    echo "<h3>Writing 39C included</h3>";
    echo "<h3>The different CSE course codes here are fine since they're the same courses</h3>";
    foreach ($courses as $name => $course) {
        echo "<h2>$name</h2>";
        foreach ($course->sectionArr as $type => $sections) {
            echo "<h3>$type</h3>";
            foreach ($sections as $s) {
                echo $s,"<br>"; //use default section toString
            }
        }
    }
    
    

?>
