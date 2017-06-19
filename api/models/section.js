//secType = lec, dis, lab, tap, sem, etc.
//code    = e.g., 36040
//days    = 'MTuWThF
//times   : use iso 8601 strings
//coreqs  = e.g., [36040, 30403,...]

module.exports = {

    createSection: function (secType, code, days, startTime, endTime, coreqs){
        return {
            "type": 'section',
            "secType": secType,
            "code": code,
            "days":days,
            "startTime": startTime,
            "endTime": endTime,
            "coreqs": coreqs
        };
    }
}