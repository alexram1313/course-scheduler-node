module.exports = function(){
	var testCourses = require('./test-courses.js');

	return {
		'packedMorning': [
			testCourses.one.sections[0],
			testCourses.two.sections[1],
			testCourses.three.sections[1],
			testCourses.four.sections[3]
		],
		'packedEvening': [
			testCourses.six.sections[1],
			testCourses.six.sections[2],
			testCourses.seven.sections[1]
		],
		'monday': [
			testCourses.monday.sections[0],
			testCourses.monday.sections[2],
			testCourses.monday.sections[4],
			testCourses.monday.sections[6]
		],
		'tuesday': [
			testCourses.tuesday.sections[0],
			testCourses.tuesday.sections[2],
			testCourses.tuesday.sections[4],
			testCourses.tuesday.sections[6]
		],
		'wednesday': [
			testCourses.wednesday.sections[0],
			testCourses.wednesday.sections[2],
			testCourses.wednesday.sections[4],
			testCourses.wednesday.sections[6]
		],
		'thursday': [
			testCourses.thursday.sections[0],
			testCourses.thursday.sections[2],
			testCourses.thursday.sections[4],
			testCourses.thursday.sections[6]
		],
		'friday': [
			testCourses.friday.sections[0],
			testCourses.friday.sections[2],
			testCourses.friday.sections[4],
			testCourses.friday.sections[6]
		],
		'mondayMorning': [
			testCourses.monday.sections[0],
			testCourses.monday.sections[1],
			testCourses.monday.sections[2]
		],
		'tuesdayMorning': [
			testCourses.tuesday.sections[0],
			testCourses.tuesday.sections[1],
			testCourses.tuesday.sections[2]
		],
		'wednesdayMorning': [
			testCourses.wednesday.sections[0],
			testCourses.wednesday.sections[1],
			testCourses.wednesday.sections[2]
		],
		'thursdayMorning': [
			testCourses.thursday.sections[0],
			testCourses.thursday.sections[1],
			testCourses.thursday.sections[2]
		],
		'fridayMorning': [
			testCourses.friday.sections[0],
			testCourses.friday.sections[1],
			testCourses.friday.sections[2]
		],
		'mondayEvening': [
			testCourses.monday.sections[4],
			testCourses.monday.sections[5],
			testCourses.monday.sections[6],
		],

		'tuesdayEvening': [
			testCourses.tuesday.sections[4],
			testCourses.tuesday.sections[5],
			testCourses.tuesday.sections[6],
		],

		'wednesdayEvening': [
			testCourses.wednesday.sections[4],
			testCourses.wednesday.sections[5],
			testCourses.wednesday.sections[6],
		],

		'thursdayEvening': [
			testCourses.thursday.sections[4],
			testCourses.thursday.sections[5],
			testCourses.thursday.sections[6],
		],

		'fridayEvening': [
			testCourses.friday.sections[4],
			testCourses.friday.sections[5],
			testCourses.friday.sections[6],
		]
	};
}();