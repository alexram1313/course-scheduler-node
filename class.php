<?php 

/**
* Represents a particular lecture, lab, etc.
* Assumes that Classes meet on a weekly schedule, and that the meeting time is the same every day.
*/
class Class {

  public $meetingDays;   // array(string)
  public $meetingStart;  // Time
  public $meetingEnd;    // Time
  public $finalDateTime; // DateTime
  public $type;          // string

  public function __construct(array $meetDays = array(), Time $meetStart = NULL, Time $meetEnd = NULL, DateTime $final = NULL, string $meetType = "") {
    if ($meetDays) {
      if (!$meetStart || !$meetEnd) {
        throw new Exception("Class was given 'meetDays', but not 'meetStart' and 'meetEnd'.");
      }
    } else {
      if ($meetStart || $meetEnd) {
        throw new Exception("Class was given 'meetStart' or 'meetEnd', but not 'meetDays'.");
      }
    }

    //Enforce a standard format for meetingDays
    $this->$meetingDays = array(
      'monday'    => false,
      'tuesday'   => false,
      'wednesday' => false,
      'thursday'  => false,
      'friday'    => false,
      'saturday'  => false,
      'sunday'    => false
    );
    foreach ($this->$meetingDays as $day => $meets) {
      if (array_key_exsts($meetDays, $day) && $meetDays[$day]) {
        $this->$meetingDays[$day] = true;
      }
    }

    $this->$meetingStart  = $meetStart;
    $this->$meetingEnd    = $meetEnd;
    $this->$finalDateTime = $final;
    $this->$type          = $meetType;
  }

  public function conflictsWith(Class $otherClass) {
    foreach ($otherClass->$meetingDays as $day => $meets) {
      if ($meets && $this->$meetingDays[$day]) {
        // Meets on the same day. Need to check the time
        if ($otherClass->$meetingEnd   >= $this->$meetingStart &&
            $otherClass->$meetingStart <= $this->$meetingEnd  ) {
          // There is a conflict. Equivalent condition:
          // !($otherClass->$meetingEnd   < $this->$meetingStart ||
          //   $otherClass->$meetingStart > $this->$meetingEnd)
          return true;
        }
      }
    }
    // All days clear.
    return false;
  }

  public function conflictsWith(Schedule $schedule) {
    foreach ($schedule->$classes as $class) {
      if ($this->conflictsWith($class)) return true;
    }
    return false;
  }
}

?>