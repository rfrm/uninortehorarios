UPDATE_COUNT = 0
FINISHED = 1
NEW_SCHEDULE = 2

Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};

function clone(obj){
    if(obj == null || typeof(obj) != 'object')
        return obj;

    var temp = obj.constructor(); // changed

    for(var key in obj)
        temp[key] = clone(obj[key]);
    return temp;
}

function Iterator(l){
	this.index = 0;
	this.list = l;
}
Iterator.prototype.next = function(){
	return this.list[this.index++];
}
Iterator.prototype.not_finished = function(){
	return (this.index < this.list.length);
}

function hour_weight(hour){
	switch(hour){
		case 6: return 100;
		case 7: return 66;
		case 8: return 33;
		case 9: return 0;
		case 10: return 33;
		case 11: return 66;
		case 12: return 100;
		case 13: return 100;
		case 14: return 0;
		case 15: return 20;
		case 16: return 40;
		case 17: return 60;
		case 18: return 80;
		case 19: return 100;
	}
}

function course_weight(course){
	var weight=0, hour, hours, day, it;
	for(day in course.schedule){
		hours = course.schedule[day];
		it = new Iterator(hours);
		while(it.not_finished()){
			hour=it.next()
			weight = weight + hour_weight(hour);
		}
	}
	return weight;
}

function course_conflict(course, other) {
	var conflict=false, day, it, hour;
	for(day in course.schedule){
		if(other.schedule[day] != undefined){
			it = new Iterator(course.schedule[day]);
			while(it.not_finished()){
				hour=it.next();
				if(other.schedule[day].indexOf(hour)!=-1)
					conflict = true;
			}
		}
	}
	return conflict;
}

function subject_codes(){
	var codes=[];
	for(code in selected_subjects)
		codes.push(code);
	return codes
}

count = 0;
function generate(subject_codes, level, schedule){
	if(level < subject_codes.length){
		var subject_code = subject_codes[level];
		var courses = selected_subjects[subject_code].courses;
		var it = new Iterator(courses);

		while(it.not_finished()){
			var course=it.next()
			var add = true;
			var course_it = new Iterator(schedule);
			while(course_it.not_finished()){
				var schedule_course=course_it.next();
				if(course_conflict(course, schedule_course))
					add=false;
			}
			if(add){				
				schedule.push(course);
				generate(subject_codes, level+1, schedule);				
				schedule.pop();
			}
		}
	}
	else{
		if(schedule.length == subject_codes.length){
			count++;
			self.postMessage({command: NEW_SCHEDULE, schedule: schedule});
		}
	}
}

self.addEventListener('message', function(e) {
	count = 0;
	selected_subjects = e.data;
	generate(subject_codes(), 0, [])  
	self.postMessage({command:UPDATE_COUNT, count: count});
	self.postMessage({command:FINISHED});	
}, false);
