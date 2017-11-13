(function() {
	var preferences = require('../api/scheduling/algorithms-courseformat/preferences.js');

	var TestModule = require('./test-utils.js').TestModule;
	var testCourses = require('./test-courses.js');
	var testSchedules = require('./test-schedules.js');


	new TestModule('Preferences Features')

		.test('features', function(){
			return preferences.features;
		})
		.equalsUnordered([
			'mornings',
			'evenings',
			'mondays',
			'fridays',
			'balance',
			'gaps',
			'openings'
		])

		.finish();

	new TestModule('Preferences Scoring')

		.test('scoreSchedule definition', function(){
			return preferences.scoreSchedule;
		})
		.isDefined()

		.test('no-op', function(){
			return preferences.scoreSchedule([], {});
		})
		.approximates(0)

		.test('mornings', function(){
			return preferences.scoreSchedule(
				testSchedules.packedMorning,
				{'mornings': 1});
		})
		.isGreaterThan(0)

		.test('relative mornings', function(){
			return (
				preferences.scoreSchedule(
					[ testCourses.monday.sections[0] ],
					{'mornings': 1})
				-
				preferences.scoreSchedule(
					[ testCourses.monday.sections[1] ],
					{'mornings': 1})
			);
		})
		.isGreaterThan(0)

		.test('mornings non-applicable', function(){
			return preferences.scoreSchedule(
				testSchedules.packedEvening,
				{'mornings': 1});
		})
		.approximates(0)

		.test('evenings', function(){
			return preferences.scoreSchedule(
				testSchedules.packedEvening,
				{'evenings': 1});
		})
		.isGreaterThan(0)

		.test('relative evenings', function(){
			return (
				preferences.scoreSchedule(
					[ testCourses.monday.sections[6] ],
					{'evenings': 1})
				-
				preferences.scoreSchedule(
					[ testCourses.monday.sections[5] ],
					{'evenings': 1})
			);
		})
		.isGreaterThan(0)

		.test('evenings non-applicable', function(){
			return preferences.scoreSchedule(
				testSchedules.packedMorning,
				{'evenings': 1});
		})
		.approximates(0)

		.test('monday only', function() {
			return preferences.scoreSchedule(
				testSchedules.monday,
				{'mondays': 1});
		})
		.isGreaterThan(0)

		.test('monday with others', function() {
			return preferences.scoreSchedule(
				testSchedules.monday.concat(
					testSchedules.tuesday.concat(
						testSchedules.friday)),
				{'mondays': 1});
		})
		.isGreaterThan(0)

		.test('no mondays', function() {
			return preferences.scoreSchedule(
				testSchedules.tuesday.concat(
					testSchedules.thursday),
				{'mondays': 1});
		})
		.approximates(0)

		.test('friday only', function() {
			return preferences.scoreSchedule(
				testSchedules.friday,
				{'fridays': 1});
		})
		.isGreaterThan(0)

		.test('friday with others', function() {
			return preferences.scoreSchedule(
				testSchedules.monday.concat(
					testSchedules.tuesday.concat(
						testSchedules.friday)),
				{'fridays': 1});
		})
		.isGreaterThan(0)

		.test('no fridays', function() {
			return preferences.scoreSchedule(
				testSchedules.tuesday.concat(
					testSchedules.thursday),
				{'mondays': 1});
		})
		.approximates(0)

		.test('perfect balance', function() {
			return preferences.scoreSchedule(
				testSchedules.monday.concat(
					testSchedules.tuesday.concat(
						testSchedules.wednesday.concat(
							testSchedules.thursday.concat(
								testSchedules.friday)))),
				{'balance': 1});
		})
		.approximates(0)

		.test('imperfect balance', function() {
			return preferences.scoreSchedule(
				testSchedules.monday.concat(
					testSchedules.tuesdayMorning.concat(
						testSchedules.wednesday.concat(
							testSchedules.thursdayMorning.concat(
								testSchedules.friday)))),
				{'balance': 1});
		})
		.isLessThan(0)

		.test('no balance', function() {
			return preferences.scoreSchedule(
				testSchedules.mondayMorning.concat(
					testSchedules.mondayEvening.concat(
						testSchedules.tuesdayMorning.concat(
							testSchedules.tuesdayEvening))),
				{'balance': 1});
		})
		.isLessThan(0)

		.test('gaps', function() {
			return preferences.scoreSchedule(
				testSchedules.mondayMorning.concat(
					testSchedules.mondayEvening),
				{'gaps': 1});
		})
		.isGreaterThan(0)

		.test('packed', function() {
			return preferences.scoreSchedule(
				testSchedules.packedMorning,
				{'gaps': 1});
		})
		.approximates(0, 1)

		.testStub('openings')

		.test('multiple categories', function() {
			return (
				preferences.scoreSchedule(
					testSchedules.packedMorning,
					{'mondays': 1,
					 'evenings': 1})
				-
				preferences.scoreSchedule(
					testSchedules.packedMorning,
					{'mondays': 1})
				);
		})
		.approximates(0)

		.test('multiple applicable categories', function() {
			return (
				preferences.scoreSchedule(
					testSchedules.packedMorning,
					{'mondays': 1,
					 'mornings': 1})
				-
				(
					preferences.scoreSchedule(
						testSchedules.packedMorning,
						{'mondays': 1})
					+
					preferences.scoreSchedule(
						testSchedules.packedMorning,
						{'mornings': 1})
				)
			);
		})
		.approximates(0)

		.test('weighting', function() {
			return (
				preferences.scoreSchedule(
					testSchedules.packedMorning,
					{'mondays': 2})
				-
				preferences.scoreSchedule(
					testSchedules.packedMorning,
					{'mondays': 1}) * 2
				);
		})
		.approximates(0)

		.test('weighting with sign flip', function() {
			return (
				preferences.scoreSchedule(
					testSchedules.packedMorning,
					{'mondays': -2})
				-
				preferences.scoreSchedule(
					testSchedules.packedMorning,
					{'mondays': 1}) * (-2)
				);
		})
		.approximates(0)

		.finish()

	new TestModule('Preferences Sorting')

		.test('definition', function() {
			return preferences.sortSchedules;
		})
		.isDefined()

		.test('empty', function() {
			return preferences.sortSchedules([], {});
		})
		.equals([])

		.test('singleton', function() {
			return preferences.sortSchedules([
				testSchedules.monday
			], {});
		})
		.equals([testSchedules.monday])

		.test('non-loss', function() {
			return preferences.sortSchedules([
					testSchedules.monday,
					testSchedules.wednesday,
					testSchedules.friday
				],{});
		})
		.equalsUnordered([
			testSchedules.monday,
			testSchedules.wednesday,
			testSchedules.friday
		])

		.test('simple binary', function() {
			return preferences.sortSchedules([
					testSchedules.friday,
					testSchedules.monday
				], {'mondays': 1});
		})
		.equals([
			testSchedules.monday,
			testSchedules.friday
		])

		.test('two-way tie', function() {
			return preferences.sortSchedules([
					testSchedules.mondayMorning,
					testSchedules.tuesdayMorning,
					testSchedules.packedEvening
				], {'mornings': 1})
		})
		.isIn([
			[
				testSchedules.mondayMorning,
				testSchedules.tuesdayMorning,
				testSchedules.packedEvening
			],
			[
				testSchedules.tuesdayMorning,
				testSchedules.mondayMorning,
				testSchedules.packedEvening
			]
		])

		.test('many schedules', function() {
			return preferences.sortSchedules([
					testSchedules.mondayMorning.concat(
						testSchedules.tuesdayMorning.concat(
							testSchedules.wednesdayEvening)),
					testSchedules.mondayMorning.concat(
						testSchedules.tuesdayMorning.concat(
							testSchedules.wednesdayMorning)),
					testSchedules.mondayEvening.concat(
						testSchedules.tuesdayEvening.concat(
							testSchedules.wednesdayEvening)),
					testSchedules.mondayMorning.concat(
						testSchedules.tuesdayEvening.concat(
							testSchedules.wednesdayEvening))
				], {'mornings': 1});
		})
		.equals([
			testSchedules.mondayMorning.concat(
				testSchedules.tuesdayMorning.concat(
					testSchedules.wednesdayMorning)),
			testSchedules.mondayMorning.concat(
				testSchedules.tuesdayMorning.concat(
					testSchedules.wednesdayEvening)),
			testSchedules.mondayMorning.concat(
				testSchedules.tuesdayEvening.concat(
					testSchedules.wednesdayEvening)),
			testSchedules.mondayEvening.concat(
				testSchedules.tuesdayEvening.concat(
					testSchedules.wednesdayEvening))
		])

		.test('tie-breaking', function() {
			return preferences.sortSchedules([
				testSchedules.mondayMorning,
				testSchedules.tuesdayMorning,
				testSchedules.mondayEvening
			], {'mornings': 10, 'mondays': 1})
		})
		.equals([
			testSchedules.mondayMorning,
			testSchedules.tuesdayMorning,
			testSchedules.mondayEvening
		])

		.finish()

}());
