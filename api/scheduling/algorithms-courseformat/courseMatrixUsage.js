var conflicts = require('./courseConflicts.js');

/*
Coreq Structure

The key to encoding the course dependency structures:
Draw out the corequirement structure as a tree, where a "parent" is corequired by all of its "children", that is, where taking the parent requires that you take at least one of the children.
To properly represent this, you need multiple starting places; that is to say, there are a set of section types, not just a single one, that you must take one of each of. So really, you have a forest, not a tree.

Now, form a list of indices of courses that corequire no other courses, grouped within their course-type. Call this list roots. Formally,
  roots = [[i : si->type == typej && si->coreqs == {}] : typej in [course-types]]
Next, form a 1-level representation of the forest as a list of lists of indices, as follows:
  forest = [ci : for all i, ci = [j : si in sj->coreqs]]
That is, the ith entry in forests is exactly those courses that corequire section si.

Now, we have a simple algorithm to calculate all possible schedules:
At each level, take exactly one option, recurring if necessary.
*/

function test_schedules(conflictMatrix, roots, forest) {
	function add_section(current, i) {
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
				return add_single_type(current.copy(), typeOptions);
			});
			// Combine those options into a flat list of consistent schedules
			return blend_options(current, options);
		}

		function add_single_type(current, options) {
			return options.reduce(function(acc,o) {
				if (consistent(current.copy().orBit(o, 1))) {
					return acc.concat(add_section(current, o));
				} else {
					return acc;
				}
			}, []);
		}
	}

	function consistent(schedule) {
		return conflictMatrix.multiply(schedule).andRow(schedule).isZero();
	}

	function blend_options(current, root_schedules) {
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
					return acc.concat(blend_options(current_copy, root_schedules.slice(1)));
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
			return acc.concat(add_section(new conflictMatrix.Row(), root_section));
		}, []);
	});
	return blend_options(new conflictMatrix.Row(),root_schedules);
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

module.exports = {
	genScheds: function(courses, prefs) {
		var data = conflicts.buildConflictMatrix(courses);
		var scheduleRows = test_schedules(data.matrix, data.roots, data.forest);
		return scheduleRows.map( decoder(data.list) );
	}
};