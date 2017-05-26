module.exports = {
    sortCourseKeys:function(courses)
    {
        //Returns array of keys
        return Object.keys(courses).sort(function(a,b){
            return courses[a].sections[0].code - courses[b].sections[0].code;
        })
        //would return object
        /*.reduce(function (result, key) {
            result[key] = obj[key];
            return result;
        }, {})*/; 
    }
}