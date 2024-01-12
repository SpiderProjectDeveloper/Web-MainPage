import { deleteCookie, secondsIntoSpiderDateString, parseDate, getDynamicText, handleLang, _lang, setDateFormat } from './utils.js';
import { displayErrorMessage, displayCurrentPage, clearErrorMessages } from './contents.js';
import { calendar, calendarSetFormat, calendarGetFormat, calendarIsActive } from './calendar.js';
import { checkServer } from './server.js';
import { _globals } from './globals.js';

function appendProjectMenuTitle( projectMenuEl, title ) {
	let divEl = document.createElement('div');
	let node = document.createTextNode( title );
	divEl.appendChild( node );
	divEl.className = 'project-menu-title';
	projectMenuEl.appendChild(divEl);
}

function appendGanttStructs( structs, parent, projectId ) 
{
	for( let struct of structs ) {
		let aEl = document.createElement('a');
		let node = document.createTextNode( struct['Name'] );
		aEl.appendChild( node );
		aEl.className = 'project-menu-a';
		let code = struct['Code'];
		let href = `/gantt/index.html?projectId=${projectId}&structCode=${code}`;
		aEl.href = href;
		aEl.onclick = function(e) { e.preventDefault(); checkAuthorizedAndProceed( href ); };
		parent.appendChild(aEl);
	}
}

function appendProjectMenuGetGanttStructsButton( projectMenuEl, projectId, linkKey ) 
{
	let divEl = document.createElement('div');
	divEl.className = 'project-menu-gantt-structs';

	let aEl = document.createElement('a');
	aEl.dataset.dynamicText = 'get-gantt-structs';
	let node = document.createTextNode( getDynamicText('get-gantt-structs') );
	aEl.appendChild( node );
	aEl.className = 'project-menu-expand-gantt-structs';
	//let href = `/${dir}/index.html?${projectId}`;
	aEl.href = '#';
	aEl.onclick = function(e) 
	{ 
		e.preventDefault(); 
		let xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function() 
		{
			if (xhttp.readyState == 4 ) {
				if( xhttp.status != 200 || !('responseText' in xhttp) || xhttp.responseText === null || xhttp.responseText.length === 0 ) {
					return;
				}
				divEl.removeChild( divEl.lastChild );
				try {
					let structs = JSON.parse( xhttp.responseText );
					appendGanttStructs( structs['Activity'], divEl, projectId );
				} catch(e) { return;	}
			}
		}
		xhttp.open("GET", '/.get_gantt_structs?' + encodeURIComponent(projectId), true);
		xhttp.send();			
	};

	divEl.appendChild( aEl );

	projectMenuEl.appendChild(divEl);
	projectMenuEl[linkKey] = true;
	//projectMenuEl.appendChild(document.createElement('br'));
}


