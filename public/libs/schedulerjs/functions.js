var selectedSched = 0;
var selectedSchedRight = 0;
var schedMax = 0;
var clickable = true;

var keepSessionAlive = function () {
    var time = 600000; //10 min delay
    setInterval(
        function () {
            $.post('scheduler/ui/keep_alive.php');
        }, time

    );
};

keepSessionAlive();

function hideAdded() {

    $("#addConfirm").html("");
}

function updateWeight(category) {
    var action = "";
    var weight = "";
    switch (category) {
        case "mornings":
            action = "morning";
            weight = $("#mornings").val().toString();
            break;
        case "evenings":
            action = "evening";
            weight = $("#evenings").val().toString();
            break;
        case "mondays":
            action = "monday";
            weight = $("#mondays").val().toString();
            break;
        case "fridays":
            action = "friday";
            weight = $("#fridays").val().toString();
            break;
        case "balance":
            action = "balance";
            weight = $("#balance").val().toString();
            break;
        case "gaps":
            action = "gaps";
            weight = $("#gaps").val().toString();
            break;
        case "openings":
            action = "openings";
            weight = $("#openings").val().toString();
            break;
        default:
            break;
    }
    $.ajax({
        type: "GET",
        url: "scheduler/ui/coursesretrieval.php",
        data: { _action: 'update' + action, _param: weight },
        success: function (data) {
            console.log(action, ": ", weight);
        }
    });

}

function populateCourses() {
    jQuery(function ($) {
        $(document).ready(function () {
            hideAdded();
            $("#course").prop('disabled', true);
            $("#course").html("<option>Loading</option>");
            $.ajax({
                type: "GET",
                url: "/retrieval/courselistdrop/" + $("#term").val() + "/" +
                    encodeURIComponent($("#dept").val()),
                success: function (data) {
                    $("#course").html(data);
                    $("#course").prop('disabled', false);

                }
            });
        });
    });
}

function populateAddedCourses(str) {
    jQuery(function ($) {
        $(document).ready(function () {
            $("#addedCourses").html("Loading...");
            $("#addConfirm").html("Adding...");
            $.ajax({
                type: "GET",
                url: "scheduler/ui/coursesretrieval.php",
                data: { _action: 'addcourse', _param: str },
                success: function (data) {
                    console.log(data);
                    $("#addedCourses").html(data);
                    $("#addConfirm").html("Added");
                }
            });
        });
    });
}

function delPopCourses(str) {
    jQuery(function ($) {
        $(document).ready(function () {
            hideAdded();
            $.ajax({
                type: "GET",
                url: "scheduler/ui/coursesretrieval.php",
                data: { _action: 'delcourse', _param: str },
                success: function (data) {
                    console.log(data);
                    $("#addedCourses").html(data);

                }

            });
        });
    });
}

function getSchedText(calChoice, prevNext) {
    var div = "";

    if (calChoice == 0) {
        div = "#calendar div.fc-toolbar div.fc-clear";
        if (prevNext == -1) {
            selectedSched = (selectedSched == 0) ? schedMax - 1 : selectedSched - 1;
        }
        else if (prevNext == 1) {
            selectedSched = (selectedSched == schedMax - 1) ? 0 : selectedSched + 1;
        }
        else if (prevNext == -2) {
            selectedSched = 0;
        }
        if (schedMax == 0 && selectedSched != 0)
            selectedSched = 0;
    }
    else if (calChoice == 1) {
        div = "#calendar-right div.fc-toolbar div.fc-clear";
        if (prevNext == -1) {
            selectedSchedRight = (selectedSchedRight == 0) ? schedMax - 1 : selectedSchedRight - 1;
        }
        else if (prevNext == 1) {
            selectedSchedRight = (selectedSchedRight == schedMax - 1) ? 0 : selectedSchedRight + 1;
        }
        else if (prevNext == -2) {
            selectedSchedRight = 0;
        }
        if (schedMax == 0 && selectedSchedRight != 0)
            selectedSchedRight = 0;
    }
    else {
        div = ".fc-clear";
        selectedSched = 0;
        selectedSchedRight = 0;
    }



    return $.ajax({
        type: "GET",
        url: "scheduler/ui/coursesretrieval.php",
        data: { _action: 'schedule', _param: ((calChoice == 1) ? selectedSchedRight : selectedSched).toString() },
        success: function (data) {
            $(div).html(data);
            console.log("Selected:", selectedSched);
            console.log("Max:", schedMax);
            //                                $(".fc-clear").html(data);
            return true;
        }
    });
}

