[![Support](https://www.totaljs.com/img/button-support.png)](https://www.totaljs.com/support/) [![Donate](https://www.totaljs.com/img/button-donate.png)](https://www.totaljs.com/#make-a-donation)

# Simple module for backing up files to remote server over sftp (ssh)


## Installation

- download the module `sshbackup.js`
- add it into the modules in your application directory

```html
/your-application-directory/modules/sshbackup.js
```
Install `ssh2` module from npm using `npm install ssh2`

## Initialization

Paste the code bellow to some definition file.

```javascript
	MODULE('ssh-backup').init({
		host: '1.2.3.4',
		port: 22,
		username: 'username',
		password: 'password'
	});

	// or using privateKey

	MODULE('ssh-backup').init({
		host: '1.2.3.4',
		port: 22,
		username: 'username',
		privateKey: require('fs').readFileSync('/path/to/the/key')
	});
```

## Usage

```javascript
	var source = '/local/path/to/the/file.json';
	var dest = '/remote/path/to/the/file.json';

	MODULE('ssh-backup').backup(source, dest, function(err){
		console.log('DONE', err);
	});
```
