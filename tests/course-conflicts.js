(function () {

var buildConflictMatrix = require('../api/scheduling/algorithms-courseformat/courseConflicts.js').buildConflictMatrix;

var TestModule = require('./test-utils.js').TestModule;
var bmu = require('./bit-matrix-utils.js');
var testCourses = require('./test-courses.js');

new TestModule('Build Conflict Matrix')
	.test('minimal', function() {
		var courses = [testCourses.one];
		var answer = buildConflictMatrix(courses);
		answer.matrix = bmu.rawMatrix(answer.matrix, 1);
		return answer;
	})
	.equals({
		'matrix': [[0]],
		'list'  : testCourses.one.sections,
		'roots' : [[0]],
		'forest': [[]]
	})

	.test('multi-section', function() {
		var courses = [testCourses.two];
		var answer = buildConflictMatrix(courses);
		answer.matrix = bmu.rawMatrix(answer.matrix, 3);
		return answer;
	})
	.equals({
		'matrix': bmu.inverseIdentity(3),
		'list'  : testCourses.two.sections,
		'roots' : [[0,1,2]],
		'forest': [[],[],[]]
	})

	.test('basic time conflict', function() {
		var courses = [testCourses.one, testCourses.two];
		var answer = buildConflictMatrix(courses);
		answer.matrix = bmu.rawMatrix(answer.matrix, 4);
		return answer;
	})
	.equals({
		'matrix': (
			bmu.vconcat(
				[[0,1,0,0]],
				bmu.hconcat([[1],[0],[0]],
					bmu.inverseIdentity(3))
			)
		),
		'list'  : testCourses.one.sections.concat(testCourses.two.sections),
		'roots' : [[0],[1,2,3]],
		'forest': [[],[],[],[]]
	})

	.test('basic coreq', function() {
		var courses = [testCourses.three];
		var answer = buildConflictMatrix(courses);
		answer.matrix = bmu.rawMatrix(answer.matrix, 2);
		return answer;
	})
	.equals({
		'matrix': [[0,0],[0,0]],
		'list'  : testCourses.three.sections,
		'roots' : [[0]],
		'forest': [[[1]],[]]
	})

	.test('multiple coreq', function() {
		var courses = [testCourses.four];
		var answer = buildConflictMatrix(courses);
		answer.matrix = bmu.rawMatrix(answer.matrix, 5);
		return answer;
	})
	.equals({
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
		'list'  : testCourses.four.sections,
		'roots' : [[0,1]],
		'forest': [[[2]],[[3,4]],[],[],[]]
	})

	.test('deep coreq', function() {
		var courses = [testCourses.five];
		var answer = buildConflictMatrix(courses);
		answer.matrix = bmu.rawMatrix(answer.matrix, 3);
		return answer;
	})
	.equals({
		'matrix': [[0,0,0],[0,0,0],[0,0,0]],
		'list'  : testCourses.five.sections,
		'roots' : [[0]],
		'forest': [[[1]],[[2]],[]]
	})

	.test('all together', function() {
		var courses = [testCourses.two, testCourses.four, testCourses.five];
		var answer = buildConflictMatrix(courses);
		answer.matrix = bmu.rawMatrix(answer.matrix, 11);
		return answer;
	})
	.equals({
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
		'list'  : testCourses.two.sections.concat(testCourses.four.sections.concat(testCourses.five.sections)),
		'roots' : [[0,1,2],[3,4],[8]],
		'forest': [[],[],[],[[5]],[[6,7]],[],[],[],[[9]],[[10]],[]]
	})

    .finish();

}());