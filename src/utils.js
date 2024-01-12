import { _globals } from './globals.js';

var _langs = [ 'en', 'ru' ];

var _texts = { 
	'text-lang': { 'en': 'EN', 'ru': 'РУ' },
	'text-logout': { 'en': 'exit', 'ru': 'выход' },
	'text-not-logged-in': { 'en': 'You are not logged in', 'ru': 'Вы не авторизованы' },
	'text-user': { 'en': 'User', 'ru': 'Имя пользователя' },
	'text-pass': { 'en': 'Password', 'ru': 'Пароль' },
	'text-login-page-title': { 'en': 'Web SP Login', 'ru': 'Вход в Web SP' },
	'text-login-button': { 'en': 'Login', 'ru': 'Вход' },
	'text-index-page-title': { 'en': 'Web SP Main Menu', 'ru': 'Главное меню Web SP' },
	'text-gantt-charts': { 'en': 'Gantt Charts', 'ru': 'Диаграммы Гантта' },
	'text-projects': { 'en': 'Projects', 'ru': 'Проекты' },
	'text-input-tables': { 'en': 'Input Tables', 'ru': 'Учет' },
	'text-dashboards': { 'en': 'Dashboards', 'ru': 'Дэшборды' },
	'text-connection-error': { 'en': 'Connection with your server is lost. Please try again later...', 
		'ru':'Связь с сервером потеряна. Пожалуйста попытайтесь позже...' },
	'text-credentials-error': { 'en': 'Login and/or password is incorrect. Please, try again...', 
		'ru':'Логин и/или пароль указан(ы) неверное. Пожалуйста попытайтесь снова...' },
	'text-user-name-error': { 'en': '"User" field contains an invalid value. Please, try again...', 
		'ru':'Поле "Пользователь" содержит недопустимое значение. Пожалуйста попытайтесь снова...' },
	'text-pass-error': { 'en': '"Password" field contains an invalid value. Please, try again...', 
		'ru':'Поле "Пароль" содержит недопустимое значение. Пожалуйста попытайтесь снова...' },
	'text-project-list-connection-error': { 'en': 'Failed to load the list of projects. Check connection please and try again...', 
	'ru':'Не удалось загрузить список проектов. Проверьте соединение и попробуйте снова... ' },
	'text-project-list-error': { 'en': '"Password" field contains an invalid value. Please, try again...', 
	'ru':'Поле "Пользователь" содержит недопустимое значение. Пожалуйста попытайтесь снова...' },
	'text-ifcimport': { 
		'en': 'Create A New Project out of an .IFC file', 
		'ru': 'Создать проект из .IFC-файла' 
	},
	'text-ifccreateproject': { 
		'en': 'Create a New Project and Merge it with an .IFC file', 
		'ru': 'Создать проект и связать его с .IFC-файлом' 
	},
};
          
export var _lang = null;

var _dynamicTexts = {
	'gantt': { 'en': 'Gantt Chart', 'ru': 'Диаграмма Гантта' },
	'dashboard': { 'en': 'Dashboard', 'ru': 'Дэшборд' },
	'input': { 'en': 'Performance Input', 'ru': 'Ввод учета' },
	'ifc': { 'en': '3D Viewer (IFC)', 'ru': '3D модель (IFC)' },
	'ifccreateproject': { 'en': 'Merge with an .IFC file', 'ru': 'Связать проект с .IFC-файлом' },
	'sdoc': { 'en': 'SP Document (SDoc)', 'ru': 'Документ SP (SDoc)' },
	'get-gantt-structs': {
		'en': '[ show available structs ]', 
		'ru': '[ показать доступные структуры ]' 
	}
}

var _dateFormat = 
{
	timeDelim: ':', 
	dateDelim: '.', 
	dateFormat: "DMY"
};

export function getDynamicText( id ) {
	return _dynamicTexts[id][_lang];	
}

function handleLangTexts(lang) 
{
	for( let key in _texts ) {
		let el = document.getElementById(key);
		if( !el ) {
			continue;
		}
		if( !(_lang in _texts[key]) ) {
			continue;
		}
		el.innerHTML = _texts[key][_lang];
	}
	let userName = getCookie('user');	
	if( userName !== null ) {
		let el = document.getElementById('text-user-name');
		if( el )
			el.innerHTML = userName;
	}	

	let dt = document.querySelectorAll("[data-dynamicText]")
	for( let i = 0 ; i < dt.length ; i++ ) {
		let key = dt[i].getAttribute('data-dynamicText');
		dt[i].childNodes[0].nodeValue = _dynamicTexts[ key ][ _lang ];
	}
}

export function handleLang( setLang = null) 
{
	let langEl = document.getElementById('header-lang');
	if( !langEl ) {
		return;
	}

	let langIndex = -1;
	if( setLang !== null ) {
		langIndex = _langs.indexOf(setLang);
	}

	// Reading lang from uri
	let ss = window.location.search;
	if( ss.length > 1 ) {
		let pairs = ss.substr(1).trim().toLowerCase().split('&');
		for( let i = 0 ; i < pairs.length ; i++ ) {
			let kv = pairs[i].split('=');
			if( kv.length === 2 ) {
				if( kv[0] === 'language' ) {
					langIndex = _langs.indexOf(kv[1]);
				}
			}
		}		
	}
	// If no lang found, reading from cookie
	if( langIndex === -1 ) {
		let cookieLang = getCookie( 'lang' );
		langIndex = _langs.indexOf(cookieLang);
	}
	if( langIndex === -1 ) {
		langIndex = 0;
	}
	_lang = _langs[langIndex];

	//langEl.innerHTML = lang;	
	handleLangTexts( _lang );
	langEl.dataset.langindex = langIndex;
	setCookie( 'lang', _lang );

	langEl.onclick = function(e) {
		let index = parseInt( this.dataset.langindex );
		if( index < 0 || index > _langs.length-1 ) {
			return;
		}
		if( index < _langs.length-1 ) {
			index += 1;
		} else {
			index = 0;
		}
		_lang = _langs[index];
		//langEl.innerHTML = lang;
		handleLangTexts( _lang );
		this.dataset.langindex = index;
		setCookie( 'lang', _langs[index] );
	};
}


