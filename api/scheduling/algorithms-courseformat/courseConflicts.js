var moment = require('moment');
var BitMatrix = require('./BitMatrix.js').BitMatrix;

function dayConflict(d1, d2){
	//MTuWThF Check
	for (var day of ['M','Tu','W','Th','F']) {
		if ((d1.indexOf(day) != -1) && (d2.indexOf(day) != -1)) return true;
	}

	//No Conflict
	return false;
}

function meetTimeConflict(s1Start, s1End, s2Start, s2End, final){
	if (typeof(final)==='undefined') final = false;
	
	//Setup
	var start1, start2, end2, end1;

	if (final){

		if ((s1Start == '') || (s2Start=='')) return false;

		start1 = moment(s1Start);
		start2 = moment(s2End);
		end1   = moment(s1Start);
			end1.add(2, 'hours');
		end2   = moment(s2End);
			end2.add(2, 'hours');

	} else {
		var ref = '2017-01-02 ';
		format  = "YYYY-MM-DD H:m";

		start1 = moment(ref+s1Start, format);
		start2 = moment(ref+s2Start, format);
		end2 = moment(ref+s2End, format);
		end1 = moment(ref+s1End, format);
	}

	//Time conflict computation
	return ((start1.diff(end2) < 0) && (start2.diff(end1) < 0));
}

function timeConflict(s1,s2) {
	return (dayConflict(s1.days, s2.days) &&
		   meetTimeConflict(s1.startTime, s1.endTime, s2.startTime, s2.endTime)) ||
		   ((s1.hasOwnProperty('final') && (s2.hasOwnProperty('final'))?
				meetTimeConflict(s1.final.date, '', s2.final.date, '', true):false));
}

function buildConflictMatrix(courses) {
	var i      = 0;
	var offset = 0;
	var nSec   = 0;
	var codeLookup     = {};
	var sectionsByType = {};
	var sectionRow;

	courses.forEach(function(c){
		// useful for pre-allocating arrays to know how many sections we have
		nSec += c.sections.length;
		c.sections.forEach(function(s) {
			// since coreqs might appear out-of-order, need to squirrel these away up front
			codeLookup[s.code] = {'index': i++, 'section':s};
			// while I'm at it, might as well pre-compute types
			if (!sectionsByType.hasOwnProperty(s.secType)) {
				sectionsByType[s.secType] = null;
			}
		});
	});

	var A = new BitMatrix(nSec);

	var sectionList     = new Array(nSec);
	var coreqRootsTemp  = {};
	var coreqRoots      = new Array();
	var coreqForest     = new Array(nSec);
	for (var i = 0; i < nSec; ++i) {
		coreqForest[i] = {};
	}
	for (var type in sectionsByType) {
		if (!sectionsByType.hasOwnProperty(type)) continue;
		sectionsByType[type] = new A.Row();
	}

	// var A = new Uint32Array(new ArrayBuffer(nSec * 4));

	i = 0;
	courses.forEach(function(c){
		// reset sectionsByType and coreqRootsTemp, which are logically local to each course.
		// for (var j = 0; j < ntypes; ++j) {
		// 	sectionsByType[j] = 0;
		// }
		for (var type in sectionsByType) {
			if (!sectionsByType.hasOwnProperty(type)) continue;
			sectionsByType[type].reset();
		}
		coreqRootsTemp = {};

		// pre-process sectionsByType, so that we know what "future" coreq-types conflict
		// with a current section (e.g., a lecture after a previous lecture's discussions)
		offset = 0;
		c.sections.forEach(function(s){
			// a section conflicts with every other section of the same type for this course
			sectionRow = sectionsByType[s.secType];
			A.orRow(i + offset, sectionRow);
			sectionsByType[s.secType].orBit(i + offset, 1);
			++offset;
		});

		// process each section
		c.sections.forEach(function(s){
			// bookkeeping, for lookups later
			// note: I can do this just-in-time because I only ever look up previous sections
			sectionList[i] = s;

			s.coreqs.forEach(function(coreq){
				var jco = codeLookup[coreq];
				// a section conflicts with all sections that are the same type
				// as a co-required section, but aren't that section.
				sectionRow = new A.Row()
					.orBit(jco.index, 1)
					.invert()
					.andRow(sectionsByType[jco.section.secType]);
				A.orRow(i, sectionRow);
				// Additionally, we add s as a child of its coreq, designated by its type, in our forest:
				if (!coreqForest[jco.index].hasOwnProperty(s.secType)) {
					coreqForest[jco.index][s.secType] = new Array();
				}
				coreqForest[jco.index][s.secType].push(i);
			});

			if (s.coreqs.length == 0) {
				if (!coreqRootsTemp.hasOwnProperty(s.secType)) {
					coreqRootsTemp[s.secType] = new Array();
				}
				coreqRootsTemp[s.secType].push(i);
			}

			// finally, scan the row and fill in any time conflicts that arise
			for (var k = 0; k < i; ++k) {
				if (!A.get(i, k) && timeConflict(s, sectionList[k])) {
					A.orBit(i, k, 1);
				}
			}

			++i; // increment i for the next run
		});

		// push each type of root we've collected into the roots list
		for (var type in coreqRootsTemp) {
			if (!coreqRootsTemp.hasOwnProperty(type)) continue;
			coreqRoots.push(coreqRootsTemp[type]);
		}
	});

	// reflect and "or", filling in the other half of the matrix
	A.orSymmetric();

	// Collect all the corequirements, and drop the different type names.
	var coreqArr;
	for (var j = coreqForest.length - 1; j >= 0; --j) {
		coreqArr = [];
		for (var typeName in coreqForest[j]) {
			if (!coreqForest[j].hasOwnProperty(typeName)) continue;
			coreqArr.push(coreqForest[j][typeName]);
		}
		coreqForest[j] = coreqArr;
	}

	// Phew.
	return {
		'matrix': A,
		'list'  : sectionList,
		'roots' : coreqRoots,
		'forest': coreqForest
	};
}

module.exports = {
	'buildConflictMatrix': buildConflictMatrix
};