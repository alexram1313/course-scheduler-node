<?php
    require_once('../controller.php');
//    session_start();
    error_reporting(E_ALL);
    
    ini_set('display_errors', 1);
    if (isset($_GET['_action'])){
//        if ($_GET['_action'] == 'coursebydept')
//        {
//            $courses = getCoursesByDept($_GET['_param']);
//            foreach($courses as $name => $course){
//                echo '<option value="',$name,'">',$name,'</option>';
//            }
//        }
//        else if ($_GET['_action'] == 'addcourse')
//        {
//            $_SESSION['addedCourses'][$_GET['_param']] = $_SESSION['availableCourses'][$_GET['_param']];
//            foreach($_SESSION['addedCourses'] as $name => $course){
//                echo '<li id="',$name,'" style="color:#0039ad;">',$name,'</li>';
//            }
//        }
//        else if ($_GET['_action'] == 'schedule')
//        {
//            $schedules = generateSchedules();
//            echo "Course Selection: ";
//            $courseList = '';
//            foreach ($_SESSION['addedCourses'] as $name => $course){
//                $courseList .= $name . ", ";
//            }
//            echo '<span style="color:#0039ad;">',substr($courseList, 0, -2), "</span><br/>";
//            foreach ($schedules as $sched) {
//                echo $sched,"<hr>";
//            }
//        }

        switch($_GET['_action']){
            case 'changeterm':
                changeTerm($_GET['_param'], true);
                break;
            case 'coursebydept':
                $courses = getCoursesByDept($_GET['_param'], $_GET['_yt']);
//                var_dump($courses);
                foreach($courses as $name => $course){
                    echo '<option value="',$name,'">',$course->name,'</option>';
                }
//                var_dump($_SESSION['availableCourses']);
                break;
            case 'addcourse':
                if (!isset($_SESSION['addedCourses'])) $_SESSION['addedCourses']  = array();
                $_SESSION['addedCourses'][$_GET['_param']] = $_SESSION['availableCourses'][$_GET['_param']];
                listAddedCourses();
                break;
            case 'delcourse':
                unset($_SESSION['addedCourses'][$_GET['_param']]);
                listAddedCourses();
                break;
            case 'schedule':
                $schedules = generateSchedules();
                $_SESSION['schedules'] = $schedules;
                if ($_GET['_param'] == -1){
                    echo "Course Selection: ";
                    $courseList = '';
                    foreach ($_SESSION['addedCourses'] as $course){
                        $courseList .= $course->name . ", ";
                    }
                    echo '<span style="color:#0039ad;">',substr($courseList, 0, -2), "</span><br/>";
                    foreach ($schedules as $sched) {
                        echo $sched,"<hr>";
                    }
                }
                else
                {
                    if (empty($schedules))
                        echo "<span style='color:red'>No possible schedules.</span>";
                    else if (isset($schedules[$_GET['_param']])){
                        echo $schedules[$_GET['_param']];
                    }
                }
                break;
            case 'schedcount':
                echo count($_SESSION['schedules']);
                break;
            case 'schedview':
                $date = new DateTime('2017-01-02 00:00');
                $days = array(
                             'monday'    => '0',
                             'tuesday'   => '1',
                             'wednesday' => '2',
                             'thursday'  => '3',
                             'friday'    => '4',
                             'saturday'  => '5',
                             'sunday'    => '6'
                             );
                $master = array();
                if ($_GET['_param']== -1){
                    foreach($_SESSION['schedules'] as $sched) {
                        foreach ($sched->sections as $section){
                            foreach ($section->days as $day=>$valid){
                                if ($valid) {
                                    
                                    $start = new DateTime(date('Y-m-d H:i:s', strtotime($date->format('Y-m-d H:i:s'). ' + '.$days[$day].' day')));
                                    
                                    $start->setTime($section->start->format('H'), $section->start->format('i'));
                                    
                                    $end = new DateTime(date('Y-m-d H:i:s', strtotime($date->format('Y-m-d H:i:s'). ' + '.$days[$day].' day')));
                                    
                                    $end->setTime($section->end->format('H'), $section->end->format('i'));
                                    
                                    $curr_sect = [
                                    "title" => '('.$section->code.') ' . substr($section->course, 0, strpos($section->course, ":")) . ' ' . $section->type,
                                    "start" => $start->format(DateTime::ISO8601),
                                    "end"   => $end->format(DateTime::ISO8601)
                                    ];
                                    array_push($master, $curr_sect);
                                }
                            }
                        }
                        $date->modify('+7 day');
                    }
                }
                else if (isset($_SESSION['schedules'][$_GET['_param']])){
                    $sched = $_SESSION['schedules'][$_GET['_param']];
                    foreach ($sched->sections as $section){
                        foreach ($section->days as $day=>$valid){
                            if ($valid) {
                                
                                $start = new DateTime(date('Y-m-d H:i:s', strtotime($date->format('Y-m-d H:i:s'). ' + '.$days[$day].' day')));
                                
                                $start->setTime($section->start->format('H'), $section->start->format('i'));
                                
                                $end = new DateTime(date('Y-m-d H:i:s', strtotime($date->format('Y-m-d H:i:s'). ' + '.$days[$day].' day')));
                                
                                $end->setTime($section->end->format('H'), $section->end->format('i'));
                                
                                $curr_sect = [
                                "title" => '('.$section->code.') ' . substr($section->course, 0, strpos($section->course, ":")) . ' ' . $section->type,
                                "start" => $start->format(DateTime::ISO8601),
                                "end"   => $end->format(DateTime::ISO8601)
                                ];
                                array_push($master, $curr_sect);
                            }
                        }
                    }

                }
                
                echo json_encode($master);
                break;
                
            case "updatemorning":
                $_SESSION['prefMornings'] = $_GET['_param'];
                echo  $_SESSION['prefMornings'];
                break;
            case "updateevening":
                $_SESSION['prefEvening'] = $_GET['_param'];
                break;
            case "updatemonday":
                $_SESSION['prefMondays'] = $_GET['_param'];
                break;
            case "updatefriday":
                $_SESSION['prefFridays'] = $_GET['_param'];
                break;
            case "updatebalance":
                $_SESSION['prefBalance'] = $_GET['_param'];
                break;
            case "updategaps":
                $_SESSION['prefGaps'] = $_GET['_param'];
                break;
            case "updateopenings":
                $_SESSION['prefOpenings'] = $_GET['_param'];
                break;
            default:
                break;
        }
    }
    ?>
