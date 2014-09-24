/** @jsx React.DOM */

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

$(function(){
  React.renderComponent(<SearchBar subjectOptions={subjectOptions} />, document.getElementById('searchBar'));
});
