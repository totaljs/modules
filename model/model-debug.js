module.exports = function(name) {
	if (name[0] === '/')
		name = name.substring(1);
	return require(framework.path.root('/models/' + name + '.js'));	
};