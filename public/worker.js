// Constants
GENERATE = 1;
FILTER = 2;
FINISHED_GENERATING = 3;
FINISHED_FILTERING = 4;

Array.prototype.remove = function (from, to) {
    var rest = this.slice((to || from) + 1 || this.length);
    this.length = from < 0 ? this.length + from : from;
    return this.push.apply(this, rest);
};

function Iterator(l) {
    this.index = 0;
    this.list = l;
}
Iterator.prototype.next = function () {
    return this.list[this.index++];
};
Iterator.prototype.not_finished = function () {
    return (this.index < this.list.length);
};

function is_banned_hour(day, hour) {
    if (selected_subjects.banned_hours === undefined) return false;
    if (selected_subjects.banned_hours[day] !== undefined) {
        var banned_hours = selected_subjects.banned_hours[day];
        if (banned_hours.indexOf(hour) != -1) return true;
        return false;
    }
    return false;
}

function hour_weight(hour) {
    switch (hour) {
        case 6:
            return 100;
        case 7:
            return 66;
        case 8:
            return 33;
        case 9:
            return 0;
        case 10:
            return 33;
        case 11:
            return 66;
        case 12:
            return 100;
        case 13:
            return 100;
        case 14:
            return 0;
        case 15:
            return 20;
        case 16:
            return 40;
        case 17:
            return 60;
        case 18:
            return 80;
        case 19:
            return 100;
    }
}

////////////////////////////////////////////////////////////////////////////////
// Functions related to course instances
function course_weight(course) {
    var weight = 0,
        hour, hours, day, it;
    for (day in course.schedule) {
        hours = course.schedule[day];
        it = new Iterator(hours);
        while (it.not_finished()) {
            hour = it.next();
            weight = weight + hour_weight(hour);
        }
    }
    return weight;
}

function schedule_weight(schedule){
    var weight = 0;
    var course_iterator = new Iterator(schedule);
    while(course_iterator.not_finished()){
        weight = weight + course_weight(course_iterator.next());
    }
    return weight;
}

function sort_schedules(){
    generated_schedules.sort(function(a, b){return schedule_weight(a)-schedule_weight(b)});
}

function course_conflict(course, other) {
    var conflict = false,
        day, it, hour;
    for (day in course.schedule) {
        if (other.schedule[day] !== undefined) {
            it = new Iterator(course.schedule[day]);
            while (it.not_finished()) {
                hour = it.next();
                if (other.schedule[day].indexOf(hour) != -1) conflict = true;
            }
        }
    }
    return conflict;
}

function subject_codes() {
    var codes = [];
    var patt = new RegExp("[a-zA-Z]{3}[0-9]{4}");
    for (var code in selected_subjects){
        var res = patt.test(code);
        if(res)
            codes.push(code);
    }
    return codes;
}

function generate(subject_codes, level, schedule) {
    if (level < subject_codes.length) {
        var subject_code = subject_codes[level];
        var courses = selected_subjects[subject_code].courses;
        var it = new Iterator(courses);

        while (it.not_finished()) {
            var course = it.next();
            var add = true;
            var course_it = new Iterator(schedule);
            while (course_it.not_finished()) {
                var schedule_course = course_it.next();
                if (course_conflict(course, schedule_course)) add = false;
            }
            if (add) {
                var new_schedule = schedule.slice(0, schedule.length);
                new_schedule.push(course);
                generate(subject_codes, level + 1, new_schedule);
            }
        }
    } else {
        if (schedule.length > 0 && schedule.length == subject_codes.length) {
            generated_schedules.push(schedule);
        }
    }
}

filtered_generated_schedules = [];

function filter_generated_schedules(generated_schedules) {
    filtered_generated_schedules = [];
    var schedule_iterator = new Iterator(generated_schedules);
    while (schedule_iterator.not_finished()) {
        var schedule = schedule_iterator.next();
        var course_iterator = new Iterator(schedule);

        var add = true;
        while (course_iterator.not_finished()) {
            var course = course_iterator.next();

            //Filter by teacher
            if (selected_subjects[course.mat].banned_teachers !== undefined) {
                var subject_banned_teachers = selected_subjects[course.mat].banned_teachers;
                if (subject_banned_teachers.indexOf(course.lecture_teachers) != -1) add = false;
            }
        }
        if (add) {
            // Fiter by banned hour
            course_iterator = new Iterator(schedule);
            while (course_iterator.not_finished()) {
                course = course_iterator.next();
                for (var day in course.schedule) {
                    var hours = course.schedule[day];
                    var hour_iterator = new Iterator(hours);
                    while (hour_iterator.not_finished()) {
                        var hour = hour_iterator.next();
                        if (is_banned_hour(day, String(hour)))
                            add = false;
                    }
                }
            }
        }
        if (add) filtered_generated_schedules.push(schedule); 
    }
}

var selected_subjects, filtered_generated_schedules;
self.addEventListener('message', function (event) {
    selected_subjects = event.data.selected_subjects;
    switch (event.data.command) {
        case GENERATE:
            generated_schedules = [];
            generate(subject_codes(), 0, []);
            sort_schedules();
            self.postMessage({
                command: FINISHED_GENERATING,
                generated_schedules: generated_schedules
            });
            break;
        case FILTER:
            generated_schedules = event.data.generated_schedules;
            filter_generated_schedules(generated_schedules);
            self.postMessage({
                command: FINISHED_FILTERING,
                filtered_generated_schedules: filtered_generated_schedules
            });
            break;
    }
}, false);
