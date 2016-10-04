var UserForm = React.createClass({
    propTypes: {
        onUser: React.PropTypes.func.isRequired
    },
    getInitialState: function() {
        return {
            title: '',
            read: false
        };
    },
    changeTitle: function(ev) {
        this.setState({
            title: ev.target.value
        });
    },
    changeRead: function() {
        this.setState({
            read: !this.state.read
        });
    },
    addUser: function(ev) {
        ev.preventDefault();

        this.props.onUser({
            title: this.state.title,
            read: this.state.read
        });

        this.setState({
            title: '',
            read: false
        });
    },
    render: function() {
        return (
            <form onSubmit={this.addUser}>
                <div>
                    <label htmlFor='title'>Title</label>
                    <div><input type='text' id='title' value={this.state.title} onChange={this.changeTitle} placeholder='Title' /></div>
                </div>
                <div>
                    <label htmlFor='title'>Read</label>
                    <div><input type='checkbox' id='read' checked={this.state.read} onChange={this.changeRead} /></div>
                </div>
                <div>
                    <button type='submit'>Add User</button>
                </div>
            </form>
        );
    }
});