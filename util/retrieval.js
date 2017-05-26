var request = require('request');
var cheerio = require('cheerio');
var moment = require('moment');
var fs = require('fs');

function resetCache(now){
    now.add(1, 'day');
    fs.writeFile('./coursecache.json','{ "updatetime":"'+now.format()+'","courses":{} }');
}

function courseInCache(course_code, callback){
    fs.readFile('./coursecache.json', function(err, data){
        var jsonData = JSON.parse(data);

        var result = false;

        var now = moment();

        if (now.diff(moment(jsonData.updatetime, moment.ISO_8601)) >= 0){
            resetCache(now);
            callback(false);
        }
        else
        {
            var tokens = course_code.split('-');

            try{
                var term   = tokens[0]+'-'+tokens[1];
                var dept   = tokens[2];
                var num    = tokens[3]+'-'+tokens[4]+'-'+tokens[5];

                if (jsonData.courses.hasOwnProperty(term))
                   if (jsonData.courses[term].hasOwnProperty(dept))
                        if (jsonData.courses[term][dept].hasOwnProperty(num))
                                        result = jsonData.courses[term][dept][num];
                callback(result);
                
            }catch(err){
                callback(false);
            }
        }

    });
}

function deptInCache(term, dept, callback){
    fs.readFile('./coursecache.json', function(err, data){
        var jsonData = JSON.parse(data);

        var result = false;

        var now = moment();

        if (now.diff(moment(jsonData.updatetime, moment.ISO_8601)) >= 0){
            resetCache(now);
            callback(false);
        }
        else
        {
            if (jsonData.courses.hasOwnProperty(term))
                if (jsonData.courses[term].hasOwnProperty(dept))
                    result = jsonData.courses[term][dept];
            callback(result);
                
        }
    });
}

function addCourseToCache(course, callback){
    var code = course.code;

    var tokens = code.split('-');

    try{
        var term   = tokens[0]+'-'+tokens[1];
        var dept   = tokens[2];
        var num    = tokens[3]+'-'+tokens[4]+'-'+tokens[5];

        fs.readFile('./coursecache.json', function(err, data){
            if (!err){
                var jsonData = JSON.parse(data);
                
                if (!jsonData.courses.hasOwnProperty(term))
                    jsonData.courses[term] = {[dept]:{[num]:{}}};
                else if (!jsonData.courses[term].hasOwnProperty(dept))
                    jsonData.courses[term][dept] = {[num]:{}};
                

                jsonData.courses[term][dept][num] = course;

                fs.writeFile('./coursecache.json',JSON.stringify(jsonData));
                callback("OK");
            }
            else callback(err);
        });

    }catch(err){
        callback(err);
    }

}



module.exports = {

    getSOCDropDowns: function(callback){
        url = 'https://www.reg.uci.edu/perl/WebSoc';
        
        request(url, function(error, response, html){
            if (!error){
                var $ = cheerio.load(html);

                $("option").filter(":contains('Include All Departments')").remove();
                // console.log($('select[name="Dept"]').html());

                callback(
                    {
                        "yearTerm":$('select[name="YearTerm"]').html(),
                        "dept":$('select[name="Dept"]').html()
                    }
                );
            }
        })
    },

    getCourseListingDropDown: function(term, dept, callback){
        url = 'https://www.reg.uci.edu/perl/WebSoc?Submit=Display+XML+Results&YearTerm='+
            term+'&Dept='+encodeURIComponent(dept);

        request(url, function(error, response, html){
            if (!error){

                // addCourseToCache({code:'2017-92-AC ENG-20A-60-0'}, function(){});

                var $ = cheerio.load(html);

                var output='';

                var single = $('school').length == 1;
                var dup_codes = {};

                $('course').each(function(i, el){
                    var school =  $(this).parent().parent();
                    var school_code = school.attr('school_code');
                    var school_name = school.attr('school_name');

                    var course_num =  $(this).attr('course_number');
                    var course_name = $(this).attr('course_title');

                    dup_codes[course_num+'-'+school_code] =
                         dup_codes[course_num+'-'+school_code] + 1 || 0;

                    var key = term+'-'+dept+'-'+course_num+'-'+school_code+
                            '-'+dup_codes[course_num+'-'+school_code];
                    
                    var value = dept+' '+course_num+': '+course_name+
                        ((single)?'': ' ('+school_name+')');

                    output += '<option value="'+key+ '">' + value+"</option>"
                    console.log(key);

                });

                callback(
                    {
                        "data":output
                    }
                );
            }
        });
    }


}