function appendProjectMenuInputLink( projectMenuEl, projectId, curTime, linkKey, props ) 
{
	if( 'project' in props && 'CurTime' in props.project ) {										
		projectMenuEl[linkKey] = false;
	}
	let aEl = document.createElement('a');
	aEl.dataset.dynamicText = 'input';
	let node = document.createTextNode( getDynamicText('input') );
	aEl.appendChild( node );
	aEl.className = 'project-menu-a';

	let stEl = document.createElement('input');
	stEl.className = 'project-menu-input';
	stEl.value = secondsIntoSpiderDateString(curTime);
	let enEl = document.createElement('input');
	enEl.className = 'project-menu-input';
	enEl.value = secondsIntoSpiderDateString(curTime, { addSeconds: 60*60*24*7 });
	aEl.onclick = function(e) {
		let st = parseDate( stEl.value );
		let en = parseDate( enEl.value );
		if( st !== null && en !== null ) {
			let href = `/input/index.html?projectId=${projectId}&from=${st.timeInSeconds}&to=${en.timeInSeconds}`;
			e.preventDefault(); 
			checkAuthorizedAndProceed( href );
		} 
	};
	projectMenuEl.appendChild(document.createElement('hr'));
	projectMenuEl.appendChild(aEl);
	projectMenuEl.appendChild(document.createElement('br'));

	let stCalendarEl = document.createElement('span');	// Calendar caller
	stCalendarEl.innerHTML = '&#9783;'
	stCalendarEl.className = 'project-menu-calendar';
	projectMenuEl.appendChild(stCalendarEl);
	projectMenuEl.appendChild(stEl);	// Input

	let enCalendarEl = document.createElement('span');	// Calendar caller
	enCalendarEl.innerHTML = '&#9783;'
	enCalendarEl.className = 'project-menu-calendar';
	projectMenuEl.appendChild(enCalendarEl);
	projectMenuEl.appendChild(enEl);	// Input

	let calendarContainerEl = document.createElement('div');	// Calendar caller
	calendarContainerEl.className = 'project-menu-calendar-container';
	projectMenuEl.appendChild(calendarContainerEl);

	stCalendarEl.onclick = function(e) { callCalendar( stEl, calendarContainerEl ) };
	enCalendarEl.onclick = function(e) { callCalendar( enEl, calendarContainerEl ) };

	projectMenuEl[linkKey] = true;
	projectMenuEl.appendChild(document.createElement('br'));
	projectMenuEl.appendChild(document.createElement('br'));
	projectMenuEl.appendChild(document.createElement('hr'));
}

function appendProjectMenuLink( projectMenuEl, dir, projectId, linkKey, props ) 
{
	projectMenuEl[linkKey] = false;
	let href = `/${dir}/index.html`;
	if( dir === 'gantt' ) {
		href += `?projectId=${projectId}`;
		if( 'project' in props && 'dataChanged' in props.project ) {
			href += `&dataChanged=${props.project.dataChanged}`;
		}
	} else if ( dir === 'dashboard' ) {	
		//if( !('project' in props) )
		//	return;
		//if( !('numDashboardItems' in props.project ) || props.project.numDashboardItems === 0 || props.project.numDashboardItems === '' ) 
		//	return;
		href += `?${projectId}`;	
	} else if( dir === 'ifc' ) {
		if( !('project' in props) || !('IFCPath' in props.project) || !props.project.IFCPath ) {
			return;
		}		
		href += `?${projectId}`;	
	} else if ( dir === 'ifccreateproject' || dir === 'sdoc' ) {	
		href += `?${projectId}`;	
	} 
	let aEl = document.createElement('a');
	aEl.dataset.dynamicText = dir;
	let node = document.createTextNode( getDynamicText(dir) );
	aEl.appendChild( node );
	aEl.className = 'project-menu-a';
	aEl.href = href;
	aEl.onclick = function(e) { e.preventDefault(); checkAuthorizedAndProceed( href ); };
	projectMenuEl.appendChild(aEl);
	projectMenuEl[linkKey] = true;
	projectMenuEl.appendChild(document.createElement('br'));
}

