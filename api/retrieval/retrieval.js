var request = require('request');
var cheerio = require('cheerio');
var async = require('async');

var sorter = require('../../util/sort');
var courseModel = require('../models/course');
var sectionModel = require('../models/section');
var db = require('../../util/dbmanage')


module.exports = {
    getSOCYearTermDept: function (callback, asHTMLOptions = true) {
        url = 'https://www.reg.uci.edu/perl/WebSoc';

        request(url, function (error, response, html) {
            if (!error) {
                var $ = cheerio.load(html);

                $("option").filter(":contains('Include All Departments')").remove();
                
                if (asHTMLOptions) {
                    callback(
                        {
                            "yearTerm": $('select[name="YearTerm"]').html(),
                            "dept": $('select[name="Dept"]').html()
                        }
                    );
                }
                else {
                    var yearTerms = [];
                    var depts     = [];

                    $('select[name="YearTerm"]').find('option').each(function(i, el){
                        yearTerms.push({
                            id: $(this).attr('value'),
                            name: $(this).text()
                        })
                    });
                    $('select[name="Dept"]').find('option').each(function(i, el){
                        depts.push({
                            id: $(this).attr('value'),
                            name: $(this).text()
                        })
                    });
                    callback(
                        {
                            "yearTerm": yearTerms,
                            "dept": depts
                        }
                    );
                    
                }
            }
        })
    },
    
    getCourseListingByYearTermDept: function (term, dept, callback, asHTMLOptions=true) {
        //Check if department is in cache
        db.deptInCache(term, dept, function (result) {
            //If not in cache
            var output = (asHTMLOptions)?'':[];
            if (!result) {
                url = 'https://www.reg.uci.edu/perl/WebSoc?Submit=Display+XML+Results&YearTerm=' +
                    term + '&Dept=' + encodeURIComponent(dept);

                request(url, function (error, response, html) {
                    if (!error) {

                        var $ = cheerio.load(html);

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
                                        db.addCourseToCache(course_object, function () { });
                                    }
                                }, $(this), i_s, el_s, sec_length);
                            });

                            if (asHTMLOptions)
                                output += '<option value="' + key + '">' + value + "</option>"
                            else
                                output.push({id: key, name:value})

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

                if (asHTMLOptions)
                    //iterate through keys to create <select> options
                    for (var i = 0; i < lenKeys; ++i) {
                        output += '<option value="' + result[keyOrder[i]].code + '">' +
                            result[keyOrder[i]].name + "</option>";
                    }
                else
                    for (var i = 0; i < lenKeys; ++i) {
                        output.push({id:result[keyOrder[i]].code, name:result[keyOrder[i]].name});
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