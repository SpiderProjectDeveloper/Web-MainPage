import { _globals } from './globals.js';
import { displayErrorMessage, displayCurrentPage, clearErrorMessages } from './contents.js';
import { setCookie } from './utils.js';

export function login( loaderId, userId,  passId ) {
	clearErrorMessages();
	
	let userEl = document.getElementById(userId);
	let passEl = document.getElementById(passId);

	let user = userEl.value.trim();
	let pass = passEl.value.trim();

	if( user.length == 0 ) {
		displayErrorMessage( 'userNameError' );
		return;
	}
	if( pass.length == 0 ) {
		displayErrorMessage( 'passError' );
		return;
	}

	let loaderEl = document.createElement('div');
	loaderEl.className = 'loader';
	let loaderContainerEl = document.getElementById('login-loader');
	loaderContainerEl.appendChild(loaderEl);

	let xmlhttp = new XMLHttpRequest();
	xmlhttp.onreadystatechange = function() {
		if (this.readyState == 4 ) {
			loaderContainerEl.removeChild(loaderEl);
			if( this.status == 200 ) {
				if( this.responseText !== "error" && this.responseText.length >= 30 ) {
					_globals.user = user;
					_globals.sessId = this.responseText;
					setCookie( 'user', user );
					setCookie( 'sess_id', this.responseText );
					displayCurrentPage();
				} else {
					displayErrorMessage( 'credentialsError' );
				}
			} else {
				displayErrorMessage( 'connectionError' );
			}
		}
	};


	//console.log('user:'+user);
	//console.log('pass:'+pass);

	let data = encodeURIComponent('user')+'='+encodeURIComponent(user)+'&'+encodeURIComponent('pass')+'='+encodeURIComponent(pass);

	//console.log('user:'+data);

	xmlhttp.open("POST", '/.login', true);
	xmlhttp.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
  xmlhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xmlhttp.send(data);
}