export function loadMainContents() 
{
	clearErrorMessages();

	let loaderEl = document.createElement('div');
	loaderEl.className = 'loader';
	let loaderContainerEl = document.getElementById('project-loader');
	loaderContainerEl.appendChild(loaderEl);

	let containerEl = document.getElementById('projects');

	let xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (xhttp.readyState == 4 ) {
			loaderContainerEl.removeChild(loaderEl);
			if( typeof(xhttp.responseText) === 'undefined' || xhttp.responseText === null || xhttp.responseText.length < 5 ) { 	// Not logged in
				_globals.user = null;
				_globals.sessId = null;
				deleteCookie( 'user' );
				deleteCookie( 'sess_id' );
				displayCurrentPage();	
			}

			if( xhttp.status == 200 ) {
				let data = null;
				let errorParsingStatusData = false;	
				try {
					data = JSON.parse(xhttp.responseText);
				} catch(e) {
					errorParsingStatusData = true;
				}
				if( errorParsingStatusData ) { 
					containerEl.innerHTML = '...';
					return;			
				} 
				if( !('Projects' in data) || data.Projects.length === 0 ) {
					containerEl.innerHTML = '...';			
					return;
				} 
				if( 'parameters' in data ){
					if( 'language' in data.parameters ) {
						handleLang( data.parameters.language );
					}
					setDateFormat(data.parameters);
				}
				let storages = null;
				if( 'f_Storages' in data ) 
				{ 		// If a list of storages is passed
					for( let storage of data['f_Storages'] ) {
						if( typeof(storage) !== 'object' ) continue;
						if( !('Code' in storage) || !('Name' in storage) || !('Location') in storage ) continue;
						if( storages === null ) storages = {};
						storages[ storage['Code'] ] = { name: storage['Name'], location: storage['Location'] };
					}
				}
				containerEl.innerHTML = '';					
				for( let i = 0 ; i < data.Projects.length ; i++ ) {
					let projectId = null;
					let projectTitle = null;
					let project = data.Projects[i];
					if( typeof(project) === 'string' ) { 	// The default storage - only project name is passed
						projectId = project; 
						projectTitle = convertToReadableProjectTitle(project);
					}	else {	// Multiple storages. A list of storages must be passed
						if( storages !== null && typeof(project) === 'object' ) {							
							if( 'storageCode' in project && 'fileName' in project ) {
								let storageCode = project['storageCode'];
								if( storageCode in storages ) {
									projectId = storageCode + "/" + project['fileName'];
									projectTitle = storages[storageCode].name + ": " + 
										convertToReadableProjectTitle(project['fileName']);
								}
							} 
						}	
					}
					if( projectId === null || projectTitle === null ) return;
				
					let projectContainerEl = document.createElement('div');
					containerEl.appendChild(projectContainerEl);
					projectContainerEl.className = 'project';
					if( i % 2 === 0 ) {
						projectContainerEl.style.backgroundColor = '#f0f7ff';
					}
					
					let projectTitleEl = document.createElement('div');
					projectContainerEl.appendChild(projectTitleEl);
					projectTitleEl.className = 'project-title';
					let projectTitlePrefixId = 'projectTitlePrefix' + i;
					projectTitleEl.innerHTML = `<span style='color:#7f7f7f;' id='${projectTitlePrefixId}'>&plus;&nbsp;</span>${projectTitle}`;

					let projectMenuEl = document.createElement('div');
					projectContainerEl.appendChild(projectMenuEl);
					projectMenuEl.className = 'project-menu';
					projectMenuEl.style.display = 'none';

					if( projectId.endsWith('sdoc') ) {
						projectTitleEl.onclick = function(e) {
							onSDocMenuTitle( projectMenuEl, projectId, projectTitlePrefixId );
						}
					} else {
						projectTitleEl.onclick = function(e) {
							onProjectMenuTitle( projectMenuEl, projectId, projectTitlePrefixId );
						};
					}
				}
      } 
	  }
	}
	xhttp.open( 'GET', '/.contents', true );
  xhttp.send();
}

export function unloadMainContents() {
	let containerEl = document.getElementById('projects');
	if( containerEl ) {
		while (containerEl.firstChild) {
			containerEl.removeChild(containerEl.firstChild);
		}
	} 	
}


function checkAuthorizedAndProceed(url) {	
	displayErrorMessage('connectionError', false);
	checkServer( 2, function(available, authorized) {
		if( !available ) {
			displayErrorMessage('connectionError');
		} else {
			if( !authorized )
				window.location.href = '/';
			else
				window.open(url);
		}
	});	
}

export function logout() {
	let xmlhttp = new XMLHttpRequest();
	xmlhttp.onreadystatechange = function() {
		if (this.readyState == 4 ) {
			if( this.status == 200 ) {
				_globals.user = null;
				_globals.sessId = null;
				deleteCookie( 'user' );
				deleteCookie( 'sess_id' );
				displayCurrentPage();
			} else {
				displayErrorMessage( 'connectionError' );
			}
		}
	}
	xmlhttp.open("GET", '/.logout', true);
  xmlhttp.send();
}


