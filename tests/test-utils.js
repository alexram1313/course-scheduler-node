/**
 * How to use this regression testing module:
 * Create one file per test suite. A test suite should
 * fully exercise some related set of functions. One test suite
 * per file is generally appropriate.
 *
 * In each test suite, create a test module for each self-contained
 * unit of functionality. One per class is generally appropriate.
 *
 * In a test module, chain together individual tests, and terminate
 * the chain with a call to .finish().
 *
 * Example:
 * 
 * new TestModule('Basic Math')
 *   .test('Addition', function(){
 *       return 3 + 4;
 *   })
 *   .equals(7)
 *
 *   .test('Summation', function() {
 *       total = 0;
 *       for (int i = 0; i < 100; i++) total += i;
 *       return total;
 *   })
 *   .equals(5050)
 *
 *   .test('Hard Stuff', function() {
 * 	     // does hard stuff
 *   })
 *   .equals(function() {
 *       // computes answer another way
 *   }())
 *
 *   .finish()
 *
 * Inserting calls to .disable() and .enable() will start and stop
 * skipping tests. A module passes only if all of its tests pass.
 * If all its executed tests pass, but some tests were skipped,
 * it is considered "INCOMPLETE".
 *
 * testStub provides a way to stub out all the tests that need
 * to be written. Any module that has a testStub will register
 * as having "skipped" tests
 */

