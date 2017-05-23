var request = require('request');
var cheerio = require('cheerio');
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
                var $ = cheerio.load(html);

                var output='';

                var single = $('school').length == 1;

                $('course').each(function(i, el){
                    var school =  $(this).parent().parent();
                    var school_code = school.attr('school_code');
                    var school_name = school.attr('school_name');

                    var course_num =  $(this).attr('course_number');
                    var course_name = $(this).attr('course_title');


                    var key = year_term+'-'+dept+'-'+course_num+'-'+school_code;
                    var value = dept+' '+course_num+': '+course_name+
                        ((single)?'': '('+school_name+')');

                    output += "<option value="+key+ ">" + value+"</option>"

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