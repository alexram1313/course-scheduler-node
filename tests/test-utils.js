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
 *   .test('Addition', 3 + 4)
 *   .equals(7)
 *
 *   .test('Summation', function() {
 *       total = 0;
 *       for (int i = 0; i < 100; i++) total += i;
 *       return total;
 *   })
 *   .returns(5050)
 *
 *   .test('Hard Stuff', function() {
 * 	     // does hard stuff
 *   })
 *   .returnsSameAs(function() {
 *       // computes answer another way
 *   })
 *
 *   .finish()
 */

module.exports = function() {

	function TestModule(name, quiet = true) {
		if (!quiet) console.log("--- "+name+" START ---");

		var testNumber = 0;
		var totalTests = 0;
		var passed     = 0;

		function TestExpectation(testValue, testName, testNumber, testModule) {
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
				return ""+(testName === undefined ? "Test "+testNumber : testName)+
				" expected "+trunc(JSON.stringify(computedValue),20)+" "+
				testPhrase+" "+trunc(JSON.stringify(assertValue),20);
			}

			function pass(msg) {
				passed++;
				if (!quiet) {
					console.log("PASSED: "+msg);
				}
			}

			function fail(msg) {
				console.log("FAILED: "+msg);
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

			this.equals = function(assertValue) {
				return stdTest(robustEquals(testValue, assertValue), stdMsg(testValue, "to equal", assertValue));
			}

			this.equalsUnordered = function(assertValue) {
				return stdTest(robustEquals(testValue, assertValue, true), stdMsg(testValue, "to equal (unordered)", assertValue));
			}

			this.returns = function(assertValue) {
				compValue = testValue();
				return stdTest(robustEquals(compValue, assertValue), stdMsg(compValue, "to equal", assertValue));
			}

			this.returnsUnordered = function(assertValue) {
				compValue = testValue();
				return stdTest(robustEquals(compValue, assertValue, true), stdMsg(compValue, "to equal (unordered)", assertValue));
			}

			this.returnsSameAs = function(assertFunction) {
				compTestValue   = testValue();
				compAssertValue = assertFunction();
				return stdTest(robustEquals(compTestValue, compAssertValue), stdMsg(compTestValue, "to equal", compAssertValue));
			}

			this.returnsSameAsUnordered = function(assertValue) {
				compTestValue   = testValue();
				compAssertValue = assertFunction();
				return stdTest(robustEquals(compTestValue, compAssertValue, true), stdMsg(compTestValue, "to equal (unordered)", compAssertValue));
			}
		}

		// Usage: test(value) - use numbered test
		//        test(name, value) - use named test
		this.test = function(testName, testValue) {
			if (testValue === undefined) {
				testValue = testName;
				testName  = undefined;
			}
			totalTests++;
			return new TestExpectation(testValue, testName, testNumber++, this);
		}

		this.finish = function() {
			console.log(""+passed+"/"+totalTests+" tests passed ( "+(100*passed/totalTests).toFixed(1)+"% )");
			console.log("--- "+name+" "+(passed === totalTests ? "PASSED" : "FAILED")+" ---");
		}
	}

	return {
		"TestModule": TestModule
	};
}();