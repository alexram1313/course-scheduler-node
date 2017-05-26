//secType = lec, dis, lab, tap, sem, etc.
//code    = e.g., 36040
//days    = [mwf], [tu th], etc.
//times   : use iso 8601 strings
//coreqs  = e.g., [36040, 30403,...]

function createSection(secType, code, days, startTime, endTime, coreqs){
    return {
        "type": 'section',
        "secType": secType,
        "code": code,
        "startTime": startTime,
        "endTime": endTime,
        "coreqs": coreqs
    };
}

module.exports = createSection;