(function(){

var genScheds = require('../api/scheduling/algorithms-courseformat/courseMatrixUsage.js').genScheds;
var createSection = require('../api/models/section.js').createSection;
var createCourse = require('../api/models/course.js').createCourse;

var TestModule = require('./test-utils.js').TestModule;

var courseOne = 
	createCourse(1, 'Course One', [
		createSection('lec', 'Lecture One', 10001, 'MWF', '10:00:00', '10:50:00', [])
	]);

var courseTwo =
	createCourse(2, 'Course Two', [
		createSection('lec', 'Lecture 2.1', 20001, 'MWF', '10:00:00', '10:50:00', []),
		createSection('lec', 'Lecture 2.2', 20002, 'MWF', '11:00:00', '11:50:00', []),
		createSection('lec', 'Lecture 2.3', 20003, 'MWF', '12:00:00', '12:50:00', [])
	]);

var courseThree =
	createCourse(3, 'Course Three', [
		createSection('lec', 'Lecture 3.1', 30001, 'MWF', '10:00:00', '10:50:00', []),
		createSection('dis', 'Discussion 3.1.1', 30101, 'TuTh', '10:00:00', '10:50:00', [30001])
	]);

var courseFour =
	createCourse(4, 'Course Four', [
		createSection('lec', 'Lecture 4.1', 40001, 'MWF', '10:00:00', '10:50:00', []),
		createSection('lec', 'Lecture 4.2', 40002, 'MWF', '11:00:00', '11:50:00', []),
		createSection('dis', 'Discussion 4.1.1', 40101, 'TuTh', '10:00:00', '10:50:00', [40001]),
		createSection('dis', 'Discussion 4.2.1', 40202, 'TuTh', '11:00:00', '11:50:00', [40002]),
		createSection('dis', 'Discussion 4.2.2', 40202, 'TuTh', '12:00:00', '12:50:00', [40002])
	]);

var courseFive = 
	createCourse(5, 'Course Five', [
		createSection('lec', 'Lecture 5.1', 50001, 'MWF', '10:00:00', '10:50:00', []),
		createSection('dis', 'Discussion 5.1.1', 50101, 'Tu', '10:00:00', '10:50:00', [50001]),
		createSection('lab', 'Lab 5.1.1', 50111, 'Th', '10:00:00', '10:50:00', [50101])
	]);

new TestModule('Generate Schedules')
	
	.test('minimal', function() {
		var courses = [courseOne];
		return genScheds(courses);
	})
	.returnsUnordered([ courseOne.sections ])

	.test('multi-section', function() {
		var courses = [courseTwo];
		return genScheds(courses);
	})
	.returnsUnordered([
		[courseTwo.sections[0]],
        [courseTwo.sections[1]],
        [courseTwo.sections[2]] ])

	.test('basic time conflict', function() {
		var courses = [courseOne, courseTwo];
		return genScheds(courses);
	})
	.returnsUnordered([
		[courseOne.sections[0], courseTwo.sections[1]],
	    [courseOne.sections[0], courseTwo.sections[2]] ])

	.test('basic coreq', function() {
		var courses = [courseThree];
		return genScheds(courses);
	})
	.returnsUnordered([
		courseThree.sections
	])

	.test('multiple coreq', function() {
		var courses = [courseFour];
		return genScheds(courses);
	})
	.returnsUnordered([
		[courseFour.sections[0], courseFour.sections[2]],
		[courseFour.sections[1], courseFour.sections[3]],
		[courseFour.sections[1], courseFour.sections[4]]
	])

	.test('deep coreq', function() {
		var courses = [courseFive];
		return genScheds(courses);
	})
	.returnsUnordered([
		courseFive.sections
	])

	.test('all together', function() {
		var courses = [courseTwo, courseFour, courseFive];
		return genScheds(courses);
	})
	.returnsUnordered([
		courseFive.sections.concat([
			courseFour.sections[1],
			courseFour.sections[3],
			courseTwo.sections[2]  ]),
		courseFive.sections.concat([
			courseFour.sections[1],
			courseFour.sections[4],
			courseTwo.sections[2]  ])
	])

	.finish();

}());