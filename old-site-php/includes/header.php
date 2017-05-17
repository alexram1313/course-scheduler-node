<html>

<head>
    <title><?php echo ($pageTitle != '')?$pageTitle.' - ': ''; ?>ZotScheduler</title>
    <meta name="theme-color" content="#ffd200">
    <meta name="viewport" content="width=device-width">

    <link rel="stylesheet" type="text/css" href="style.css">
    <link rel="stylesheet" id="screenr-fonts-css" href="https://fonts.googleapis.com/css?family=Open%2BSans%3A400%2C300%2C300italic%2C400italic%2C600%2C600italic%2C700%2C700italic%7CMontserrat%3A400%2C700&amp;subset=latin%2Clatin-ext" type="text/css" media="all">
    <link rel="stylesheet" type="text/css" href="libs/fullcalendar/fullcalendar.css">
    <script src='libs/fullcalendar/lib/jquery.min.js'></script>
    <script type="text/javascript" src='libs/schedulerjs/functions.js' > </script>
</head>

<body>
    <header id="header">
        <div id="head_container">
            <div id="home"><a href="index.php">ZotScheduler</a></div>
            <div id="nav_bar">
                <ul id="nav">
                <li><a href="index.php">Home</a></li>
                <li><a href="about.php">About</a></li>
                <li><a href="help.php">Help</a></li>
                </ul>
            </div>
        </div>

    </header>
    <div id="content">
    <?php
        if ($pageTitle != ''){
            echo '<div id="title">';
            echo $pageTitle;
            echo '</div>';
        }
        ?>