function generateSchedules() {
    jQuery(function ($) {
        $(document).ready(function () {
            $("#calendar").fullCalendar('removeEvents');
            $("#calendar").fullCalendar('gotoDate', '2017-01-02');
            clickable = false;
            $(".fc-prev-button").prop("disabled", true);
            $(".fc-prev-button").addClass("fc-state-disabled");
            //                                       alert('disbled prev');
            $(".fc-next-button").prop("disabled", true);
            $(".fc-next-button").addClass("fc-state-disabled");
            $(".fc-clear").html('Loading schedules...');
            $.when(
                getSchedText(-1, -2)
            ).then(
                $.ajax({
                    type: "GET",
                    contentType: "application/json; charset=utf-8",
                    url: "scheduler/ui/coursesretrieval.php",
                    dataType: "json",
                    data: { _action: 'schedcount', _param: '-1' },
                    success: function (data) {

                        console.log(data);
                        schedMax = parseInt(data);
                        $(".fc-prev-button").prop("disabled", false);
                        $(".fc-prev-button").removeClass('fc-state-disabled');
                        $(".fc-next-button").prop("disabled", false);
                        $(".fc-next-button").removeClass('fc-state-disabled');

                    }

                })

                )
                .done(
                function () {

                    if (schedMax > 1) {
                        getSchedule(0, -2);
                        $.when(getSchedText(1, 1)).then(getSchedule(1, 0));
                    } else {
                        getSchedule(-1, 0);
                    }
                }
                );
            clickable = true;
            $(".fc-prev-button").prop("disabled", false);
            $(".fc-prev-button").removeClass('fc-state-disabled');
            $(".fc-next-button").prop("disabled", false);
            $(".fc-next-button").removeClass('fc-state-disabled');
        });
    });
}

function getSchedule(calChoice, prevNext) {


    var div = "";
    var btnPath = "";

    if (calChoice == 0) {
        div = "#calendar";
        btnPath = "#calendar div.fc-toolbar div.fc-right div.fc-button-group";
        if (prevNext == -1) {
            selectedSched = (selectedSched == 0) ? schedMax - 1 : selectedSched - 1;
        }
        else if (prevNext == 1) {
            selectedSched = (selectedSched == schedMax - 1) ? 0 : selectedSched + 1;
        }
        else if (prevNext == -2) {
            selectedSched = 0;
            selectedSchedRight = 0;
        }
        if (schedMax == 0 && selectedSched != 0)
            selectedSched = 0;
    }
    else if (calChoice == 1) {
        div = "#calendar-right";
        btnPath = "#calendar-right div.fc-toolbar div.fc-right div.fc-button-group";
        if (prevNext == -1) {
            selectedSchedRight = (selectedSchedRight == 0) ? schedMax - 1 : selectedSchedRight - 1;
        }
        else if (prevNext == 1) {
            selectedSchedRight = (selectedSchedRight == schedMax - 1) ? 0 : selectedSchedRight + 1;
        }
        else if (prevNext == -2) {
            selectedSched = 0;
            selectedSchedRight = 0;
        }
        if (schedMax == 0 && selectedSchedRight != 0)
            selectedSchedRight = 0;
    } else {
        selectedSched = 0;
        selectedSchedRight = 0;
    }

    if (div == "") {
        $("#calendar").fullCalendar('removeEvents');
        $("#calendar").fullCalendar('gotoDate', '2017-01-02');
        $("#calendar-right").fullCalendar('removeEvents');
        $("#calendar-right").fullCalendar('gotoDate', '2017-01-02');
    }
    else {
        $(div).fullCalendar('removeEvents');
        $(div).fullCalendar('gotoDate', '2017-01-02');
    }

    return $.ajax({

        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: "scheduler/ui/coursesretrieval.php",
        dataType: "json",
        data: { _action: 'schedview', _param: ((calChoice == 1) ? selectedSchedRight : selectedSched).toString() },
        success: function (data) {

            $('html,body').animate({
                scrollTop: $("#schedules").offset().top
            },
                'slow');
            //                  location.href = "#schedules";
            if (div != "") {
                $(div).fullCalendar('addEventSource', data);
            } else {
                $("#calendar").fullCalendar('addEventSource', data);
                $("#calendar-right").fullCalendar('addEventSource', data);
            }
            console.log("derp");

            $(btnPath + ' .fc-prev-button').removeClass('fc-state-disabled');
            $(btnPath + ' .fc-next-button').removeClass('fc-state-disabled');
            $(btnPath + ' .fc-prev-button').prop("disabled", false);
            $(btnPath + ' .fc-next-button').prop("disabled", false);
            clickable = true;

        }
    }

    );

}
