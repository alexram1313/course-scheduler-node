(function(){
var genScheds = require('../api/scheduling/algorithms-courseformat/courseMatrixUsage.js').genScheds;

var TestModule = require('./test-utils.js').TestModule;
var testCourses = require('./test-courses.js');

new TestModule('Generate Schedules')
	
	.test('minimal', function(){
		return genScheds([testCourses.one]);
	})
	.equalsUnordered([ testCourses.one.sections ])

	.test('multi-section', function(){
		return genScheds([testCourses.two]);
	})
	.equalsUnordered([
		[testCourses.two.sections[0]],
        [testCourses.two.sections[1]],
        [testCourses.two.sections[2]] ])

	.test('basic time conflict', function(){
		return genScheds([testCourses.one, testCourses.two]);
	})
	.equalsUnordered([
		[testCourses.one.sections[0], testCourses.two.sections[1]],
	    [testCourses.one.sections[0], testCourses.two.sections[2]] ])

	.test('basic coreq', function(){
		return genScheds([testCourses.three]);
	})
	.equalsUnordered([
		testCourses.three.sections
	])

	.test('multiple coreq', function(){
		return genScheds([testCourses.four]);
	})
	.equalsUnordered([
		[testCourses.four.sections[0], testCourses.four.sections[2]],
		[testCourses.four.sections[1], testCourses.four.sections[3]],
		[testCourses.four.sections[1], testCourses.four.sections[4]]
	])

	.test('deep coreq', function(){
		return genScheds([testCourses.five]);
	})
	.equalsUnordered([
		testCourses.five.sections
	])

	.test('all together', function(){
		return genScheds([testCourses.two, testCourses.four, testCourses.five]);
	})
	.equalsUnordered([
		testCourses.five.sections.concat([
			testCourses.four.sections[1],
			testCourses.four.sections[3],
			testCourses.two.sections[2]  ]),
		testCourses.five.sections.concat([
			testCourses.four.sections[1],
			testCourses.four.sections[4],
			testCourses.two.sections[2]  ])
	])

	.finish();

}());