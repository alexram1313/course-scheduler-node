var request = require('request');
var cheerio = require('cheerio');
var async = require('async');
var moment = require('moment');

var sorter = require('../../util/sort');
var courseModel = require('../models/course');
var sectionModel = require('../models/section');
var db = require('../../util/dbmanage')

function courseTimes(listedTimes){
    listedTimes = listedTimes.trim();
    if ((listedTimes === 'TBA') || (listedTimes==='')){
        return {start:'', end:''};
    }
    var times = listedTimes.split('-');
    var start = times[0];
    var end   = times[1];

    var suffix_ind = end.indexOf('p');

    if (suffix_ind > -1){
        end = end.substr(0, suffix_ind);

        var endComp = end.split(':');
        var endHour = parseInt(endComp[0]);
        
        if (endHour < 12) endHour += 12;

        var startComp = start.split(':');
        var startHour = parseInt(startComp[0]);

        if (endHour-startHour >= 12) startHour += 12;

        return {
            start: startHour+":"+startComp[1],
            end:   endHour+":"+endComp[1]
        };

    }
    else {
        var am_index = end.indexOf('a')
        if (am_index >= 0){
            return {start:start, end:end.substr(0, am_index)};
        }
        else{
            return {start:start, end:end.trim()}
        }
    }
}


function generateCourse($, courseXML, id, name, callback){
    var course_object = courseModel.createCourse(id, name, []);
    var sec_length = courseXML.find('section').length;

    if (sec_length == 0) callback(false);
    
    courseXML.find('section').each(function (i_s, el_s) {
            async.setImmediate(function (section, i, el, len) {
                var type = section.find('sec_type').text();
                var times = courseTimes(section.find('sec_time').text());
                var getCoreqs = function() {
                    var coreqs = [];
                    var back = section.find('sec_group_backward_ptr').text();
                    // var fwd  = section.find('sec_group_forward_ptr').text();
                    if (back != '00000') coreqs.push(back);
                    // if (fwd  != '00000') coreqs.push(fwd);
                    return coreqs;
                };
                var section_object = sectionModel.createSection(
                    type, 
                    name,
                    section.find('course_code').text(),
                    section.find('sec_days').text(),
                    times.start, 
                    times.end,
                    getCoreqs()
                );

                if (section.find('sec_final').length > 0){
                    var sec_final_date = section.find('sec_final_date').text();
                    if (sec_final_date != "TBA"){
                        var finalTimes = courseTimes(section.find('sec_final_time').text());
                        var year = id.split('-')[0];

                        var sec_final_date = moment(sec_final_date+ ' ' + year + ' ' + finalTimes.start,
                                            'MMM D YYYY H:mm').format();
                    }
                    else sec_final_date = "";
                    section_object.final = {
                        date: sec_final_date
                    };
                }
                
                course_object.sections.push(section_object);
                if (course_object.sections.length == len) {
                    callback(course_object);
                }
            }, $(this), i_s, el_s, sec_length);
    });
}

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
                url = 'https://www.reg.uci.edu/perl/WebSoc?Submit=Display+XML+Results&ShowFinals=1&YearTerm=' +
                    term + '&Dept=' + encodeURIComponent(dept);

                request(url, function (error, response, html) {
                    if (!error) {

                        var $ = cheerio.load(html);

                        var single = $('school').length == 1;
                        var dup_codes = {};

                        var courses = [];

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

                            
                            generateCourse($, $(this), key,  value, function(course_object){
                                courses.push(course_object);
                            })

                            async.setImmediate(function(term, dept,courses){
                                db.addDeptToCache(term, dept, courses, function(derp){});
                            }, term, dept, courses);

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


    },
    
    getSingleCourseByCode:function(course_code, callback){
        db.courseInCache(course_code, function(result){
            if (!result){
                var tokens = course_code.split(':');
                var yearTerm = tokens[0];
                var dept     = tokens[1];
                
                var moretokens = tokens[2].split('-');
                var number   = moretokens[0];
                var school   = moretokens[1];
                var index    = moretokens[2];

                var url = 'https://www.reg.uci.edu/perl/WebSoc?Submit=Display+XML+Results&ShowFinals=1&YearTerm=' +
                    encodeURIComponent(yearTerm) + '&Dept=' + encodeURIComponent(dept) +
                    '&CourseNum=' + encodeURIComponent(number);

                request(url, function(err, response, html){
                    if (!err) {

                        var $ = cheerio.load(html);

                        var courseXML = $('school[school_code='+school+']').find('course[course_number='+number+']').eq(index);

                        generateCourse($, courseXML, course_code, courseXML.attr('course_title'), callback);
                        
                    }
                });

                
            }
            else {
                callback(result);
            }
        })
    }
}