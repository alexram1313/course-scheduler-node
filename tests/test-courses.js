module.exports = function(){
	var createSection = require('../api/models/section.js').createSection;
	var createCourse = require('../api/models/course.js').createCourse;

	return {
		'one'  : createCourse(1, 'Course One', [
				createSection('lec', 'Lecture 1.1', 10001, 'MWF', '10:00', '10:50', [])
			]),
		'two'  : createCourse(2, 'Course Two', [
				createSection('lec', 'Lecture 2.1', 20001, 'MWF', '10:00', '10:50', []),
				createSection('lec', 'Lecture 2.2', 20002, 'MWF', '11:00', '11:50', []),
				createSection('lec', 'Lecture 2.3', 20003, 'MWF', '12:00', '12:50', [])
			]),
		'three': createCourse(3, 'Course Three', [
				createSection('lec', 'Lecture 3.1', 30001, 'MWF', '10:00', '10:50', []),
				createSection('dis', 'Discussion 3.1.1', 30101, 'TuTh', '10:00', '10:50', [30001])
			]),
		'four' : createCourse(4, 'Course Four', [
				createSection('lec', 'Lecture 4.1', 40001, 'MWF', '10:00', '10:50', []),
				createSection('lec', 'Lecture 4.2', 40002, 'MWF', '11:00', '11:50', []),
				createSection('dis', 'Discussion 4.1.1', 40101, 'TuTh', '10:00', '10:50', [40001]),
				createSection('dis', 'Discussion 4.2.1', 40202, 'TuTh', '11:00', '11:50', [40002]),
				createSection('dis', 'Discussion 4.2.2', 40202, 'TuTh', '12:00', '12:50', [40002])
			]),
		'five' : createCourse(5, 'Course Five', [
				createSection('lec', 'Lecture 5.1', 50001, 'MWF', '10:00', '10:50', []),
				createSection('dis', 'Discussion 5.1.1', 50101, 'Tu', '10:00', '10:50', [50001]),
				createSection('lab', 'Lab 5.1.1', 50111, 'Th', '10:00', '10:50', [50101])
			]),
		'six'  : createCourse(6, 'Course Six', [
				createSection('lec', 'Lecture 6.1', 60001, 'MWF', '17:00', '17:50', []),
				createSection('lec', 'Lecture 6.2', 60002, 'MWF', '18:00', '18:50', []),
				createSection('lec', 'Lecture 6.3', 60003, 'MWF', '19:00', '19:50', [])
			]),
		'seven': createCourse(7, 'Course Seven', [
				createSection('lec', 'Lecture 7.1', 70001, 'TuTh', '17:00', '17:20', []),
				createSection('lec', 'Lecture 7.2', 70002, 'TuTh', '17:30', '18:50', [])
			]),

		'monday': createCourse(10, 'Monday Course', [
				createSection('lec', 'Lecture 8 am', 10008, 'M', '08:00', '08:50'),
				createSection('lec', 'Lecture 10 am', 10010, 'M', '10:00', '10:50'),
				createSection('lec', 'Lecture 12 am', 10012, 'M', '12:00', '12:50'),
				createSection('lec', 'Lecture 2 pm', 10014, 'M', '14:00', '14:50'),
				createSection('lec', 'Lecture 4 pm', 10016, 'M', '16:00', '16:50'),
				createSection('lec', 'Lecture 6 pm', 10018, 'M', '18:00', '18:50'),
				createSection('lec', 'Lecture 8 pm', 10020, 'M', '20:00', '20:50')
			]),
		'tuesday': createCourse(11, 'Tuesday Course', [
				createSection('lec', 'Lecture 8 am', 11008, 'Tu', '08:00', '08:50'),
				createSection('lec', 'Lecture 10 am', 11010, 'Tu', '10:00', '10:50'),
				createSection('lec', 'Lecture 12 am', 11012, 'Tu', '12:00', '12:50'),
				createSection('lec', 'Lecture 2 pm', 11014, 'Tu', '14:00', '14:50'),
				createSection('lec', 'Lecture 4 pm', 11016, 'Tu', '16:00', '16:50'),
				createSection('lec', 'Lecture 6 pm', 11018, 'Tu', '18:00', '18:50'),
				createSection('lec', 'Lecture 8 pm', 11020, 'Tu', '20:00', '20:50')
			]),
		'wednesday': createCourse(12, 'Wednesday Course', [
				createSection('lec', 'Lecture 8 am', 12008, 'W', '08:00', '08:50'),
				createSection('lec', 'Lecture 10 am', 12010, 'W', '10:00', '10:50'),
				createSection('lec', 'Lecture 12 am', 12012, 'W', '12:00', '12:50'),
				createSection('lec', 'Lecture 2 pm', 12014, 'W', '14:00', '14:50'),
				createSection('lec', 'Lecture 4 pm', 12016, 'W', '16:00', '16:50'),
				createSection('lec', 'Lecture 6 pm', 12018, 'W', '18:00', '18:50'),
				createSection('lec', 'Lecture 8 pm', 12020, 'W', '20:00', '20:50')
			]),
		'thursday': createCourse(13, 'Thursday Course', [
				createSection('lec', 'Lecture 8 am', 13008, 'Th', '08:00', '08:50'),
				createSection('lec', 'Lecture 10 am', 13010, 'Th', '10:00', '10:50'),
				createSection('lec', 'Lecture 12 am', 13012, 'Th', '12:00', '12:50'),
				createSection('lec', 'Lecture 2 pm', 13014, 'Th', '14:00', '14:50'),
				createSection('lec', 'Lecture 4 pm', 13016, 'Th', '16:00', '16:50'),
				createSection('lec', 'Lecture 6 pm', 13018, 'Th', '18:00', '18:50'),
				createSection('lec', 'Lecture 8 pm', 13020, 'Th', '20:00', '20:50')
			]),
		'friday': createCourse(14, 'Friday Course', [
				createSection('lec', 'Lecture 8 am', 14008, 'F', '08:00', '08:50'),
				createSection('lec', 'Lecture 10 am', 14010, 'F', '10:00', '10:50'),
				createSection('lec', 'Lecture 12 am', 14012, 'F', '12:00', '12:50'),
				createSection('lec', 'Lecture 2 pm', 14014, 'F', '14:00', '14:50'),
				createSection('lec', 'Lecture 4 pm', 14016, 'F', '16:00', '16:50'),
				createSection('lec', 'Lecture 6 pm', 14018, 'F', '18:00', '18:50'),
				createSection('lec', 'Lecture 8 pm', 14020, 'F', '20:00', '20:50')
			])
	};
}();
