/** @jsx React.DOM */

var  ModelMixin = {
  componentDidMount: function() {
    // Whenever there may be a change in the Backbone data, trigger a reconcile.
    this.getBackboneModels().forEach(this.injectModel, this);
  },
  componentWillUnmount: function() {
    // Ensure that we clean up any dangling references when the component is
    // destroyed.
    this.__syncedModels.forEach(function(model) {
      model.off(null, model.__updater, this);
    }, this);
  },
  injectModel: function(model){
    if(!this.__syncedModels) this.__syncedModels = [];
    if(!~this.__syncedModels.indexOf(model)){
      var updater = this.forceUpdate.bind(this, null);
      model.__updater = updater;
      model.on('add change remove', updater, this);
      this.__syncedModels.push(model);
    }
  }
}

var  BindMixin = {
  bindTo: function(model, key){
    return {
      value: model.get(key),
      requestChange: function(value){
          model.set(key, value);
      }.bind(this)
    }
  }
}

var SearchBarInput = React.createClass({
  getInitialState: function() {
    return {
      isTyping: false,
      searchValue: ""
    };
  },
  componentDidMount: function() {
    Backbone.on("SearchOption:selected", this.clear);
  },
  clear: function() {
    this.setState({searchValue: ''});
    this.refs.searchInput.getDOMNode().focus();
  },
  handleChange: function(e) {
    if(this.state.isTyping)
      clearTimeout(this.timer);
    this.timer = setTimeout(this.emitSubject, 300);
    this.setState({searchValue: e.target.value, isTyping: true});
  },
  emitSubject: function(e) {
    this.setState({isTyping: false});
    Backbone.trigger("SearchBarInput:stop_writing", this.state.searchValue);
  },
  render: function() {
    return (
      <div className="row">
        <div className="large-12 columns">
          <form>
            <label>
              <input ref="searchInput" type="search" value={this.state.searchValue} onChange={this.handleChange} placeholder="Escribe el nombre o código de una materia" />
            </label>
          </form>
        </div>
      </div>
    );
  }
});

var SearchOption = React.createClass({
  selected: function() {
    Backbone.trigger("SearchOption:selected", this.props.code);
  },
  render: function() {
    return (
      <li onClick={this.selected} className="searchOption">
        ({this.props.code}) {this.props.name}
        <i className="fi-plus hide">Agregar</i>
      </li>
    );
  }
});

var SearchOptionList = React.createClass({
  getInitialState: function() {
    return {
      options: []
    };
  },
  clear: function() {
    this.setState({options: []});
  },
  setOptions: function(value){
    if(value.length>0){
      var searchValue = value.toUpperCase()
          filtered = this.props.options.filter(function(subject){
              return subject.get("name").indexOf(searchValue)>-1 || subject.get("code").indexOf(searchValue)>-1
          });
      this.setState({options: _.first(filtered, 5)})
    }
    else
      this.setState({options: []});
  },
  componentDidMount: function() {
    Backbone.on("SearchOption:selected", this.clear);
    Backbone.on("SearchBarInput:stop_writing", this.setOptions);
  },
  render: function() {
    var options = this.state.options.map( function(item, i){
      return <SearchOption name={item.get("name")} code={item.get("code")} key={i} />
    });

    return (
      <div className="row">
        <div className="large-12 columns">
          <ul className="optionList" ref="optionList">
            {options}
          </ul>
        </div>
      </div>
    );
  }
});

var SearchBar = React.createClass({
  render: function() {
    return (
      <div className="large-12 columns">
        <SearchBarInput />
        <SearchOptionList options={this.props.subjectOptions} />
      </div>
    );
  }
});

var TeacherOptionView = React.createClass({
  mixins:[ModelMixin],
  getBackboneModels: function(){
    return [this.props.instance]
  },
  render: function() {
    var model = this.props.instance,
        icon_class = model.get("banned") ? "fi-x medium" : "fi-check medium",
        tooltip = model.get("banned") ? "Desbloquar" : "Bloquear";
    return (
      <div className="teacherOptionView" onClick={model.toggleBanned.bind(model)}>
        <a  data-tooltip aria-haspopup="true" className="has-tip button tiny" title={tooltip}>
          <i className={icon_class}></i>
        </a>
        {model.get("name")}        
      </div>
    );
  }
});

var libardo = undefined;

$(function(){

  libardo = new TeacherOption({name: "Libardo Ruz"});

  React.renderComponent(<SearchBar subjectOptions={subjectOptions} />, document.getElementById('searchBar'));
  React.renderComponent(<TeacherOptionView instance={libardo} />, document.getElementById('teacher'));
});
