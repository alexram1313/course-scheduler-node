module.exports = function() {
	var conflicts = require('./courseConflicts.js');
	var preferences = require('./preferences.js');

	function testSchedules(conflictMatrix, roots, forest) {
		function addSection(current, i) {
			// Explanation: takes a current schedule and an (assumed consistent) additional section
			// specified by index i, and adds i to current by incorporating all consistent
			// options for taking all corequiring courses as well.
			var reqsByType = forest[i];
			current = current.copy().orBit(i, 1);

			if (reqsByType.length == 0) {
				return [current];
			} else {
				// Get all consistent options for each coreq individually
				options = reqsByType.map(function(typeOptions){
					return addSingleType(current.copy(), typeOptions);
				});
				// Combine those options into a flat list of consistent schedules
				return blendOptions(current, options);
			}

			function addSingleType(current, options) {
				return options.reduce(function(acc,o) {
					if (consistent(current.copy().orBit(o, 1))) {
						return acc.concat(addSection(current, o));
					} else {
						return acc;
					}
				}, []);
			}
		}

		function consistent(schedule) {
			return conflictMatrix.multiply(schedule).andRow(schedule).isZero();
		}

		function blendOptions(current, root_schedules) {
			// Explanation: takes a consistent schedule current and 
			// a list of options root_schedules, and builds all consistent schedules
			// it can by choosing one from each sub-list of root_schedules
			if (root_schedules.length == 0){
				// no more schedules to add
				return [current];
			} else {
				// reduce one root_schedule into the list of consistent schedules
				return root_schedules[0].reduce(function(acc,root_schedule){
					var current_copy = current.copy().orRow(root_schedule);
					if (consistent(current_copy)) {
						// if current and root_schedule are compatible, add it in and continue recursively
						return acc.concat(blendOptions(current_copy, root_schedules.slice(1)));
					} else {
						// otherwise, neglect this root_schedule.
						return acc;
					}
				}, []);
			}
		}

		var root_schedules = roots.map(function(root_course){
			// generate all consistent schedules for each root_course
			return root_course.reduce(function(acc,root_section){
				return acc.concat(addSection(new conflictMatrix.Row(), root_section));
			}, []);
		});
		return blendOptions(new conflictMatrix.Row(),root_schedules);
	}

	function decoder(section_list) {
		return function(scheduleRow) {
			var schedule = [];
			for (var i = scheduleRow.size(); i >= 0; --i) {
				if (scheduleRow.get(i)) {
					schedule.push(section_list[i]);
				}
			}
			return schedule;
		}
	}

	function generateSchedules(courses, prefs) {
		var data = conflicts.buildConflictMatrix(courses);
		var scheduleRows = testSchedules(data.matrix, data.roots, data.forest);
		var schedules = scheduleRows.map( decoder(data.list) );
		return preferences.sortSchedules(schedules);
	}

	return {
		'genScheds': generateSchedules
	};

}();