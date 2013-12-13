// Constants
GENERATE = 1;
FILTER = 2;
FINISHED_GENERATING = 3;
FINISHED_FILTERING = 4;

// Global variables
allow_full = false;
worker_busy = false;
showed_schedule_index = 0;
selected_subjects = {};
generated_schedules = [];
filtered_generated_schedules = [];
must_recalculate_schedules = false;
myHelloWorker = new Worker('/worker.js');
day_letter2day_word = a={M:"lunes", T:"martes", W:"miercoles", R:"jueves", F:"viernes", S:"sabado"};
day_word2day_letter = a={"lunes":"M", "martes":"T", "miercoles":"W", "jueves":"R", "viernes":"F", "sabado":"S"};

Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};

// My Iterator class
function Iterator(l){
	this.index = 0;
	this.list = l;
}
Iterator.prototype.next = function(){
	return this.list[this.index++];
}
Iterator.prototype.not_finished = function(){
	if(this.list != undefined)
		return (this.index < this.list.length);
	return false;
}

// Functions related to selected subjects object
function add_subject(subject_data){
	must_recalculate_schedules = true;
	selected_subjects[subject_data.mat] = subject_data
}

function delete_subject(subject_code){
	must_recalculate_schedules = true;
	delete selected_subjects[subject_code]
}

function is_selected(subject_code){
	return selected_subjects[subject_code] != undefined;
}

