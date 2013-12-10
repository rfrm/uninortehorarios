UPDATE_COUNT = 0
FINISHED = 1
NEW_SCHEDULE = 2
                  
var myHelloWorker = new Worker('/task.js');
var day_word = a={M:"lunes", T:"martes", W:"miercoles", R:"jueves", F:"viernes", S:"sabado"};

Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};

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
Iterator.prototype.get_current = function(){
	return this.list[this.index];
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
	if(selected_subjects[subject_code].banned_teachers === undefined){
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
		if(other.schedule[day] !== undefined){
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
	for(var code in selected_subjects)
		codes.push(code);
	return codes;
}

var count=0;
var generated_schedules = [];

function sort_subjects_courses(){
	var subject_code;
	for(subject_code in selected_subjects){
		selected_subjects[subject_code].courses.sort(function(a, b){return course_weight(a)-course_weight(b)});
	}
}

function draw_schedule(schedule){
	$("#schedule-table td").text("");
	var it=new Iterator(schedule);
	while(it.not_finished()){
		var course = it.next();
		for(var day in course.schedule){
			var hour_it = new Iterator(course.schedule[day]);
			while(hour_it.not_finished()){
				var hour = hour_it.next();
				$("#cell-"+day_word[day]+"-"+hour).text(course.name);
			}
		}
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

function initialize_schedule_table(){
	var mousedown = false;
	var $table = $("#schedule-table");
	var titles = ["Hora", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
	var days = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado"];

	// Create titles
	var $table_header = $("<tr>");
	var it = new Iterator(titles);
	while(it.not_finished()){
		$table_header.append($("<th>").text(it.next()));
	}
	$table.append($table_header);

	//Create table body
	for(var hour=6;hour<20;hour++){
		var $table_row = $("<tr>");

		//Add hour
		$table_row.append($("<th>").text(hour+":30-"+(hour+1)+":29"));
		it = new Iterator(days);
		while(it.not_finished()){
			var day = it.next();
			$table_row.append($('<td id="cell-'+day+'-'+hour+'" class="block">'));
		}
		$table.append($table_row);
	}
}

$(function(){
	$.getJSON('/subject/autocomplete').done(function(data){
		$('#subject_code').autocomplete({
		    lookup: data,
		    onSelect: function (selection) {
		    	var subject_code = selection.data;
		    	if( !is_selected(subject_code) ){
		    		$(this).val(""); //Clear textfield		    				    		
		    		$(".wait").addClass("waiting");
			    	$.post("/subject/courses", {subject_code: subject_code}, function(data) {
						$(".wait").removeClass("waiting");
			    		add_subject(data);
			    		sort_subjects_courses();			    		
			    		show_subject_panel(data);
			    	}, "json");	
		    	}
		    }
		});
	})

	initialize_schedule_table();

	$("#generate-schedules").click(function(){
		generated_schedules = []
		$(".wait").addClass("waiting");
		myHelloWorker.postMessage(selected_subjects);
	});
	
	

	myHelloWorker.addEventListener("message", function (event) {
		switch(event.data.command){
			case UPDATE_COUNT:
				$("#schedule-count").text(event.data.count);
				break;
			case FINISHED:
				$(".wait").removeClass("waiting");
				break;
			case NEW_SCHEDULE:
				generated_schedules.push(event.data.schedule);
				break;
		}	
	});
	
	$('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
		if( $(e.target).attr("href")=="#schedules-viewer" &&
			$(e.relatedTarget).attr("href")=="#subject-picker"){
				
		}
	});

	$("#filter-cleaner").click(function(){
		$(".ui-selected").removeClass("ui-selected")
	});
	
    $("#schedule-table").selectable({
        filter: ".block",
        selected: function( event, ui ) {
            var row = $(ui.selected).parents('tr').index(),
                col = $(ui.selected).parents('td').index();
        },
        unselected: function( event, ui ) {
            var row = $(ui.unselected).parents('tr').index(),
                col = $(ui.unselected).parents('td').index();
        }
    });
	
});
