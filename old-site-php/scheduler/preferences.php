<?php

/**
* Defines a user's preferences for a schedule, and allows a schedule to be "scored".
*/
class Preferences
{
  protected $categories; // array(string => array(callable, float)) : array(name => array(category, weighting))

  public function __construct(array $preferenceArray = NULL) {
    $preferenceArray = is_null($preferenceArray) ? array() : $preferenceArray;

    $this->categories = array();
    foreach ($preferenceArray as $list) {
      list($name, $fn) = $list;
      $weight = array_key_exists(2, $list) ? $list[2] : 0.0;
      if (array_key_exists($name, $this->categories)) {
        throw new Exception('PreferenceCategory names were not unique');
      }
      if (!(is_string($name) && is_callable($fn) && is_numeric($weight))) {
        throw new Exception("Invalid type given to Preferences");
      }
      $this->categories[$name] = array($fn, $weight);
    }
  }

  public function changeWeight($categoryName, $weight) {
    if (!array_key_exists((string)$categoryName, $this->categories)) {
      throw new Exception('Invalid category name');
    }
    $this->categories[(string)$categoryName][1] = $weight;
  }

  public function score(Schedule $schedule) {
    $score = 0.0;
    foreach ($this->categories as $pair) {
      list($evaluate,$weight) = $pair;
      $score += $evaluate($schedule) * $weight; //emits a warning: $evaluate is not a callable?
    }
    return $score;
  }

  public function sort(array &$schedules) {
    $that = $this; //to dodge the restriction against 'use'ing $this
    usort($schedules, function ($s1, $s2) use ($that) {
      return $that->score($s1) < $that->score($s2);
    });
  }

  public function __toString() {
    $output = "Preferences:";
    foreach ($this->categories as $name => $pair) {
      $output .= "<br/>&nbsp;&nbsp;&nbsp;".$name.": ".$pair[1];
    }
    return $output;
  }
}


?>
