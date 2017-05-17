<?php 

/**
* Represents a particular lecture, lab, etc.
* Assumes that Sections meet on a weekly schedule, and that the meeting time is the same every day.
* Coreq's are Sections that *must* be taken with this Section. So, discussions have a lecture as a coreq, but not vice-versa.
*/
class Section {

  public $days;          // array(string => bool)
  public $start;         // Time
  public $end;           // Time
  public $finalDateTime; // DateTime
  public $course;        // string
  public $type;          // string
  public $code;          // string
  public $openings;      // int
  public $coreqs;        // array(Section)

  public function __construct(array $meetDays = NULL, Time $meetStart = NULL, Time $meetEnd = NULL, DateTime $final = NULL, $courseName = NULL, $meetType = NULL, $sectionCode = NULL, $secOpenings = NULL) {
    $meetDays    = is_null($meetDays)    ? array() : $meetDays;
    $courseName  = is_null($courseName)  ? ""      : $courseName;
    $meetType    = is_null($meetType)    ? ""      : $meetType;
    $sectionCode = is_null($sectionCode) ? ""      : $sectionCode;
    $secOpenings = is_null($secOpenings) ? 0       : $secOpenings;

    if ($meetDays) {
      if (!$meetStart || !$meetEnd) {
        throw new Exception("Section was given 'meetDays', but not 'meetStart' and 'meetEnd'.");
      }
    } else {
      if ($meetStart || $meetEnd) {
        throw new Exception("Section was given 'meetStart' or 'meetEnd', but not 'meetDays'.");
      }
    }

    //Enforce a standard format for days
    $this->days = array(
      'monday'    => false,
      'tuesday'   => false,
      'wednesday' => false,
      'thursday'  => false,
      'friday'    => false,
      'saturday'  => false,
      'sunday'    => false
    );
    foreach ($this->days as $day => $meets) {
      if (array_key_exists($day,$meetDays) && $meetDays[$day]) {
        $this->days[$day] = true;
      }
    }

    $this->start         = $meetStart;
    $this->end           = $meetEnd;
    $this->finalDateTime = $final;
    $this->course        = (string)$courseName;
    $this->type          = (string)$meetType;
    $this->code          = (string)$sectionCode;
    $this->openings      = (int)$secOpenings;
  }

  public function conflictsWith($sectionOrSchedule) {
    if ($sectionOrSchedule instanceof Section) {
      return $this->_conflictsWithSection($sectionOrSchedule);
    } else if ($sectionOrSchedule instanceof Schedule) {
      return $this->_conflictsWithSchedule($sectionOrSchedule);
    } else {
      throw new Exception("sectionOrSchedule must be a Section or Schedule");
    }
  }

  private function _conflictsWithSection(Section $section) {
    foreach ($section->days as $day => $meets) {
      if ($meets && $this->days[$day]) {
        // Meets on the same day. Need to check the time
        if ($section->end   >= $this->start &&
            $section->start <= $this->end  ) {
          // There is a conflict. Equivalent condition:
          // !($section->end   < $this->start ||
          //   $section->start > $this->end)
          return true;
        }
      }
    }
    // All days clear.
    return false;
  }

  private function _conflictsWithSchedule(Schedule $schedule) {
    foreach ($schedule->sections as $section) {
      if ($this->conflictsWith($section)) return true;
    }
    return false;
  }

  public function addCoreq(Section &$coreq) {
    $this->coreqs[] = $coreq;
  }

  public function duration($unit = NULL) {
    $unit = is_null($unit) ? 'seconds' : $unit;

    return $this->end->difference($this->start, $unit, true);
  }

  public function daysPerWeek() {
    return array_reduce($this->days, function ($sum,$meets) {
      return $sum + ($meets ? 1 : 0);
    }, 0);
  }

  public function __toString() {
    $output = $this->code.": ".$this->course." ".$this->type.": ";
    foreach ($this->days as $day => $meets) {
      if ($meets) $output .= substr($day,0,2)." ";
    }
    $output .= $this->start." - ".$this->end.".";
    return $output;
  }
}

?>
