<?php
    
    /**
     * Defines a collection of sections that must be taken to satisfy a course.
     * For example, might include the options for a lecture, lab, and discussion.
     */
    class Course {
        
        public $name; // string
        public $sectionArr; // array(string => array(Section)) : Section->type => {Section}
        public $yearTerm;
        
        function __construct($courseName, $yearTerm, array $sections = NULL) {
            $sections = is_null($sections) ? array() : $sections;
            
            $this->sectionArr = array();
            foreach ($sections as $section) {
                if (!array_key_exists($section->type, $this->sectionArr)) {
                    $this->sectionArr[$section->type] = array();
                }
                $this->sectionArr[$section->type][] = $section;
            }
            
            $this->name = (string)$courseName;
            $this->yearTerm = (string)$yearTerm;
        }
        
        function addSection(Section $section) {
            if (!array_key_exists($section->type, $this->sectionArr)) {
                $this->sectionArr[$section->type] = array();
            }
            $this->sectionArr[$section->type][] = $section;
        }
        
        /**
         * Builds all possible schedules based on the current schedule,
         * incorporating one of each necessary 'type' of Section for this Course.
         */
        public function buildSchedules($currentSchedules = NULL /* array(Schedule) or Schedule */) {
          $currentSchedules = is_null($currentSchedules) || empty($currentSchedules) ? new Schedule() : $currentSchedules;
          if ($currentSchedules instanceof Schedule) {
            return $this->_buildSchedules($currentSchedules);
          } else if (is_array($currentSchedules)) {
            return $this->_buildSchedulesArray($currentSchedules);
          } else {
            throw new Exception("currentSchedules must be Schedule or array(Schedule)");
          }
        }

        private function _buildSchedulesArray(array $currentSchedules) {
          $output = array();
          foreach ($currentSchedules as $sched) {
            $output = array_merge($output, $this->_buildSchedules($sched));
          }
          return $output;
        }

        private function _buildSchedules(Schedule $currentSchedule) {
            return $this->_buildSchedules_base($currentSchedule, $this->sectionArr);
        }
        
        private function _buildSchedules_base(Schedule $sched, array $sectionArr) {
            if (!$sectionArr) return array($sched);
            
            $sections = array_pop($sectionArr);
            foreach ($sections as $section) {
                if ($sched->hasSection($section)) {
                    // the schedule already contains this 'type' of section, skip the process at this level.
                    return $this->_buildSchedules_base($sched, $sectionArr);
                }
            }
            
            $output = array();
            // Loop through all sections of one type:
            foreach ($sections as $section) {
                if ($section->conflictsWith($sched)) continue; // simply can't use it.
                // Note: since any section conflicts with itself, this check also stops duplicates (e.g., from coreq additions)
                
                $newSched = new Schedule($sched, $section);
                if (is_array($section->coreqs) || is_object($section->coreqs))
                    foreach ($section->coreqs as $req) {
                        if ($newSched->hasSection($req)) continue; // section already present
                        if ($newSched->hasCourseType($req)) break 2; // has the 'type' of this req for this req's course, but not this one. Excludes req.
                        if ($req->conflictsWith($newSched)) break 2; // break out of coreq loop *and* this section loop.
                        $newSched = new Schedule($newSched, $req); // else, add section to schedule
                    }
                //now we've guaranteed all coreqs have been added.
                
                $output = array_merge($output, $this->_buildSchedules($newSched, $sectionArr)); //compute next level
            }
            
            return $output;
        }
        public function __toString(){
            return $this->name.' ['.$this->yearTerm.']';
        }
        
    }
    
    ?>
