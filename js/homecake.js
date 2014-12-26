(function() {

var parallax = false;
var hideOnScroll = false;
var favs = [
	'Camera',
	'Settings',
	'Phone',
	'Music',
];
var mode = 1;
const LAST_MODE = 3;
var apps = document.getElementById('apps');
var bottom = document.getElementById('bottom');
var topbar = document.getElementById('topbar');
var input = document.getElementById('input');
var iconsize = 64;
var iconMap = new WeakMap();
var writing = false;

function bottomVisibility(str) {
	if (bottom) bottom.style.visibility = str;
}

function topbarVisibility(str) {
	if (topbar) topbar.style.visibility = str;
}

function useMode (m) {
	if (m == -1) {
		mode ++;
		if (mode==LAST_MODE)
			mode = 0;
	} else {
		mode = m;
	}

	switch (mode) {
	case 0:
		iconsize = window.innerWidth-16;
		bottomVisibility ('hidden');
		toggle.innerHTML = "&nbsp;=&nbsp;";
		break;
	case 1:
		iconsize = 64;
		bottomVisibility ('visible');
		toggle.innerHTML = "&nbsp;::&nbsp;";
		break;
	case 2:
		iconsize = 64;
		bottomVisibility ('visible');
		toggle.innerHTML = "&nbsp;+&nbsp;";
		break;
	}
	updateApps();
	updateFavs();
}
useMode (mode);

function addFav(name) {
	if (favs.indexOf (name) != -1)
		return;
	var newfavs = [name];
	for (i=0;i<Math.min (favs.length,3);i++) {
		newfavs[newfavs.length] = favs[i];
	}
	favs = newfavs;
	updateFavs ();
}

/*
	const HIDDEN_ROLES = ['system', 'input', 'homescreen'];

	function populate() {
		let icons = document.querySelector("#icons");
		let appMgr = navigator.mozApps.mgmt;
		appMgr.getAll().onsuccess = function(event) {
			let apps = event.target.result;
			let fragment = document.createDocumentFragment();
			for (let app of apps) {
				if (HIDDEN_ROLES.indexOf(app.manifest.role) > -1)
					continue
					if (app.manifest.entry_points) {
						for (let k in app.manifest.entry_points) {
							fragment.appendChild(createIcon(app, k));
						}
					} else {
						fragment.appendChild(createIcon(app));
					}
			}
			icons.innerHTML = "";
			icons.appendChild(fragment);
		}
	}
*/

	function updateWallpaper() {
		var req = navigator.mozSettings.createLock().get('wallpaper.image');
		req.onsuccess = function onsuccess() {
			var blob = req.result['wallpaper.image'];
			var url = URL.createObjectURL(blob);
			var wallpaper = document.getElementById('wallpaper')
			wallpaper.style['background-color'] = '#101010';
			wallpaper.style.backgroundImage = "url(" + url + ")";
		}
	}

	var icons = [];

	function updateAppCache () {
		iconMap = new WeakMap();
		icons = [];
		input.value = "";
		FxosApps.all().then(icns => {
			icns.forEach(icon => {
				var min = Math.min (icns.length, 6);
				icons[icons.length] = icon;
				if (icons.length==min) {
					updateApps();
				}
			})
		}) .then (foo=> {
			updateFavs();
			updateApps();
		});
	}

	function updateFavs() {
		bottom.innerHTML = "";
		bottom.innerHTML = "<center>";
		for (var idx in icons) {
			var icon = icons[idx];
			if (favs.indexOf (icon.name) != -1)
				renderFav (icon);
		}
		bottom.innerHTML += "</center>";
	}

	function updateApps() {
		var filter = input.value;
		if (input.value.length<1) filter = "";
		apps.innerHTML = "";
		for (var idx in icons) {
			var icon = icons[idx];
			if (filter=="" || icon.name.toLowerCase().indexOf (filter.toLowerCase()) != -1) {
				renderApp (icon);
			}
		}
	}

	window.addEventListener("DOMContentLoaded", () => {
		apps = document.getElementById('apps');
		bottom = document.getElementById('bottom');
		topbar = document.getElementById('topbar');
		input = document.getElementById('input');
		toggle = document.getElementById('toggle');
		input.value = "";
		writing = false;
		input.onkeyup = function() {
			var text = input.value;
			updateApps();
		}
		var odelta = 0;
		window.addEventListener ("scroll", function() {
			if (parallax) {
				var wh = document.body.height; // document size
				var y = document.body.scrollTop; // screen offset
				var h = document.body.clientHeight; // screen size
				wh = 8500;
				var miny = 0;
				var maxy = 1024 - h; // h-wh;

				var delta = maxy * (y / wh); //(maxy - y);
				console.log(maxy, wh,y,h, "=", delta);
				// parallax
				if (delta != odelta) {
					document.getElementById('wallpaper').style['background-position'] = "0px -"+delta+"px";
				}
			} 
			var focused = document.activeElement;
			if (!focused || focused == document.body)
				focused = null;
			else if (document.querySelector)
				focused = document.querySelector(":focus");
			if (focused != input) {
				var y = document.body.scrollTop; // screen offset
				if (y > odelta) {
					// scrolldown
					if (y+16>odelta) {
						topbarVisibility ('hidden');
						if (hideOnScroll)
							bottomVisibility ('hidden');
					}
				} else {
					// scrollup
					if (y+16<odelta) {
						topbarVisibility ('visible');
						if (mode != 0) {
							bottomVisibility ('visible');
						}
					}
				}
				odelta = y;
			}
		}, true);
		document.body.onfocus = function () {
			writing = false;
		}
		input.onfocus = function () {
			writing = true;
			bottom.style['visibility'] = 'hidden';
			toggle.innerHTML="&nbsp;-&nbsp;";
		}
		input.onblur = function () {
			bottom.style['visibility'] = 'visible';

			//writing = false;
			if (mode) {
				toggle.innerHTML="&nbsp;+&nbsp;";
			} else {
				toggle.innerHTML="&nbsp;=&nbsp;";
			}
		}
		toggle.onclick = function () {
			if (mode == 0) {
				if (bottom) bottom.style.visibility = 'hidden';
			}
			if (writing) { // this.innerHTML.indexOf("-") != -1) {
				writing = false;
			} else {
				useMode (-1); 
			}
			document.body.focus ();
		}

		var appMgr = navigator.mozApps.mgmt;
		appMgr.oninstall = updateAppCache;
		appMgr.onuninstall = updateAppCache;

		navigator.mozSettings.addObserver('wallpaper.image', updateWallpaper);
		updateWallpaper();
		updateAppCache();
	}, true);

/*
	function renderIcon(icon) {
		var appEl = document.createElement('div');
		appEl.className = 'tile';
		switch (mode) {
		case 0:
			appEl.innerHTML = '<div class="back" style="background-image: url('+ icon.icon + ');"></div>';
			break;
		case 2:
			appEl.innerHTML = '<div class="back" style="background-image: url('+ icon.icon + ');"></div>';
			break;
		default:
			appEl.innerHTML = '<div class="wrapper"><div class="back" style="background-image: url('
			+ icon.icon + ');"></div><div class="front"></div></div>';
			break;
		}
		iconMap.set(appEl, icon);
		apps.appendChild(appEl);
	}
*/

	function renderFav(icon) {
		var appEl = document.createElement('div');
		appEl.className = 'bottom-tile';
		appEl.innerHTML = '<a href="#"><img width="'+iconsize+'px" height="'+iconsize+
			'px" src="'+icon.icon+'"></a>';
		iconMap.set(appEl, icon);
		bottom.appendChild(appEl);
	}

	function renderApp(icon) {
		var appEl = document.createElement('div');
		appEl.className = 'tile';
		//appEl.innerHTML = '<div class="wrapper"><div class="back" style="background-image: url(' + icon.icon + ');">'+
		//	icon.name+'</div><div class="front"></div>JAJAJAJAJ</div>';
		appEl.innerHTML = '<a href="#"><img width="'+iconsize+'px" height="'+iconsize+
			'px" src="'+icon.icon+'">';
		switch (mode) {
		case 0:
			appEl.innerHTML += '&nbsp;&nbsp;</a><br />';
			break;
		case 2:
			appEl.style="display:inline-block";
			appEl.innerHTML += '</a>';
			break;
		case 1:
			appEl.innerHTML += '&nbsp;&nbsp;'+icon.name+'</a><br />';
			break;
		}
		iconMap.set(appEl, icon);
		apps.appendChild(appEl);
	}

	var opened = [];

	window.addEventListener('click', function(e) {
		var container = e.target
		var icon = iconMap.get(container);
		if (!icon) {
			container = container.parentNode;
			icon = iconMap.get(container);
			if (!icon) {
				container = container.parentNode;
				icon = iconMap.get(container);
			}
		}
		if (icon) {
			document.body.focus ();
			writing = false;
			icon.launch();
			addFav(icon.name);
		}
	});
}());
