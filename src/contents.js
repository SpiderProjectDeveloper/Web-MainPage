import { _globals } from './globals.js';
import { deleteCookie } from './utils.js';
import { loadMainContents, unloadMainContents } from './main.js';

export function displayLoader( loaderElId, status ) 
{
	let loaderEl = document.getElementById(loaderElId);
	if( loaderEl ) {
		if( status ) {
			loaderEl.style.display = 'inline-block';
		} else {
			loaderEl.style.display = 'none';
		}
	}
}

export function displayErrorMessage( errorMessageId, display=true ) 
{
	let id = document.getElementById(errorMessageId);
	if( id ) {
		if( display ) {
			id.style.display = 'inline-block';
		} else {
			id.style.display = 'none';
		}
	}	
}

export function displayCurrentPage( checkAuthorized = false ) 
{
	if( checkAuthorized && _globals.user !== null && _globals.sessId !== null ) {
		let xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function() {
		if (xhttp.readyState == 4 ) {
			let ok = false;
			if( xhttp.status == 200 && 'responseText' in xhttp && xhttp.responseText !== null && xhttp.responseText.length !== 0 ) {
				if( xhttp.responseText === '1' ) {
					ok = true;
				}
			}
			if( !ok ) {
				_globals.user = null;
				_globals.sessId = null;
				deleteCookie('user');
				deleteCookie('sess_id');
			}
			displayPage();
		}
	}
	xhttp.open("GET", '/.check_authorized', true);
	xhttp.send();	
} else {
		displayPage();
	}
}


function displayPage() 
{
	let _page =	(_globals.user !== null && _globals.sessId !== null ) ? 'main' : 'login';

	if( _page === 'login' ) {
		document.getElementById('main_page').style.display = 'none';
		document.getElementById('login_page').style.display = 'block';		
		document.getElementById('a-logout').style.display = 'none';
		document.getElementById('text-user-name').style.display = 'none';
		document.getElementById('text-user-name').innerHTML = '';
		unloadMainContents();
	}	else {
		document.getElementById('main_page').style.display = 'block';
		document.getElementById('login_page').style.display = 'none';
		document.getElementById('a-logout').style.display = 'inline-block';
		document.getElementById('text-user-name').style.display = 'inline-block';
		document.getElementById('text-user-name').innerHTML = _globals.user + '::';
		loadMainContents();
	}	
}


export function clearErrorMessages() 
{
	displayErrorMessage('projectListConnectionError', false);
	displayErrorMessage('connectionError', false);
	displayErrorMessage('credentialsError', false);
	displayErrorMessage('userNameError', false);
	displayErrorMessage('passError', false);
}