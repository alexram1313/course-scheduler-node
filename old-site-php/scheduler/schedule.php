<?php

/**
* Represents a possible schedule, with a set of non-conflicting sections.
*/
class Schedule {

  public $sections; // array(Section)

  public function __construct($sectionSource = NULL /*array(Section) or Schedule*/, Section $addSection = NULL) {
    $sectionSource = is_null($sectionSource) ? array() : $sectionSource;

    if ($sectionSource instanceof Schedule) {
      $this->sections = $sectionSource->sections; // copy the sections
    } else if (is_array($sectionSource)) {
      $this->sections = array();
      foreach ($sectionSource as $section) {
        if ($section instanceof Section) {
          $this->sections[] = $section;
        } else {
          throw new Exception("sectionSource must be an array of Section objects");
        }
      }
    }
    if (!is_null($addSection)) {
      $this->sections[] = $addSection;
    }
  }

  public function hasSection(&$sectionOrCode /*Section or string*/) {
    if ($sectionOrCode instanceof Section) {
      return $this->_hasSection($sectionOrCode);
    } else {
      return $this->_hasSectionCode((string)$sectionOrCode);
    }
  }

  private function _hasSection(Section &$section) {
    return in_array($section, $this->sections);
  }

  private function _hasSectionCode(&$code) {
    foreach ($this->sections as $section) {
      if ($section->code == $code) return true;
    }
    return false;
  }

  public function hasCourseType(Section &$section) {
    foreach ($this->sections as $s) {
      if ($s->course == $section->course &&
          $s->type   == $section->type) return true;
    }
    return false;
  }

  public function __toString() {
    $output = "<ul>";
    $codes  = "";
    foreach ($this->sections as $s) {
      $output .= "<li>".$s."</li>"; // use default toString
      $codes  .= $s->code . ",";
    }
    return "Schedule: ".substr($codes,0,-1).$output."</ul>";
  }
}

?>
