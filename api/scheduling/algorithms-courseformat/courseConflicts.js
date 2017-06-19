var moment = require('moment');

function dayConflict(d1, d2){
	//TBA Check
	//All set times in WebSOC will have days and time
	//so we only need this check once.
	//For now, allow the course to be scheduled.
	if ((d1 === '') || (d2 === '')) return false;

	//MTuWThF Check
	if ((d1.indexOf('M') != 1) && (d2.indexOf('M') != 1)) return true;
	if ((d1.indexOf('Tu') != 1) && (d2.indexOf('Tu') != 1)) return true;
	if ((d1.indexOf('W') != 1) && (d2.indexOf('W') != 1)) return true;
	if ((d1.indexOf('Th') != 1) && (d2.indexOf('Th') != 1)) return true;
	if ((d1.indexOf('F') != 1) && (d2.indexOf('F') != 1)) return true;

	//No Conflict
	return false;
}

function meetTimeConflict(s1Start, s1End, s2Start, s2End){
	var ref = '2017-01-02 ';

	var start1 = moment(ref+s1Start, "YYYY-MM-DD H:m");
	var start2 = moment(ref+s2Start, "YYYY-MM-DD H:m");
	var end2 = moment(ref+s2End, "YYYY-MM-DD H:m");
	
	//Check 1
	if ((start1.diff(start2) > 0) && (start1.diff(end2) < 0)) return true;
	//Check 2
	var end1 = moment(ref+s1End, "YYYY-MM-DD H:m");
	if ((end1.diff(start2) > 0) && (end1.diff(end2) < 0)) return true;

	//No conflict
	return false;
}

function timeConflict(s1,s2) {
	return dayConflict(s1.days, s2.days) && 
		   meetTimeConflict(s1.startTime, s1.endTime, s2.startTime, s2.endTime);
}

function buildConflictMatrix(courses) {
	var i = 0;
	var offset = 0;
	var nSec = 0;
	var ntypes = 0;
	var codeLookup = {};
	var typeLookup = {};
	var typeIndex;

	courses.forEach(function(c){
		// useful for pre-allocating arrays to know how many sections we have
		nSec += c.sections.length;
		c.sections.forEach(function(s) {
			// since coreqs might appear out-of-order, need to squirrel these away up front
			codeLookup[s.code] = {'index': i++, 'section':s};
			// while I'm at it, might as well pre-compute types and count them
			if (!typeLookup.hasOwnProperty(s.type)) {
				typeLookup[s.type] = ntypes++;
			}
		});
	});

	var sectionList = new Array(nSec);
	var coreqRootsTemp = {};
	var coreqRoots     = new Array();
	var coreqForest    = new Array(nSec);
	for (var i = 0; i < nSec; ++i) {
		coreqForest[i] = new Array();
	}

	// This sets up A with n 32-bit slots.
	// This will work for up to 32 sections.
	// For better implementations, look into the DataView object,
	// which might allow for arbitrarily large bytelengths.
	// Note that ArrayBuffer initializes memory to 0.
	var A = new Uint32Array(new ArrayBuffer(nSec * 4));
	var sectionsByType = new Uint32Array(new ArrayBuffer(ntypes * 4));

	i = 0;
	courses.forEach(function(c){
		// reset sectionsByType and coreqRootsTemp, which are logically local to each course.
		for (var j = 0; j < ntypes; ++j) {
			sectionsByType[j] = 0;
		}
		coreqRootsTemp = {};

		// pre-process sectionsByType, so that we know what "future" coreq-types conflict
		// with a current section (e.g., a lecture after a previous lecture's discussions)
		offset = 0;
		c.sections.forEach(function(s){
			// a section conflicts with every other section of the same type for this course
			typeIndex = typeLookup[s.type];
			A[i + offset] |= sectionsByType[typeIndex];
			sectionsByType[typeIndex] |= (1 << (i + offset));
			++offset;
		});

		// process each section
		c.sections.forEach(function(s){
			// typeIndex = typeLookup[s.type];
			// A[i] |= sectionsByType[typeIndex];
			// sectionsByType[typeIndex] |= (1 << i);

			// bookkeeping, for lookups later
			// note: I can do this just-in-time because I only ever look up previous sections
			sectionList[i] = s;

			s.coreqs.forEach(function(coreq){
				var jco = codeLookup[coreq];
				// a section conflicts with all sections that are the same type
				// as a co-required section, but aren't that section.
				A[i] |= (sectionsByType[typeLookup[jco.section.type]] & ~(1 << jco.index));
				// Additionally, we add s as a child of its coreq in our forest:
				coreqForest[jco.index].push(i);
			});

			if (s.coreqs.length == 0) {
				if (!coreqRootsTemp.hasOwnProperty(s.type)) {
					coreqRootsTemp[s.type] = new Array();
				}
				coreqRootsTemp[s.type].push(i);
			}

			// finally, scan the row and fill in any time conflicts that arise
			for (var k = 0; k < i; ++k) {
				if (!(A[i] & (1 << k)) && timeConflict(s, sectionList[k])) {
					A[i] |= (1 << k);
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

	// Takes the lower-triangular matrix we just built and reflects
	// it to be a symmetric matrix.
	// Please don't ask me to explain it; it took an entire afternoon to figure this out.
	for (var x = 0; x < nSec; ++x) {
		for (var y = x; y < nSec; ++y) {
			A[y] |= (A[x] & (1 << y)) >>> (y - x);
			A[x] |= (A[y] & (1 << x)) <<  (y - x);
		}
	}

	// Phew.
	return {
		'matrix': A,
		'list'  : sectionList,
		'n'     : i,
		'roots' : coreqRoots,
		'forest': coreqForest
	};
}

module.exports = {
	'buildConflictMatrix': buildConflictMatrix
};

// console.log(buildConflictMatrix(courses));