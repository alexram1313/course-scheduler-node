var request = require('request');
var cheerio = require('cheerio');
var async = require('async');

var sorter = require('./sort');
var courseModel = require('../models/course');
var sectionModel = require('../models/section');
var db = require('./dbmanage')


module.exports = {
    getSOCDropDowns: function (callback) {
        url = 'https://www.reg.uci.edu/perl/WebSoc';

        request(url, function (error, response, html) {
            if (!error) {
                var $ = cheerio.load(html);

                $("option").filter(":contains('Include All Departments')").remove();
                // console.log($('select[name="Dept"]').html());

                callback(
                    {
                        "yearTerm": $('select[name="YearTerm"]').html(),
                        "dept": $('select[name="Dept"]').html()
                    }
                );
            }
        })
    },

    getCourseListingDropDown: function (term, dept, callback) {
        //Check if department is in cache
        db.deptInCache(term, dept, function (result) {
            //If not in cache
            if (!result) {
                url = 'https://www.reg.uci.edu/perl/WebSoc?Submit=Display+XML+Results&YearTerm=' +
                    term + '&Dept=' + encodeURIComponent(dept);

                request(url, function (error, response, html) {
                    if (!error) {

                        // addCourseToCache({code:'2017-92-AC ENG-20A-60-0'}, function(){});

                        var $ = cheerio.load(html);

                        var output = '';

                        var single = $('school').length == 1;
                        var dup_codes = {};

                        $('course').each(function (i, el) {
                            var school = $(this).parent().parent();
                            var school_code = school.attr('school_code');
                            var school_name = school.attr('school_name');

                            var course_num = $(this).attr('course_number');
                            var course_name = $(this).attr('course_title');

                            dup_codes[course_num + '-' + school_code] =
                                dup_codes[course_num + '-' + school_code] + 1 || 0;

                            var key = term + ':' + dept + ':' + course_num + '-' + school_code +
                                '-' + dup_codes[course_num + '-' + school_code];

                            var value = dept + ' ' + course_num + ': ' + course_name +
                                ((single) ? '' : ' (' + school_name + ')');

                            var course_object = courseModel.createCourse(key, value, []);

                            var sec_length = $(this).find('section').length;

                            //Create courses and insert into cache here async
                            $(this).find('section').each(function (i_s, el_s) {
                                async.setImmediate(function (section, i, el, len) {
                                    // console.log(section.find('course_code').text());
                                    var days = section.find('sec_days').text();
                                    var section_object = sectionModel.createSection(
                                        section.find('secType').text(),
                                        section.find('course_code').text(),
                                        {
                                            m: (days.indexOf("M") !== -1),
                                            tu: (days.indexOf("Tu") !== -1),
                                            w: (days.indexOf("W") !== -1),
                                            th: (days.indexOf("Th") !== -1),
                                            f: (days.indexOf("F") !== -1)
                                        },
                                        '',
                                        '',
                                        ((section.find('sec_backward_ptr').text() != '00000') ? [section.find('sec_backward_ptr').text()] : [])
                                    );
                                    course_object.sections.push(section_object);
                                    if (course_object.sections.length == len) {
                                        addCourseToCache(course_object, function () { });
                                    }
                                }, $(this), i_s, el_s, sec_length);
                            });

                            output += '<option value="' + key + '">' + value + "</option>"
                            // console.log(key);

                        });

                        callback(
                            {
                                "data": output
                            }
                        );
                    }
                });
            }
            //if in cache, result: courses object
            else {
                //Order the keys by the first course section code
                var keyOrder = sorter.sortCourseKeys(result);
                var lenKeys = keyOrder.length;

                //iterate through keys to create <select> options
                var output = '';
                for (var i = 0; i < lenKeys; ++i) {
                    output += '<option value="' + result[keyOrder[i]].code + '">' +
                        result[keyOrder[i]].name + "</option>";
                }
                //Callback with options
                callback(
                    {
                        "data": output
                    }
                );
            }
        });


    }
}