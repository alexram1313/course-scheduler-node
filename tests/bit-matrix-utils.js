module.exports = function() {
	var TestModule = require('./test-utils.js').TestModule;

	function zeros(rows, columns) {
		var arr = [];
		for (var i = 0; i < rows; i++) {
			arr.push([]);
			for (var j = 0; j < columns; j++) {
				arr[i].push(0);
			}
		}
		return arr;
	}

	function oneAtRow(coords, size) {
		var arr = zeros(1,size)[0];
		for (var i = 0; i < coords.length; i++) {
			arr[coords[i]] = 1;
		}
		return arr;
	}

	function oneAtMatrix(coords, size) {
		var arr = zeros(size, size);
		for (var i = 0; i < coords.length; i++) {
			arr[coords[i][0]][coords[i][1]] = 1;
		}
		return arr;
	}

	function inverseIdentity(size) {
		var arr = [];
		for (var i = 0; i < size; i++) {
			arr.push([]);
			for (var j = 0; j < size; j++) {
				arr[i].push(i === j ? 0 : 1);
			}
		}
		return arr;
	}

	// horizontally concatenate matrices
	function hconcat(/* variadic */) {
		var height = arguments[0].length;
		var arr = [];
		for (var i = 0; i < height; i++) arr.push([]);
		for (var m = 0; m < arguments.length; m++) {
			if (arguments[m].length !== height) {
				throw new Error('Incompatible sizes given to hconcat: argument '+m+' has height '+arguments[m].length+', not '+height+'.');
			}
			for (var i = 0; i < height; i++) {
				arr[i] = arr[i].concat(arguments[m][i]);
			}
		}
		return arr;
	}

	// vertically concatenate matrices
	function vconcat(/* variadic */) {
		var width = arguments[0][0].length;
		var arr = [];
		for (var m = 0; m < arguments.length; m++) {
			if (arguments[m][0].length !== width) {
				throw new Error('Incompatible sizes given to vconcat: argument '+m+' has width '+arguments[m][0].length+', not '+width+'.');
			}
			arr = arr.concat(arguments[m]);
		}
		return arr;
	}

	function rawRow(row, size) {
		var arr = [];
		for (var i = 0; i < size; i++) {
			arr.push( row.get(i) );
		}
		return arr;
	}

	function rawMatrix(bm, size) {
		var arr = [];
		for (var i = 0; i < size; i++) {
			arr.push([]);
			for (var j = 0; j < size; j++) {
				arr[i].push(bm.get(i,j));
			}
		}
		return arr;
	}

	new TestModule('Bit Matrix utilities')

		.test('zeros', function(){
			return zeros(2,4);
		})
		.equals([[0,0,0,0],[0,0,0,0]])

		.test('oneAtRow blank', function(){
			return oneAtRow([], 5);
		})
		.equals([0,0,0,0,0])

		.test('oneAtRow non-blank', function(){
			return oneAtRow([1,3], 5);
		})
		.equals([0,1,0,1,0])

		.test('oneAtMatrix blank', function(){
			return oneAtMatrix([], 3);
		})
		.equals([[0,0,0],[0,0,0],[0,0,0]])

		.test('oneAtMatrix non-blank', function(){
			return oneAtMatrix([[0,1],[1,2],[2,0]], 3);
		})
		.equals([[0,1,0],[0,0,1],[1,0,0]])

		.test('inverseIdentity', function(){
			return inverseIdentity(4);
		})
		.equals([[0,1,1,1],[1,0,1,1],[1,1,0,1],[1,1,1,0]])

		.test('hconcat', function(){
			return hconcat([[1],[2],[3]], [[10,11],[20,21],[30,31]]);
		})
		.equals([[1,10,11],[2,20,21],[3,30,31]])

		.test('vconcat', function(){
			return vconcat([[1,10,11]],[[2,20,21],[3,30,31]]);
		})
		.equals([[1,10,11],[2,20,21],[3,30,31]])

		.finish();

	return {
		'zeros': zeros,
		'oneAtRow': oneAtRow,
		'oneAtMatrix': oneAtMatrix,
		'inverseIdentity': inverseIdentity,
		'hconcat': hconcat,
		'vconcat': vconcat,
		'rawRow': rawRow,
		'rawMatrix': rawMatrix
	};
}();
