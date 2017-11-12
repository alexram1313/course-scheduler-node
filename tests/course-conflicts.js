(function () {

var buildConflictMatrix = require('../api/scheduling/algorithms-courseformat/courseConflicts.js').buildConflictMatrix;
var createSection = require('../api/models/section.js').createSection;
var createCourse = require('../api/models/course.js').createCourse;

var TestModule = require('./test-utils.js').TestModule;
var bmu = require('./bit-matrix-utils.js');

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


new TestModule('Build Conflict Matrix')
	.test('minimal', function() {
		var courses = [courseOne];
		var answer = buildConflictMatrix(courses);
		answer.matrix = bmu.rawMatrix(answer.matrix, 1);
		return answer;
	})
	.returns({
		'matrix': [[0]],
		'list'  : courseOne.sections,
		'roots' : [[0]],
		'forest': [[]]
	})

	.test('multi-section', function() {
		var courses = [courseTwo];
		var answer = buildConflictMatrix(courses);
		answer.matrix = bmu.rawMatrix(answer.matrix, 3);
		return answer;
	})
	.returns({
		'matrix': bmu.inverseIdentity(3),
		'list'  : courseTwo.sections,
		'roots' : [[0,1,2]],
		'forest': [[],[],[]]
	})

	.test('basic time conflict', function() {
		var courses = [courseOne, courseTwo];
		var answer = buildConflictMatrix(courses);
		answer.matrix = bmu.rawMatrix(answer.matrix, 4);
		return answer;
	})
	.returns({
		'matrix': (
			bmu.vconcat(
				[[0,1,0,0]],
				bmu.hconcat([[1],[0],[0]],
					bmu.inverseIdentity(3))
			)
		),
		'list'  : courseOne.sections.concat(courseTwo.sections),
		'roots' : [[0],[1,2,3]],
		'forest': [[],[],[],[]]
	})

	.test('basic coreq', function() {
		var courses = [courseThree];
		var answer = buildConflictMatrix(courses);
		answer.matrix = bmu.rawMatrix(answer.matrix, 2);
		return answer;
	})
	.returns({
		'matrix': [[0,0],[0,0]],
		'list'  : courseThree.sections,
		'roots' : [[0]],
		'forest': [[[1]],[]]
	})

	.test('multiple coreq', function() {
		var courses = [courseFour];
		var answer = buildConflictMatrix(courses);
		answer.matrix = bmu.rawMatrix(answer.matrix, 5);
		return answer;
	})
	.returns({
		'matrix': bmu.vconcat(
			bmu.hconcat(
				bmu.inverseIdentity(2),
				[[0,1,1],[1,0,0]]
			),
			bmu.hconcat(
				[[0,1],[1,0],[1,0]],
				bmu.inverseIdentity(3)
			)
		),
		'list'  : courseFour.sections,
		'roots' : [[0,1]],
		'forest': [[[2]],[[3,4]],[],[],[]]
	})

	.test('deep coreq', function() {
		var courses = [courseFive];
		var answer = buildConflictMatrix(courses);
		answer.matrix = bmu.rawMatrix(answer.matrix, 3);
		return answer;
	})
	.returns({
		'matrix': [[0,0,0],[0,0,0],[0,0,0]],
		'list'  : courseFive.sections,
		'roots' : [[0]],
		'forest': [[[1]],[[2]],[]]
	})

	.test('all together', function() {
		var courses = [courseTwo, courseFour, courseFive];
		var answer = buildConflictMatrix(courses);
		answer.matrix = bmu.rawMatrix(answer.matrix, 11);
		return answer;
	})
	.returns({
		'matrix': bmu.vconcat(
			bmu.hconcat(
				bmu.inverseIdentity(3),
				[[1,0],[0,1],[0,0]],
				bmu.zeros(3,3),
				[[1],[0],[0]],
				bmu.zeros(3,2)
			),
			[[1,0,0,0,1,0,1,1,1,0,0],
			 [0,1,0,1,0,1,0,0,0,0,0]],
			bmu.hconcat(
				bmu.zeros(3,3),
				[[0,1],[1,0],[1,0]],
				bmu.inverseIdentity(3),
				bmu.vconcat([[0,1,1]],bmu.zeros(2,3))
			),
			bmu.hconcat(
				[[1],[0],[0]],
				bmu.zeros(3,2),
				[[1,0,0],[0,0,1],[0,0,1]],
				bmu.zeros(3,5)
			)
		),
		'list'  : courseTwo.sections.concat(courseFour.sections.concat(courseFive.sections)),
		'roots' : [[0,1,2],[3,4],[8]],
		'forest': [[],[],[],[[5]],[[6,7]],[],[],[],[[9]],[[10]],[]]
	})

    .finish();

}());