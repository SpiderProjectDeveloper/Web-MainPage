import './styles.css';
import contentsHTML from './contents.html';
import { handleLang, getCookie, setCookie } from './utils.js';
import { displayCurrentPage } from './contents.js';
import { login } from './login.js';
import { logout } from './main.js';
import { _globals } from './globals.js';

if( window.location.search !== '?login' ) {
	let q = parseSearchQuery();
	if( q.user ) {
		_globals.user = q.user;
		setCookie('user', q.user);
	} else {
		_globals.user = getCookie('user');
	}
	if( q.sessId ) {
		_globals.sessId = q.sessId;
		setCookie('sess_id', q.sessId);
	} else {
		_globals.sessId = getCookie('sess_id');
	}
	if( q.userName ) {
		setCookie('userName', q.userName);
	}
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

window.addEventListener('load', function() 
{
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


function parseSearchQuery() 
{
	let r = {};
	if( window.location.search.length < 2 ) return r;

	let query = window.location.search.substring(1);
	if( query.indexOf('=') === -1 ) {	 // No '=' if no key-value pairs - project id only then
		r.projectId = query;
		return r;
	}
	var pairs = query.split('&');
	for( let pair of pairs ) {
		let kv = pair.split('=');
		let k = decodeURIComponent(kv[0]);
		if( k !== null && k !== '' ) {
			let v = decodeURIComponent(kv[1]);
			if( v !== null && v !== '' ) {
				r[k] = v;
			}
		}
	}
	return r;
}
