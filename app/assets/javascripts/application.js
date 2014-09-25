//= require vendor/modernizr
//= require jquery
//= require foundation
//= require underscore
//= require backbone
//= require react
//= require components

$(document).foundation();

var TeacherOption = Backbone.Model.extend({
    defaults: {
        "banned": false
    },
    toggleBanned: function () {
        this.set({"banned": !this.get("banned")});        
    }
});
