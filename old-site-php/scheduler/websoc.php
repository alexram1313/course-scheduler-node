<?php

/**
 * Defines a standard interface for getting course data from an online source.
 */
interface WebSoc {
  public static function getCourse($name); //most flexible format for a course; let each implementation parse as necessary.
}

?>