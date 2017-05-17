<?php

if (!defined('ROOT_PATH')) define('ROOT_PATH',__DIR__.'/');

require_once ROOT_PATH.'preferences.php';
require_once ROOT_PATH.'time.php';

$standardPreferences = new Preferences(array(
  array('mornings', function($sched) {
    $cutoff = new Time(11,00);
    $score  = 0.0;
    foreach ($sched->sections as $s) {
      if ($s->start <= $cutoff) {
        // earlier sections score "more" than those just before the cutoff
        $score += ($cutoff->difference($s->start, 'hours', true) * $s->daysPerWeek());
      }
    }
    // score should be in the 0-20 range
    return $score;
  }),
  array('evenings', function($sched) {
    $cutoff = new Time(16,00);
    $score  = 0.0;
    foreach ($sched->sections as $s) {
      if ($s->end >= $cutoff) {
        // later sections score "more" than those just after the cutoff
        $score += ($cutoff->difference($s->end, 'hours', true) * $s->daysPerWeek());
      }
    }
    // score should be in the 0-20 range
    return $score;
  }),
  array('mondays', function($sched) {
    $score = 0.0;
    foreach ($sched->sections as $s) {
      if ($s->days['monday']) {
        // longer sections score "more" than shorter ones.
        $score += $s->duration('hours');
      }
    }
    // score should be in the 0-12 range, double to keep in line with other scores
    return $score * 2;
  }),
  array('fridays', function($sched) {
    $score = 0.0;
    foreach ($sched->sections as $s) {
      if ($s->days['friday']) {
        // longer sections score "more" than shorter ones.
        $score += $s->duration('hours');
      }
    }
    // score should be in the 0-12 range, double to keep in line with other scores
    return $score * 2;
  }),
  array('balance', function($sched) {
    $score = 0.0;
    $hoursByDay = array(
      'monday'    => 0.0,
      'tuesday'   => 0.0,
      'wednesday' => 0.0,
      'thursday'  => 0.0,
      'friday'    => 0.0,
      'saturday'  => 0.0,
      'sunday'    => 0.0
    );
    foreach ($sched->sections as $s) {
      $dur = $s->duration('hours');
      foreach ($s->days as $day => $meets) {
        if ($meets) $hoursByDay[$day] += $dur;
      }
    }
    $avg = array_sum($hoursByDay) / 7;
    foreach ($hoursByDay as $hours) {
      // days that are closer to the average score better (less negatively)
      $score -= abs($avg - $hours);
    }
    // score should be in the 0-25 or 0-30 range, estimated
    return $score;
  }),
  array('gaps', function($sched) {
    $score = 0.0;
    $sectionsByDay = array(
      'monday'    => array(),
      'tuesday'   => array(),
      'wednesday' => array(),
      'thursday'  => array(),
      'friday'    => array(),
      'saturday'  => array(),
      'sunday'    => array()
    );
    foreach ($sched->sections as $s) {
      foreach ($s->days as $day => $meets) {
        if ($meets) $sectionsByDay[$day][] = $s;
      }
    }
    array_walk($sectionsByDay, function(&$sections, $day) {
      usort($sections, function($s1,$s2) {
        return $s1->start > $s2->start;
      });
    });
    // now, all classes are chronological by day. Figure out the gaps:
    foreach ($sectionsByDay as $sections) {
      $prevEnd = NULL;
      foreach ($sections as $sec) {
        if (!is_null($prevEnd)) {
          $score += $sec->start->difference($prevEnd, 'hours', true);
        }
        $prevEnd = $sec->end;
      }
    }
    return $score;
  }),
  array('openings', function($sched) {
    $score = 0.0;
    foreach ($sched->sections as $s) {
      $score += $s->openings;
    }
    return $score;
  })
));

?>