function onProjectMenuTitle( projectMenuEl, projectId, projectTitlePrefixId ) {
	if( projectMenuEl.style.display==='none' ) {
		projectMenuEl.style.display = 'block';
		document.getElementById(projectTitlePrefixId).innerHTML = '&minus;&nbsp;';
		if( typeof(projectMenuEl.__myHasIfcLink) === 'undefined' ) {
			let xhttpProps = new XMLHttpRequest();
			xhttpProps.onreadystatechange = function() {
				if (xhttpProps.readyState == 4 ) {
					if( xhttpProps.status == 200 ) {
						let errorParsingProps = false;
						let props;	
						try {
							props = JSON.parse( xhttpProps.responseText );
						} catch(e) {
							errorParsingProps = true;
						}
						if( !errorParsingProps ) {
							if( 'project' in props && 'Name' in props.project ) {
								appendProjectMenuTitle(projectMenuEl, props.project.Name );
							} 
							appendProjectMenuLink( projectMenuEl, 'gantt', projectId, '__myHasGanttLink', props );
							appendProjectMenuGetGanttStructsButton( projectMenuEl, projectId, '__myHasGetStructsButton' );
							appendProjectMenuLink( projectMenuEl, 'dashboard', projectId, '__myHasDashboardLink', props );
							appendProjectMenuLink(projectMenuEl, 'ifc', projectId, '__myHasIfcLink', props );
							appendProjectMenuInputLink( projectMenuEl, projectId, props.project.CurTime, '__myHasInputLink', props );
							appendProjectMenuLink(projectMenuEl, 'ifccreateproject', projectId, '__myHasIfcCreateProjectLink', props );
						}
					}
				}
			} 
			xhttpProps.open( 'GET', '/.get_project_props?'+projectId, true );
			xhttpProps.send();
		}
	} else {
		projectMenuEl.style.display = 'none';
		document.getElementById(projectTitlePrefixId).innerHTML = '&plus;&nbsp;';
	}
}

function onSDocMenuTitle( projectMenuEl, projectId, projectTitlePrefixId ) {
	if( projectMenuEl.style.display==='none' ) {
		projectMenuEl.style.display = 'block';
		document.getElementById(projectTitlePrefixId).innerHTML = '&minus;&nbsp;';
		if( typeof(projectMenuEl.__mySDoc) === 'undefined' ) {
			appendProjectMenuLink( projectMenuEl, 'sdoc', projectId, '__mySDoc', {} ); 
		}
	} else {
		projectMenuEl.style.display = 'none';
		document.getElementById(projectTitlePrefixId).innerHTML = '&plus;&nbsp;';
	}
}

function callCalendar( input, container ) {
	let d = parseDate( input.value );
	if( d === null ) {
		let date = new Date( Date.now() );
		d = { date: date, timeInSeconds: date.getTime()/1000 };
	}
	// calendarSetFormat( { dateOnly: false } );
	// Adjusting calendar container according to the input's left 
	let left = input.offsetLeft - input.parentNode.offsetLeft;
	let right = left + 34 * 7 + 4;
	if( right > input.parentNode.offsetWidth - 40) {
		left -= (right - input.parentNode.offsetWidth + 40);
	}
	container.style.marginLeft = left + 'px'; 
	calendar( container, input,
		function(d) { 
			if( d !== null ) {
				input.value = secondsIntoSpiderDateString( d.getTime()/1000 );
			}
		}, 
		34, 24, d.date, _lang ); 
}

function convertToReadableProjectTitle( projectFileName ) {
	let lastDotPos = projectFileName.lastIndexOf('.sprj');
	if( lastDotPos === -1 ) return projectFileName; 
	let lastButOneDotPos = 	projectFileName.lastIndexOf('.', lastDotPos - 1 );
	if( lastButOneDotPos === -1 ) return projectFileName; 
	let version = projectFileName.substring( lastButOneDotPos+1, lastDotPos );
	if( version === null || version.length === 0 ) return projectFileName; 
	let title = projectFileName.substring( 0, lastButOneDotPos ) + ` (${version})`;
	return title;
}
