// var myHelloWorker = new Worker('/task.js');
// myHelloWorker.addEventListener("message", function (event) {
//   	document.getElementById("output").textContent = event.data;
// }, false);

// myHelloWorker.postMessage("David");
// // myHelloWorker.terminate();

var current_subjects = [];

$.fn.exists = function() {
    return this.length > 0;
}

Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};

function get_banned_teachers (argument) {
	var banned_teachers={}
	var $cols = $(".subject-col");
	for(var i=0;i<$cols.length;i++){
		var $col = $($cols[i]);
		var name = $col.find("h5").text();
		
		var $banned_teachers = $col.find("[data-original-title=Desbloquear]").parent().siblings().children();
		if($banned_teachers.length>0){
			banned_teachers[name]=[];
			for(var j=0;j<$banned_teachers.length;j++){
				banned_teachers[name].push($($banned_teachers[j]).text());
			}
		}		
	}
	return banned_teachers;
}

function add_subject (subject_data) {
	var $teacher_list = $('<ul class="list-group"></ul>')
	for(var i=0;i<subject_data.subject_teachers.length;i++){
		var teacher = subject_data.subject_teachers[i];
		var $teacher_row = $('<li class="list-group-item">'+
								'<div class="row">'+
									'<div class="col-sm-2">'+
										'<button class="btn btn-default" data-toggle="tooltip" data-placement="top" data-subject-name="'+subject_data.name+'" data-original-title="Bloquear">'+
											'<span class="glyphicon glyphicon-check"></span>'+											
										'</button>'+								
									'</div>'+
									'<div class="col-sm-10">'+
										'<p>'+teacher+'</p>'+
									'</div>'+									
								'</div>'+
							  '</li>')
		$teacher_row.find("button").tooltip();
		$teacher_row.find("button").click(function(){
			console.log($(this).attr('data-original-title'));
			if($(this).attr('data-original-title') == "Bloquear"){
				$(this).attr('data-original-title', "Desbloquear");
				$(this).find('span').css('color', 'red');
				$(this).find('span').removeClass('glyphicon-check');
				$(this).find('span').addClass('glyphicon-ban-circle');
			}
			else{
				$(this).attr('data-original-title', "Bloquear");
				$(this).find('span').css('color', 'green');
				$(this).find('span').removeClass('glyphicon-ban-circle');
				$(this).find('span').addClass('glyphicon-check');
			}
			$(this).tooltip('show');
		});
		$teacher_list.append($teacher_row);
	}
	var $panel_body = $('<div class="panel-body"></div>');
	$panel_body.append($teacher_list);
	var $panel = $('<div class="panel panel-default"></div>').append('<div class="panel-heading">'+
																		'<button type="button" class="close" data-subject-to-delete='+subject_data.mat+'>&times;</button>'+
																		'<h5>'+subject_data.name+'</h5>'+
																	'</div>');
	$panel.append($panel_body);
	
	var $col = $('<div class="col-md-4 subject-col"></div>');
	$col.append($panel);
	$col.hide()
	$("#subject-wrapper").append($col);
	$col.slideDown(500);	
}

$(function(){

	$.getJSON('/subject/autocomplete').done(function(data){
		$('#subject_code').autocomplete({
		    lookup: data,
		    onSelect: function (suggestion) {
		    	if(current_subjects.indexOf(suggestion.data)==-1){
		    		current_subjects.push(suggestion.data);
		    		$(this).val("")
			    	$.post("/subject/courses", { subject_code: suggestion.data }, function( data ) {
			    		add_subject(data);
			    	}, "json");	
		    	}
		    }
		});
	})	

	$("body").on("click", "button.close", function(event){
		current_subjects.remove(current_subjects.indexOf($(this).attr("data-subject-to-delete")));
		$(this).parent().parent().slideUp('slow', function(){ $(this).parent().remove(); });
	});
});