export function setDateFormat( dateFormat ) 
{
	if( 'timeDelim' in dateFormat && dateFormat.timeDelim !== null && dateFormat.timeDelim.length > 0 ) {
		_dateFormat.timeDelim = dateFormat.timeDelim;
	}
	if( 'dateDelim' in dateFormat && dateFormat.dateDelim !== null && dateFormat.dateDelim.length > 0 ) {
		_dateFormat.dateDelim = dateFormat.dateDelim;
	}
	if( 'dateFormat' in dateFormat && dateFormat.dateFormat !== null && dateFormat.dateFormat.length > 0 ) {
		_dateFormat.dateFormat = dateFormat.dateFormat;
	}
}

export function setCookie( cname, cvalue, exminutes=null ) 
{
	if( exminutes === null ) {
		document.cookie = `${cname}=${cvalue}; path=/`;
	}
	else {
		let d = new Date();
		d.setTime(d.getTime() + (exminutes*60*1000));
		document.cookie = `${cname}=${cvalue}; expires=${d.toUTCString()}; path=/`;
	}
}

export function deleteCookie( cname ) {
	document.cookie = `${cname}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
}

/*''*/

export function getCookie( cname, type='string' ) {
	let name = cname + "=";
	let decodedCookie = decodeURIComponent(document.cookie);
	let ca = decodedCookie.split(';');
	for( let i = 0 ; i < ca.length ; i++ ) {
		let c = ca[i];
		while( c.charAt(0) == ' ' ) {
			c = c.substring(1);
		}
		if( c.indexOf(name) == 0 ) {
			let value = c.substring(name.length, c.length);
			if( type == 'string' ) {
				return value;
			}
			if( type == 'int' ) {
				let intValue = parseInt(value);
				if( !isNaN(intValue) ) {
					return intValue;
				}
			}
			if( type == 'float' ) {
				let floatValue = parseFloat(value);
				if( !isNaN(floatValue) ) {
					return floatValue;
				}
			}
			return null;
		}
	}
	return null;
}


export function secondsIntoSpiderDateString( seconds, props = { addSeconds:0 } ) {
	if( typeof(seconds) === 'undefined' || seconds === null || seconds === '' ) {
		return '';
	}

	let spiderDateString = '';
	let date;
	try {
		date = new Date( parseInt(seconds) * 1000 + (('addSeconds' in props) ? props.addSeconds*1000 : 0) );
	} catch(e) {
		return '';
	}

	let year = date.getUTCFullYear(); 
	let month = (date.getUTCMonth()+1);
	if( month < 10 ) {
		month = "0" + month;
	}
	let day = date.getUTCDate();
	if( day < 10 ) {
		day = "0" + day;
	}
	if( _dateFormat.dateFormat === 'DMY' ) {
		spiderDateString = day + _dateFormat.dateDelim + month + _dateFormat.dateDelim + year; 
	} else {
		spiderDateString = month + _dateFormat.dateDelim + day + _dateFormat.dateDelim + year;		 
	}
	return( spiderDateString ); 
}


export function parseDate( dateString ) {
	if( typeof(dateString) === 'undefined' ) {
		return null;
	}
	if( dateString == null ) {
		return null;
	}
	let date = null;
	let y=null, m=null, d=null, hr=null, mn=null;
	let parsedFull = dateString.match( /([0-9]+)[\.\/\-\:]([0-9]+)[\.\/\-\:]([0-9]+)[ T]+([0-9]+)[\:\.\-\/]([0-9]+)/ );
	if( parsedFull !== null ) {
		if( parsedFull.length == 6 ) {
			y = parsedFull[3];
			if( _dateFormat.dateFormat === 'MDY' ) {
				m = parsedFull[1];
				d = parsedFull[2];								
			} else {
				d = parsedFull[1];
				m = parsedFull[2];				
			}
			hr = parsedFull[4];
			mn = parsedFull[5];
			date = new Date( Date.UTC(y, m-1, d, hr, mn, 0, 0) );
		}
	} else {
		let parsedShort = dateString.match( /([0-9]+)[\.\/\-\:]([0-9]+)[\.\/\-\:]([0-9]+)/ );
		if( parsedShort !== null ) {
			if( parsedShort.length == 4 ) {
				y = parsedShort[3];
				if( _dateFormat.dateFormat === 'MDY' ) {
					m = parsedShort[1];
					d = parsedShort[2];								
				} else {
					d = parsedShort[1];
					m = parsedShort[2];				
				}
				hr = 0;
				mn = 0;
				date = new Date(Date.UTC(y, m-1, d, hr, mn, 0, 0, 0, 0));
			}
		}
	}
	if( date === null ) {
		return null;
	}
	let timeInSeconds = date.getTime();
	return( { 'date':date, 'timeInSeconds':timeInSeconds/1000 } ); 
}
