module.exports = function(){
	var bitsPerSlot = 32; // universal constant

	function makeArray(slots) {
		// sizing: bytes = bits / bitsPerByte
		return new Uint32Array(new ArrayBuffer( slots * bitsPerSlot / 8 ));
	}


	/// A square matrix of side length size, representing true/false values efficiently
	function BitMatrix(size) {

		/// Private members

		var slotsPerRow = Math.ceil(size / bitsPerSlot);
		var array       = makeArray(size * slotsPerRow);

		/// Private helpers

		// returns the index of array that row/column falls in
		function slot(row, column) {
			return (slotsPerRow * row) + Math.floor(column / bitsPerSlot);
		}
		// returns the index of column within the slot
		function offset(column) {
			return column % bitsPerSlot;
		}

		/// Public methods

		// "or's" the bit in (row, column) with the natural boolean of value
		this.orBit = function(row, column, value) {
			array[ slot(row, column) ] |= (value ? 1 : 0) << offset(column);
			return this;
		}

		// "or's" an entire Row with a row in this BitMatrix
		this.orRow = function(rowIndex, row) {
			var rowStartSlot = slotsPerRow * rowIndex;
			var rawRow = row._getRaw();
			for (var slot = 0; slot < slotsPerRow; ++slot) {
				array[ rowStartSlot + slot ] |= rawRow[ slot ];
			}
			return this;
		}

		// "or's" every column with its corresponding row, making a symmetric matrix
		this.orSymmetric = function() {
			for (var i = 0; i < size; ++i) {
				for (var j = i + 1; j < size; ++j) {
					this.orBit(i, j, this.get(j, i));
					this.orBit(j, i, this.get(i, j));
				}
			}
			return this;
		}

		// returns the value in (row, column)
		this.get = function(row, column) {
			// get the slot, shift appropriate bit to 1's position, and mask other bits away
			return ( array[ slot(row, column) ] >> offset(column) ) & 1;
		}

		// multiplies a given row vector by this BitMatrix
		this.multiply = function(row) {
			var rawRow = row._getRaw();
			var output = new this.Row();
			var temp   = 0;
			for (var i = 0; i < size; ++i) {
				temp = 0;
				rowStartSlot = i * slotsPerRow;
				for (var j = 0; j < slotsPerRow; ++j) {
					temp |= (array[ rowStartSlot + j ] & rawRow[j]);
				}
				output.orBit(i, temp);
			}
			return output;
		}

		this.Row = function() {
			var array = makeArray(slotsPerRow);

			function slot(index) {
				return Math.floor(index / bitsPerSlot);
			}

			function offset(index) {
				return index % bitsPerSlot;
			}

			this.orBit = function(index, value) {
				array[ slot(index) ] |= (value ? 1 : 0) << offset(index);
				return this;
			}

			this.orRow = function(row) {
				var rawRow = row._getRaw();
				for (var i = 0; i < slotsPerRow; ++i) {
					array[i] |= rawRow[i];
				}
				return this;
			}

			this.andRow = function(row) {
				var rawRow = row._getRaw();
				for (var i = 0; i < slotsPerRow; ++i) {
					array[i] &= rawRow[i];
				}
				return this;
			}

			this.invert = function() {
				for (var i = 0; i < slotsPerRow; ++i) {
					array[i] = ~array[i];
				}
				return this;
			}

			this.get = function(index) {
				return ( array[ slot(index) ] >> offset(index) ) & 1;
			}

			this.size = function() {
				return size;
			}

			this.isZero = function() {
				for (var i = 0; i < slotsPerRow; ++i) {
					if (array[i]) { // != 0
						return 0;
					}
				}
				return 1;
			}

			this.copy = function() {
				var output = new Row();
				var outputRaw = output._getRaw();
				for (var i = 0; i < slotsPerRow; ++i) {
					outputRaw[i] = array[i];
				}
				return output;
			}

			this.reset = function() {
				for (var i = 0; i < slotsPerRow; ++i) {
					array[i] = 0;
				}
				return this;
			}

			this._getRaw = function() {
				return array;
			}
		}

		var Row = this.Row; // allows Row to access it's own constructor.
	}

	return {
		'BitMatrix': BitMatrix
	};
}();