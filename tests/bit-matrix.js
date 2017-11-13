(function(){
var BitMatrix  = require('../api/scheduling/algorithms-courseformat/BitMatrix.js').BitMatrix;

var TestModule = require('./test-utils.js').TestModule;
var bmu = require('./bit-matrix-utils.js');

new TestModule('Bit Row Operations')

	.test('Row init', function() {
		var n = 100;
		var bm = new BitMatrix(n);
		var row = new bm.Row();
		return bmu.rawRow(row, n);
	})
	.equals(bmu.oneAtRow([], 100))

	.test('size', function() {
		var n = 100;
		var bm = new BitMatrix(n);
		var row = new bm.Row();
		return row.size();
	})
	.equals(100)

	.test('orBit', function() {
		var n = 100;
		var bm = new BitMatrix(n);
		var row = new bm.Row();
		row.orBit(3, 1);
		row.orBit(5, 0);
		row.orBit(97, 1);
		row.orBit(86, 0);
		return bmu.rawRow(row, n);
	})
	.equals(bmu.oneAtRow([3,97], 100))

	.test('orRow', function() {
		var n = 100;
		var bm = new BitMatrix(n);
		var row1 = new bm.Row();
		row1.orBit(3, 1);
		row1.orBit(97, 1);
		var row2 = new bm.Row();
		row2.orBit(4, 1);
		row2.orBit(97, 1);
		row1.orRow(row2);

		return [bmu.rawRow(row1,n), bmu.rawRow(row2,n)];
	})
	.equals([bmu.oneAtRow([3,97,4], 100), bmu.oneAtRow([4,97], 100)])

	.test('andRow', function() {
		var n = 100;
		var bm = new BitMatrix(n);
		var row1 = new bm.Row();
		row1.orBit(3, 1);
		row1.orBit(97, 1);
		var row2 = new bm.Row();
		row2.orBit(4, 1);
		row2.orBit(97, 1);
		row1.andRow(row2);

		return [bmu.rawRow(row1,n), bmu.rawRow(row2,n)];
	})
	.equals([bmu.oneAtRow([97], 100), bmu.oneAtRow([4,97], 100)])

	.test('invert', function() {
		var n   = 100;
		var bm  = new BitMatrix(n);
		var row = new bm.Row();
		row.orBit(3,1);
		row.orBit(93,1);
		row.invert();
		return bmu.rawRow(row, n);
	})
	.equals(function() {
		var arr = [];
		for (var i = 0; i < 100; i++) {
			arr.push(1);
		}
		arr[3] = 0;
		arr[93] = 0;
		return arr;
	}())

	.test('isZero', function() {
		var n   = 100;
		var bm  = new BitMatrix(n);
		var row = new bm.Row();
		var beforeSetting = row.isZero();
		row.orBit(3,1);
		row.orBit(93,1);
		var afterSetting = row.isZero();
		return [beforeSetting, afterSetting];
	})
	.equals([1,0])

	.test('copy', function() {
		var n   = 100;
		var bm  = new BitMatrix(n);
		var row = new bm.Row();
		row.orBit(3,1);
		row.orBit(93,1);
		row2 = row.copy();

		return [bmu.rawRow(row, n), bmu.rawRow(row2, n)];
	})
	.equals([bmu.oneAtRow([3,93], 100), bmu.oneAtRow([3,93], 100)])

	.test('reset', function() {
		var n   = 100;
		var bm  = new BitMatrix(n);
		var row = new bm.Row();
		row.orBit(3,1);
		row.orBit(4,0);
		row.orBit(93,1);
		row.orBit(94,0);
		row.reset();
		return bmu.rawRow(row, n);
	})
	.equals(bmu.oneAtRow([], 100))

	.finish();


new TestModule('Bit Matrix Operations')

	.test('small init', function() {
		var n = 3;
		var bm = new BitMatrix(3);
		return bmu.rawMatrix(bm, n);
	})
	.equals(bmu.oneAtMatrix([],3))

	.test('big init', function() {
		var n = 300;
		var bm = new BitMatrix(3);
		return bmu.rawMatrix(bm, n);
	})
	.equals(bmu.oneAtMatrix([],300))

	.test('orBit', function() {
		var n = 100;
		var bm = new BitMatrix(n);
		bm.orBit(3, 4, 1);
		bm.orBit(5, 2, 0);
		bm.orBit(97, 83, 1);
		bm.orBit(82, 76, 0);
		return bmu.rawMatrix(bm, n);
	})
	.equals(bmu.oneAtMatrix([[3,4],[97,83]], 100))

	.test('orRow', function() {
		var n   = 100;
		var bm  = new BitMatrix(n);
		var row = new bm.Row();
		row.orBit(3,1);
		row.orBit(97,1);
		bm.orRow(5, row);
		bm.orRow(84, row);
		return bmu.rawMatrix(bm, n);
	})
	.equals(bmu.oneAtMatrix([[5,3],[5,97],[84,3],[84,97]], 100))

	.test('orSymmetric', function() {
		var n   = 100;
		var bm  = new BitMatrix(n);
		bm.orBit(5,  3,1);
		bm.orBit(5, 97,1);
		bm.orBit(84, 3,1);
		bm.orBit(84,97,1);
		bm.orSymmetric();
		return bmu.rawMatrix(bm, n);
	})
	.equals(bmu.oneAtMatrix([
		[5,3],[5,97],[84,3],[84,97],
		[3,5],[97,5],[3,84],[97,84]
		], 100))

	.test('multiply', function() {
		var n   = 100;
		var bm  = new BitMatrix(n);
		var row = new bm.Row();

		row.orBit(3,1);
		row.orBit(97,1);

		bm.orBit(5,  3,1);
		bm.orBit(84, 3,1);
		bm.orBit(84,97,1);

		return bmu.rawRow(bm.multiply(row), n);
	})
	.equals(bmu.oneAtRow([5,84], 100))

	.finish();

}());