function add_banned_teacher(subject_code, teacher){
	if(selected_subjects[subject_code].banned_teachers === undefined)
		selected_subjects[subject_code].banned_teachers = [teacher];
	else
		selected_subjects[subject_code].banned_teachers.push(teacher);
}
function delete_banned_teacher(subject_code, teacher){
	var index = selected_subjects[subject_code].banned_teachers.indexOf(teacher);
	selected_subjects[subject_code].banned_teachers.remove(index);
}
function add_banned_hour(day, hour){
	if( selected_subjects.banned_hours === undefined )
		selected_subjects.banned_hours = {};
	
	if( selected_subjects.banned_hours[day] === undefined)
		selected_subjects.banned_hours[day] = [hour]
	else
		selected_subjects.banned_hours[day].push(hour);
}
function is_banned_hour(day, hour){
	if(selected_subjects.banned_hours === undefined)
		return false;
	if(selected_subjects.banned_hours[day] !== undefined){
		var banned_hours = selected_subjects.banned_hours[day];
		if( banned_hours.indexOf(hour) != -1)
			return true;
		return false
	}
	return false;
}
function delete_banned_hour(day, hour){
	var banned_hours = selected_subjects.banned_hours[day]
	if(banned_hours !== undefined && banned_hours.length > 0 )
		banned_hours.remove(banned_hours.indexOf(hour));
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
////////////////////////////////////////////////////////////////////////////////
// Worker comunication related functions
function worker_generate_schedules(){
	if(subject_codes().length > 0){
		show_wait_gif()
		draw_bussy_alert();
		myHelloWorker.postMessage({command: GENERATE, selected_subjects: selected_subjects});		
	}
	else{
		draw_no_subject_alert();
	}
}

function worker_filter_schedules(){
	if(subject_codes().length > 0){
		show_wait_gif()
		draw_filtering_alert();
		showed_schedule_index = 0;
		myHelloWorker.postMessage({command: FILTER, selected_subjects: selected_subjects, generated_schedules: generated_schedules, allow_full: allow_full});
	}
	else{
		draw_no_subject_alert();
	}
}

////////////////////////////////////////////////////////////////////////////////
// Graphical interface related functions
function show_wait_gif(){
	$(".wait").addClass("waiting");	
}

function hide_wait_gif(){
	$(".wait").removeClass("waiting");
}

function draw_schedule(schedule){
	$("#schedule-table td").text("");
	$("#schedule-info").html("");
	var it=new Iterator(schedule);
	while(it.not_finished()){
		var course = it.next();
		for(var day in course.schedule){
			var hour_it = new Iterator(course.schedule[day]);
			while(hour_it.not_finished()){
				var hour = hour_it.next();
				$("#cell-"+day_letter2day_word[day]+"-"+hour).text(course.name);
			}
		}
		$("#schedule-info").append('<div class="col-md-2">'+
										'<div class="panel panel-default course-data">'+
											'<p class="course-name">'+course.name+'</p>'+
											'<p>nrc:'+course.nrc+'&nbsp;|&nbsp;cupos:'+course.available+'</p>'+
											'<p>'+course.lecture_teachers+'</p>'+
										'</div>'+
									'</div>');
	}
}

function create_subject_panel(subject_data) {
	var $teacher_list, $teacher_row, $col, $panel, $panel_body, subject_name,
	     subject_code, teacher_name, i, j;

	subject_code = subject_data.mat;
	subject_name = subject_data.name;
	$teacher_list = $('<ul class="list-group"></ul>')
	for(i=0;i<subject_data.subject_teachers.length;i++){
		teacher_name = subject_data.subject_teachers[i];
		$teacher_row = $('<li class="list-group-item">'+
							'<div class="row">'+
								'<div class="col-sm-3">'+
									'<button class="btn btn-default btn-ban btn-block" data-toggle="tooltip" data-placement="top" data-original-title="Bloquear">'+
										'<span class="glyphicon glyphicon-check"></span>'+
									'</button>'+
								'</div>'+
								'<div class="col-sm-9">'+
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

function set_schedule_index(value){
	showed_schedule_index = value;
	$("#schedule-index").val(showed_schedule_index+1);
	draw_schedule(filtered_generated_schedules[showed_schedule_index]);
}

function draw_bussy_alert(){
	if(!worker_busy){
		worker_busy = true;
		show_wait_gif();		
		$("#message-board").attr("class", "alert alert-info")
		$("#message-board").html('<p>Generando horarios, por favor espera.</p>');
	}
}

function draw_no_subject_alert(){
	$("#message-board").attr("class", "alert alert-warning");
	$("#message-board").html('<p>Debes seleccionar al menos una materia.</p>');
}

function draw_filtering_alert(){
	$("#message-board").attr("class", "alert alert-info");
	$("#message-board").html('<p>Aplicando filtros.</p>');
}

function draw_filtered_schedules_alert(){
	hide_wait_gif();
	worker_busy = false;
	if(generated_schedules.length>0){
		if(filtered_generated_schedules.length > 0){
			$("#message-board").attr("class", "alert alert-success");
			$("#message-board").html('<p>Se generaron '+generated_schedules.length+' horario(s), y '+filtered_generated_schedules.length+' cumple(n) con los filtros.</p>');
		}
		else{
			$("#message-board").attr("class", "alert alert-warning");
			$("#message-board").html('<p>Se generaron '+generated_schedules.length+' horario(s), pero los filtros no pueden ser cumplidos.</p>');
		}
	}
	else{
		$("#message-board").attr("class", "alert alert-warning");
		$("#message-board").html('<p>No se pudieron generar horarios con las materias seleccionadas y los filtros aplicados.</p>');
	}
}

function draw_schedule_table(){
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

function generate_PDF(){
	var doc = new jsPDF();
	var schedule = $("#schedules-viewer").get(0);

	doc.fromHTML(schedule, 15, 15, {
        'width': 170 
	});

	doc.save('test.pdf')
}

$(function(){

	/* If I don't do this, the ajax indicator gif is not displayed 
	   the first time is needed. */
	show_wait_gif();
	setTimeout(function(){
		hide_wait_gif();	
	}, 50);
	
	/* This gets the course list from the server and feeds it to the 
	   autocomplete plugin*/
	$.getJSON('/subject/autocomplete').done(function(data){
		$('#subject_code').autocomplete({
		    lookup: data,
		    onSelect: function (selection) {
		    	var subject_code = selection.data;
		    	if( !is_selected(subject_code) ){
		    		show_wait_gif();
		    		$(this).val(""); //Clear textfield			    		
			    	$.post("/subject/courses", {subject_code: subject_code}, function(data) {
			    		if( data.error_message !== undefined){
			    			$("#subject-wrapper").prepend(
								'<div class="alert alert-danger alert-dismissable">'+
								  '<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>'+
								  data.error_message+
								'</div>'
			    			);
			    			hide_wait_gif()
			    		}
			    		else{			    			
				    		add_subject(data);
				    		create_subject_panel(data);
				    		hide_wait_gif()
			    		}			    		
			    	}, "json");	
		    	}
		    }
		});
	})

	draw_schedule_table();

	$('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
		if( $(e.target).attr("href")=="#schedules-viewer" && $(e.relatedTarget).attr("href")=="#subject-picker"){
			if(must_recalculate_schedules){
				must_recalculate_schedules = false;
				worker_generate_schedules();
			}
			else
				worker_filter_schedules();		
		}
	});

	$("#filter-cleaner").click(function(){
		selected_subjects.banned_hours = undefined;
		$(".ui-selected").removeClass("ui-selected")
		worker_filter_schedules();
	});

	$("#button-prev-schedule").click(function(){
		set_schedule_index(showed_schedule_index-1);
	});

	$("#button-next-schedule").click(function(){
		set_schedule_index(showed_schedule_index+1);
	});
	
    $("#schedule-table").selectable({
        filter: ".block",
        selected: function( event, ui ) {
        	var data, day, hour;
        	data = $(ui.selected).attr("id").split("-");
        	day = day_word2day_letter[data[1]];
        	hour = data[2];
        	add_banned_hour(day, hour);
        },
        unselected: function( event, ui ) {
			var data, day, hour;
            data = $(ui.unselected).attr("id").split("-");
           	day = day_word2day_letter[data[1]];
        	hour = data[2];
        	while( is_banned_hour(day, hour) )
        		delete_banned_hour(day, hour);
        },
        stop: function( event, ui ) {
        	worker_filter_schedules();
        }
    });

    $("#allow_full").click(function(){
    	allow_full = $(this).find("[type=checkbox]").prop("checked");
    	worker_filter_schedules();
    })

    $("#save-as-pdf").click(function(){

    	// "FRA4- SOCIETE ET COMMUN INTERC"


    	var doc = new jsPDF('l');

    	// doc.setFontSize(20);doc.text(0, 20, "Electrónica I");
    	doc.rect(10, 10, 277, 190, {});
    	// for(var x=37.2;x<287;x=x+27.2)
    	// 	doc.lines([[0, 277]], x, 10);
		doc.save("test.pdf");
    })

	myHelloWorker.addEventListener("message", function (event) {
		switch(event.data.command){
			case FINISHED_FILTERING:
				filtered_generated_schedules = event.data.filtered_generated_schedules;
				draw_filtered_schedules_alert();
				set_schedule_index(showed_schedule_index);	
				break;
			case FINISHED_GENERATING:
				generated_schedules = event.data.generated_schedules;
			 	worker_filter_schedules();
				break;
		}	
	});	
});