module.exports = function() {


	function TestModule(name) {
		var totalTests = 0;
		var passed     = 0;
		var skipped    = 0;
		var quiet      = true;
		var disabled   = false;

		function TestExpectation(testValue, testName, testModule) {
			function trunc(str, length) {
				str = "" + str;
				if (str.length > length) {
					return str.slice(0,length - 3) + "...";
				} else {
					return str;
				}
			}

			// Takes the assertion value and an English, infinitve phrase describing the test condition
			function stdMsg(computedValue, testPhrase, assertValue) {
				return "Test "+testName+
					"\n expected "+trunc(JSON.stringify(computedValue),50)+"\n "+
					testPhrase+(assertValue !== undefined ? " "+trunc(JSON.stringify(assertValue),50) : "");
			}

			function pass(msg) {
				passed++;
				if (!quiet) {
					console.log("PASS: "+msg);
				}
			}

			function fail(msg) {
				console.log("FAIL: "+msg);
			}

			function stdTest(condition, msg) {
				if (condition) {
					pass(msg);
				} else {
					fail(msg);
				}
				return testModule; // for chaining
			}

			function robustEquals(a, b, unordered) {
				var output;
				if (Array.isArray(a) && Array.isArray(b)) {
					if (a.length === b.length) {
						if (unordered) {
							var unusedIndices = [];
							for (var i = 0; i < a.length; i++) {
								unusedIndices.push(i);
							}

							for (var i = 0; i < a.length; i++) {
								for (var j = 0; j < unusedIndices.length; j++) {
									if (robustEquals(a[i], b[unusedIndices[j]], unordered)) {
										unusedIndices.splice(j,1);
										break;
									}
								}
							}
							output = (unusedIndices.length === 0);

						} else {
							output = true;
							for (var i = 0; i < a.length; i++) {
								if (!robustEquals(a[i], b[i])) {
									output = false;
									break;
								}
							}
						}
					} else {
						output = false;
					}

				} else if (typeof a === 'object' && a !== null &&
					       typeof b === 'object' && b !== null) {
					for (var prop in a) {
						if (!a.hasOwnProperty(prop)) continue;
						if (!robustEquals(a[prop], b[prop])) {
							return false;
						}
					}
					for (var prop in b) {
						if (!b.hasOwnProperty(prop)) continue;
						if (!robustEquals(b[prop], a[prop])) {
							return false;
						}
					}
					return true;

				} else {
					output = (a === b);
				}
				return output;
			}

			this.log = function() {
				console.log('LOG: Test '+testName+':', testValue);
				return this;
			}

			this.equals = function(assertValue) {
				return stdTest(robustEquals(testValue, assertValue), stdMsg(testValue, "to equal", assertValue));
			}

			this.approximates = function(assertValue, epsilon = 0.000001) {
				return stdTest(Math.abs(testValue - assertValue) < epsilon, stdMsg(testValue, "to approximate", assertValue));
			}

			this.equalsUnordered = function(assertValue) {
				return stdTest(robustEquals(testValue, assertValue, true), stdMsg(testValue, "to equal (unordered)", assertValue));
			}

			this.isIn = function(assertValues) {
				var condition = false;
				for (var i = 0; i < assertValues.length; i++) {
					if (robustEquals(testValue, assertValues[i])) {
						condition = true;
						break;
					}
				}
				return stdTest(condition, stdMsg(testValue, "to be in", assertValues));
			}

			this.isGreaterThan = function(assertValue) {
				return stdTest(testValue > assertValue, stdMsg(testValue, "to be greater than", assertValue));
			}

			this.isGreaterThanOrEqualTo = function(assertValue) {
				return stdTest(testValue >= assertValue, stdMsg(testValue, "to be greater than or equal to", assertValue));
			}

			this.isLessThan = function(assertValue) {
				return stdTest(testValue < assertValue, stdMsg(testValue, "to be less than", assertValue));
			}

			this.isLessThanOrEqualTo = function(assertValue) {
				return stdTest(testValue <= assertValue, stdMsg(testValue, "to be less than or equal to", assertValue));
			}

			this.isDefined = function() {
				return stdTest(testValue !== undefined, stdMsg(testValue, "to be defined"));
			}

			this.satisfies = function(predicate) {
				return stdTest(predicate(testValue), stdMsg(testValue, "to satisfy", predicate));
			}
		}

		function PassThroughExpectation(testModule) {
			function intermediate() { return this; }
			function execute() { return testModule; }
			this.returnValue = intermediate;
			this.log = intermediate;
			this.equals = execute;
			this.approximates = execute;
			this.equalsUnordered = execute;
			this.isIn = execute;
			this.isGreaterThan = execute;
			this.isGreaterThanOrEqualTo = execute;
			this.isLessThan = execute;
			this.isLessThanOrEqualTo = execute;
			this.isDefined = execute;
			this.satisfies = execute;
		}

		// Usage: test(value) - use numbered test
		//        test(name, value) - use named test
		this.test = function(testName, testFunction) {
			totalTests++;
			if (testFunction === undefined) {
				// shuffle arguments forward
				testFunction = testName;
				testName     = totalTests.toString();
			}
			if (!disabled) {
				return new TestExpectation(testFunction(), testName, this);
			} else {
				if (!quiet) {
					console.log("SKIP: TEST "+testName);
				}
				skipped++;
				return new PassThroughExpectation(this);
			}
		}

		// Represents a regression test that needs to be written
		this.testStub = function(testName) {
			totalTests++;
			skipped++;
			if (testName === undefined) testName = totalTests;
			if (!quiet) {
				console.log("STUB: Test "+testName);
			}
			return this;
		}

		this.quiet = function() {
			quiet = true;
			return this;
		}

		this.verbose = function() {
			quiet = false;
			return this;
		}

		this.disable = function() {
			disabled = true;
			return this;
		}

		this.enable = function() {
			disabled = false;
			return this;
		}

		this.finish = function() {
			console.log(""+passed+"/"+(totalTests - skipped)+" attempted tests passed ( "+(100*passed/(totalTests - skipped)).toFixed(1)+"% )");
			if (skipped > 0) {
				console.log(""+skipped+"/"+totalTests+" tests skipped ( "+(100*skipped/totalTests).toFixed(1)+"% )");
				status = (skipped + passed === totalTests ? "INCOMPLETE" : "FAILED");
			} else {
				status = (passed === totalTests ? "PASSED" : "FAILED")
			}
			console.log("--- "+name+" "+status+" ---");
		}
	}

	return {
		"TestModule": TestModule
	};
}();