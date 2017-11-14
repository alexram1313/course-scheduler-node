module.exports = function(){
	var moment = require('moment');

	var referenceDay = '2017-01-02 ';
	var dateFormat   = "YYYY-MM-DD H:m";

	function time(timeString) {
		return moment(referenceDay + timeString, dateFormat);
	}

	function hourDelta(time1, time2) {
		return (time1 - time2) / 3600000; // ms per hour: 1000 * 60 * 60
	}

	function meetsOn(section, day) {
		return section.days.indexOf(day) !== -1;
	}

	function daysPerWeek(section) {
		count = 0;
		for (var day of ['M','Tu','W','Th','F']) {
			if (section.days.indexOf(day) != -1) count++;
		}
		return count;
	}

	function hourLength(section) {
		return hourDelta(time(section.endTime), time(section.startTime));
	}

	function mornings(schedule) {
		var morningEnd = time('12:00');
		return Math.sqrt(schedule.reduce(function(acc, section) {
			// integrates time in class, weighted by how far ahead of morning end it is.
			var start = Math.max(0, hourDelta(morningEnd, time(section.startTime)));
			var end   = Math.max(0, hourDelta(morningEnd, time(section.endTime)));
			return acc + (start * start - end * end) * daysPerWeek(section);
		}, 0));
	}

	function evenings(schedule) {
		var eveningStart = time('16:00');
		return Math.sqrt(schedule.reduce(function(acc, section) {
			// integrates time in class, weighted by how far after evening start it is.
			var start = Math.max(0, hourDelta(time(section.startTime), eveningStart));
			var end   = Math.max(0, hourDelta(time(section.endTime), eveningStart));
			return acc + (end * end - start * start) * daysPerWeek(section);
		}, 0));
	}

	function mondays(schedule) {
		return schedule.reduce(function(acc, section) {
			if (meetsOn(section, 'M')) {
				acc += hourLength(section);
			}
			return acc;
		}, 0);
	}

	function fridays(schedule) {
		return schedule.reduce(function(acc, section) {
			if (meetsOn(section, 'F')) {
				acc += hourLength(section);
			}
			return acc;
		}, 0);
	}

	function balance(schedule) {
		var hoursPerDay = {
			'M' : 0,
			'Tu': 0,
			'W' : 0,
			'Th': 0,
			'F' : 0
		};
		var totalHours = 0;
		schedule.forEach(function(section) {
			for (var day in hoursPerDay) {
				if (!hoursPerDay.hasOwnProperty(day)) continue;
				if (meetsOn(section, day)) {
					var sectionLength = hourLength(section);
					hoursPerDay[day] += sectionLength;
					totalHours += sectionLength;
				}
			}
		});

		var averageHours = totalHours / 5;
		var score = 0;
		for (var day in hoursPerDay) {
			if (!hoursPerDay.hasOwnProperty(day)) continue;
			var imbalance = hoursPerDay[day] - averageHours;
			score += imbalance * imbalance;
		}
		return -Math.sqrt(score);
	}

	function gaps(schedule) {
		var hoursPerDay = {
			'M' : 0,
			'Tu': 0,
			'W' : 0,
			'Th': 0,
			'F' : 0
		};
		startTimes = {
			'M' : undefined,
			'Tu': undefined,
			'W' : undefined,
			'Th': undefined,
			'F' : undefined
		};
		endTimes = {
			'M' : undefined,
			'Tu': undefined,
			'W' : undefined,
			'Th': undefined,
			'F' : undefined
		};
		schedule.forEach(function(section) {
			for (var day in startTimes) {
				if (!startTimes.hasOwnProperty(day)) continue;
				if (meetsOn(section, day)) {
					hoursPerDay[day] += hourLength(section);
					if (startTimes[day] === undefined ||
						startTimes[day] > time(section.startTime)) {
						startTimes[day] = time(section.startTime);
					}
					if (endTimes[day] === undefined ||
						endTimes[day] < time(section.endTime)) {
						endTimes[day] = time(section.endTime);
					}
				}
			}
		});

		var gapHours = 0;
		for (var day in startTimes) {
			if (!startTimes.hasOwnProperty(day)) continue;
			if (startTimes[day] === undefined) continue;
			// gaps are hours between daily start and finish, less the time in class.
			gapHours += hourDelta(endTimes[day], startTimes[day]) - hoursPerDay[day];
		}

		return gapHours;
	}

	function openings(schedule) {
		// TODO: store openings data and compute this score
		return 0;
	}

	var scoreFns = {
		'mornings': mornings,
		'evenings': evenings,
		'mondays' : mondays,
		'fridays' : fridays,
		'balance' : balance,
		'gaps'    : gaps,
		'openings': openings
	};

	var normalization = {
		'mornings': 1,
		'evenings': 0.85,
		'mondays' : 1.1,
		'fridays' : 1.1,
		'balance' : 1,
		'gaps'    : 0.115,
		'openings': 1
	};

	// Should be given a list of sections, and a dictionary
	// of features to numerical scores. Returns a number.
	function scoreSchedule(schedule, prefs) {
		var score = 0;
		for (var feature in prefs) {
			if (!prefs.hasOwnProperty(feature)) continue;
			if (prefs[feature] === 0) continue; // short-circuit irrelevant features
			if (!scoreFns.hasOwnProperty(feature)) continue;
			score += prefs[feature] * normalization[feature] * scoreFns[feature](schedule);
		}
		return score;
	}

	function sortSchedules(schedules, prefs) {
		var scoredSchedules = schedules.map(function(schedule) {
			return {
				'score': scoreSchedule(schedule, prefs),
				'schedule': schedule
			};
		});
		scoredSchedules.sort(function(s1, s2) {
			return s2.score - s1.score; // best (highest) scores first
		});
		return scoredSchedules.map(function(s) { return s.schedule; });
	}

	return {
		'features'     : Object.keys(scoreFns),
		'scoreSchedule': scoreSchedule,
		'sortSchedules': sortSchedules
	};
}();