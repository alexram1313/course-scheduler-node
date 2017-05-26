function createCourse(code, name, sections){
    return {
        "type": 'course',
        "code": code,
        "name": name,
        "sections": sections
        //Insert Course "class" properties here.
    };
}

module.exports = createCourse;