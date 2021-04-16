import './styles.css';
import contentsHTML from './contents.html';
import { handleLang, getCookie } from './utils.js';
import { displayCurrentPage } from './contents.js';
import { login } from './login.js';
import { logout } from './main.js';
import { _globals } from './globals.js';

if( window.location.search !== '?login' ) {
	_globals.user = getCookie('user');
	_globals.sessId = getCookie('sess_id');
} else {
	_globals.user = null;
	_globals.sessId = null;
}

_globals.appContainer = null;

// Attaching to the html container element
let script = document.getElementById('bundle');
if( script ) {	
	let appContainerName = script.getAttribute('data-appcontainer');
	if(appContainerName) { 
		_globals.appContainer = document.getElementById(appContainerName);
		if( _globals.appContainer ) {	
			_globals.appContainer.innerHTML = contentsHTML;
		}
	}
}

window.addEventListener('load', function() {
	handleLang();
	let loginEl = document.getElementById('login');
	if( loginEl ) {
		loginEl.onclick = function(e) { login('loaderLogin', 'user', 'pass'); };
	}
	let logoutEl = document.getElementById('a-logout');
	if( logoutEl ) {
		logoutEl.onclick = function(e) { e.preventDefault(); logout() };		
	}

	displayCurrentPage();
});
