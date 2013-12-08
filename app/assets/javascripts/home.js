// var myHelloWorker = new Worker('/task.js');
// myHelloWorker.addEventListener("message", function (event) {
//   	document.getElementById("output").textContent = event.data;
// }, false);

// myHelloWorker.postMessage("David");
// // myHelloWorker.terminate();

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

var selected_subjects = {};
function add_subject(subject_data){
	selected_subjects[subject_data.mat] = subject_data
}
function delete_subject(subject_code){
	delete selected_subjects[subject_code]
}
function is_selected(subject_code){
	selected_subjects[subject_code] != undefined;
}
function add_banned_teacher(subject_code, teacher){
	if(selected_subjects[subject_code].banned_teachers == undefined){
		selected_subjects[subject_code].banned_teachers = [teacher];
	}
	else{
		selected_subjects[subject_code].banned_teachers.push(teacher);
	}
}
function delete_banned_teacher(subject_code, teacher){
	var index = selected_subjects[subject_code].banned_teachers.indexOf(teacher);
	selected_subjects[subject_code].banned_teachers.remove(index);
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

var count=0;
var generated_schedules = [];
function generate(subject_codes, level, schedule){	
	if(level < subject_codes.length){
		var subject_code = subject_codes[level];
		var courses = selected_subjects[subject_code].courses;
		var it = new Iterator(courses);

		while(it.not_finished()){
			count++;
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
		if(schedule.length == subject_codes.length)
			generated_schedules.push(clone(schedule));
	}
}

function sort_subjects_courses(){
	var subject_code;
	for(subject_code in selected_subjects){
		selected_subjects[subject_code].courses.sort(function(a, b){return course_weight(a)-course_weight(b)});
	}
}

function show_subject_panel(subject_data) {
	var $teacher_list, $teacher_row, $col, $panel, $panel_body, subject_name, subject_code, teacher_name, i, j;

	subject_code = subject_data.mat;
	subject_name = subject_data.name;
	$teacher_list = $('<ul class="list-group"></ul>')
	for(i=0;i<subject_data.subject_teachers.length;i++){
		teacher_name = subject_data.subject_teachers[i];
		$teacher_row = $('<li class="list-group-item">'+
							'<div class="row">'+
								'<div class="col-sm-2">'+
									'<button class="btn btn-default" data-toggle="tooltip" data-placement="top" data-original-title="Bloquear">'+
										'<span class="glyphicon glyphicon-check"></span>'+
									'</button>'+
								'</div>'+
								'<div class="col-sm-10">'+
									'<p>'+teacher_name+'</p>'+
								'</div>'+
							'</div>'+
						 '</li>');

		$teacher_row.find("button").tooltip();
		$teacher_row.find("button").click(function(){
			var teacher_name = $(this).parent().siblings().children().text();					
			if($(this).attr('data-original-title') == "Bloquear"){				

				// Update UI
				$(this).attr('data-original-title', "Desbloquear");
				$(this).find('span').css('color', 'red');
				$(this).find('span').removeClass('glyphicon-check');
				$(this).find('span').addClass('glyphicon-ban-circle');
				// Update Data Structure
				add_banned_teacher(subject_code, teacher_name);
			}
			else{
				// Update UI
				$(this).attr('data-original-title', "Bloquear");				
				$(this).find('span').css('color', 'green');
				$(this).find('span').removeClass('glyphicon-ban-circle');
				$(this).find('span').addClass('glyphicon-check');
				// Update Data Structure
				delete_banned_teacher(subject_code, teacher_name);
			}
			$(this).tooltip('show');
		});
		$teacher_list.append($teacher_row);
	}
	$panel_body = $('<div class="panel-body"></div>');
	$panel_body.append($teacher_list);
	$panel = $('<div class="panel panel-default"></div>').append('<div class="panel-heading">'+
																		'<button type="button" class="close" data-subject-to-delete='+subject_code+'>&times;</button>'+
																		'<h5>'+subject_name+'</h5>'+
																	'</div>');
	$panel.append($panel_body);
	$col = $('<div class="col-md-4 subject-col"></div>').hide().append($panel);
	$("#subject-wrapper").append($col);
	$panel.find("button.close").click(function(){
		delete_subject(subject_code);
		$col.slideUp('slow', function(){
			$col.remove();
		});
	});	
	$col.slideDown(500);	
}

$(function(){
	$.getJSON('/subject/autocomplete').done(function(data){
		$('#subject_code').autocomplete({
		    lookup: data,
		    onSelect: function (selection) {
		    	var subject_code = selection.data;
		    	if( !is_selected(subject_code) ){
		    		$(this).val(""); //Clear textfield		    				    		
			    	$.post("/subject/courses", {subject_code: subject_code}, function(data) {
			    		add_subject(data);
			    		sort_subjects_courses();			    		
			    		show_subject_panel(data);
			    	}, "json");	
		    	}
		    }
		});
	})	
});
