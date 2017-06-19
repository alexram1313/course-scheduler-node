// Course: { name sections }
// Section: { type code coreqs }


courses = [
	{
		'name': 'math',
		'sections': [
			{'type':'lec', 'code':10000, 'time':1, 'coreqs':[]},
			{'type':'dis', 'code':10005, 'time':2, 'coreqs':[10000]},
			{'type':'dis', 'code':10006, 'time':3, 'coreqs':[10000]},
			{'type':'dis', 'code':10007, 'time':4, 'coreqs':[10000]},
			{'type':'dis', 'code':10008, 'time':5, 'coreqs':[10000]},
			{'type':'dis', 'code':10009, 'time':6, 'coreqs':[10000]}
		]
	},
	{
		'name': 'math',
		'sections': [
			{'type':'lec', 'code':20000, 'time':7, 'coreqs':[]},
			{'type':'dis', 'code':20001, 'time':3, 'coreqs':[20000]},
			{'type':'dis', 'code':20002, 'time':4, 'coreqs':[20000]},
			{'type':'dis', 'code':20003, 'time':8, 'coreqs':[20000]},
			{'type':'lec', 'code':20005, 'time':9, 'coreqs':[]},
			{'type':'dis', 'code':20006, 'time':0, 'coreqs':[20005]},
			{'type':'dis', 'code':20007, 'time':10,'coreqs':[20005]},
			{'type':'dis', 'code':20008, 'time':6, 'coreqs':[20005]}
		]
	}
];
// Actual time conflicts: 10006-20001, 10007-20002, 10009-20008
//              By index:     2-7    ,     3-8    ,     5-13

/* Full matrix, labeled by indices:

     0         5         10    13
 0   0 0 0 0 0 0 0 0 0 0 0 0 0 0
     0 0 1 1 1 1 0 0 0 0 0 0 0 0
     0 1 0 1 1 1 0 1 0 0 0 0 0 0
     0 1 1 0 1 1 0 0 1 0 0 0 0 0
     0 1 1 1 0 1 0 0 0 0 0 0 0 0
 5   0 1 1 1 1 0 0 0 0 0 0 0 0 1
     0 0 0 0 0 0 0 0 0 0 1 1 1 1
     0 0 1 0 0 0 0 0 1 1 1 1 1 1
     0 0 0 1 0 0 0 1 0 1 1 1 1 1
     0 0 0 0 0 0 0 1 1 0 1 1 1 1
 10  0 0 0 0 0 0 1 1 1 1 0 0 0 0
     0 0 0 0 0 0 1 1 1 1 0 0 1 1
     0 0 0 0 0 0 1 1 1 1 0 1 0 1
 13  0 0 0 0 0 1 1 1 1 1 0 1 1 0

*/

function timeConflict(s1,s2) {
	return s1.time === s2.time;
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
	'courses'            : courses,
	'buildConflictMatrix': buildConflictMatrix
};

// console.log(buildConflictMatrix(courses));