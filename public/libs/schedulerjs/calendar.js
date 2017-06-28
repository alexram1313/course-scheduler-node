var schedules     = [];

var selectedLeft  = 0;
var selectedRight = 0;
var schedMax      = 0;

var clickable     = true;

function resetScheduleViews(){
    selectedLeft  = 0;
    selectedRight = 0;
    $(".fc-clear").html("");
    $("#calendar").fullCalendar('removeEvents');
    $("#calendar").fullCalendar('gotoDate', '2017-01-02');
    $("#calendar-right").fullCalendar('removeEvents');
    $("#calendar-right").fullCalendar('gotoDate', '2017-01-02');
}

function setScheduleView(calChoice, prevNext){
    var calDiv = "";
    var txtDiv = "";
    var btnPath = "";

    if (calChoice == 'left'){
        calDiv = "#calendar";
        txtDiv = "#calendar div.fc-toolbar div.fc-clear";
        btnPath = "#calendar div.fc-toolbar div.fc-right div.fc-button-group";
        if (prevNext == -1) {
            selectedLeft = (selectedLeft == 0) ? schedMax - 1 : selectedLeft - 1;
        }
        else if (prevNext == 1) {
            selectedLeft = (selectedLeft == schedMax - 1) ? 0 : selectedLeft + 1;
        }
        if (schedMax == 0 && selectedLeft != 0)
            selectedLeft = 0;

    } else if (calChoice == 'right') {
        calDiv = "#calendar-right";
        txtDiv = "#calendar-right div.fc-toolbar div.fc-clear";
        btnPath = "#calendar-right div.fc-toolbar div.fc-right div.fc-button-group";
        if (prevNext == -1) {
            selectedRight = (selectedRight == 0) ? schedMax - 1 : selectedRight - 1;
        }
        else if (prevNext == 1) {
            selectedRight = (selectedRight == schedMax - 1) ? 0 : selectedRight + 1;
        }
        if (schedMax == 0 && selectedRight != 0)
            selectedRight = 0;
    } else return;

    $(btnPath + ' .fc-prev-button').addClass('fc-state-disabled');
    $(btnPath + ' .fc-next-button').addClass('fc-state-disabled');
    $(btnPath + ' .fc-prev-button').prop("disabled", true);
    $(btnPath + ' .fc-next-button').prop("disabled", true);
    clickable = false;

    if (schedules.length > 0){

        var events = [];
        var codesString = "Schedule: ";
        var listString = "<ul>";

        //Do magic here
        const refDate = '2017-01-02 ';
        format  = "YYYY-MM-DD H:m";
        const refDays = ['M', 'Tu', 'W', 'Th', 'F']
        const index   = (calChoice == 'right') ? selectedRight : selectedLeft;

        var createEvent = function(courseName, secType, code, start, end, day){
            var name = "("+code+") "+courseName.substr(0, courseName.indexOf(":"))+" "+secType;
            var start = moment(refDate+start, format);
            start.add(refDays.indexOf(day), 'days');
            var end = moment(refDate+end, format);
            end.add(refDays.indexOf(day), 'days');

            return [{
                title: name,
                start: start.format(),
                end: end.format()
            }, start.format("h:mm a"), end.format("h:mm a")]
        }
        for (var section of schedules[index]){
            codesString += section.code + ',';
            secDays = section.days.split(/(?=[A-Z])/);
            listStr = '';
            for (day of secDays){
                event = createEvent(section.courseName, section.secType, section.code, section.startTime, section.endTime, day);
                events.push(event[0]);
                if (listStr === ''){
                    listStr = "<li>"+section.code +": "+ section.courseName + 
                            " " + section.secType +": "+ section.days+" "+
                            event[1]+"-"+event[2]+"</li>";
                }
            }
            if (listStr === ''){
                listStr = "<li>"+section.code +": "+ section.courseName + 
                            " " + section.secType +": TBA</li>";
            }
            listString+=listStr;
        }

        listString+="</ul>";
        var outputString = codesString.substr(0, codesString.length-1)+"<br/>"+listString;


        $(calDiv).fullCalendar('addEventSource', events);
        $(txtDiv).html(outputString);
        $(btnPath + ' .fc-prev-button').removeClass('fc-state-disabled');
        $(btnPath + ' .fc-next-button').removeClass('fc-state-disabled');
        $(btnPath + ' .fc-prev-button').prop("disabled", false);
        $(btnPath + ' .fc-next-button').prop("disabled", false);
        clickable = true;
    } else{
        $(".fc-clear").html("<span style='color:red;'>No possible schedules.</span>");
    }
    $('html,body').animate({
                scrollTop: $("#schedules").offset().top
            },
                'slow');
}

function fetchSchedules(courseCodes, prefs, callback){
    $(document).ready(function(){
        resetScheduleViews();
        clickable = false;
        $(".fc-prev-button").prop("disabled", true);
        $(".fc-prev-button").addClass("fc-state-disabled");
        $(".fc-next-button").prop("disabled", true);
        $(".fc-next-button").addClass("fc-state-disabled");
        $(".fc-clear").html('Loading schedules...');

        $.ajax({
            type: "GET",
            contentType: "application/json; charset=utf-8",
            url: "api/scheduling",
            dataType: "json",
            data: { courses: JSON.stringify(courseCodes), prefs: JSON.stringify(prefs) },
            success: function (data) {
                schedules = data.data;
                console.log(data);
                schedMax = schedules.length;
                setScheduleView('left', 0);
                setScheduleView('right', 1);
                $(".fc-prev-button").prop("disabled", false);
                $(".fc-prev-button").removeClass('fc-state-disabled');
                $(".fc-next-button").prop("disabled", false);
                $(".fc-next-button").removeClass('fc-state-disabled');
                callback(data);
            },
            error: function (err){
                $(".fc-clear").html('An error occured. Please try again.');
            }
        })

    });
}