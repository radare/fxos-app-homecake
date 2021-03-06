(function() {

var parallax = false;
var hideOnScroll = false;
var canDelete = true;
var favs = [
	'Camera',
	'Settings',
	'Phone',
	'Music',
];
var mode = 1;
const LAST_MODE = 3;
const LONG_PRESS_TIMEOUT = 600;
var apps = document.getElementById('apps');
var bottom = document.getElementById('bottom');
var topbar = document.getElementById('topbar');
var input = document.getElementById('input');
var iconsize = 64;
var roundicons = true;
var iconHash = {};
var writing = false;

	
var screenRatio = window.innerHeight / window.innerWidth;
//hideOnScroll = (screenRatio<1.5);
// Flame = 1.68
// Keon = 1.42

function saveSettings() {
	localStorage.setItem ("favs", favs.join (','));
	localStorage.setItem ("mode", ""+mode);
}
function loadSettings() {
	try {
		favs = localStorage.getItem ("favs").split (',');
		mode = localStorage.getItem ("mode") |0;
		if (mode>LAST_MODE || mode<0)
			mode = 1;
	} catch (e) {
		mode = 1;
		favs = [
			'Camera',
			'Settings',
			'Phone',
			'Music',
		];
	}
}

function bottomVisibility(str) {
	if (bottom) {
		if (str == "visible") {
			bottom.style.transition = "opacity 0.5s ease-in-out, visibility 1s linear";
			bottom.style.opacity = 1;
		} else {
			bottom.style.opacity = 0;
		}
		bottom.style.visibility = str;
	}
}

function topbarVisibility(str) {
//	if (topbar) topbar.style.visibility = str;
	if (topbar) {
		topbar.style.transition = "opacity 0.5s ease-in-out, visibility 1s linear";
		if (str == "visible") {
			topbar.style.transition = "opacity 0.5s ease-in-out, visibility 1s linear";
			topbar.style.opacity = 1;
		} else {
			topbar.style.opacity = 0;
		}
		topbar.style.visibility = str;
	}
}

function useMode (m) {
	if (m == -1) {
		mode ++;
		if (mode==LAST_MODE)
			mode = 0;
	} else {
		mode = m;
	}
	var body = document.getElementById('body');
if (mode == 0)
mode = 1;

	switch (mode) {
	case 0:
		iconsize = window.innerWidth-16;
		bottomVisibility ('hidden');
		toggle.innerHTML = "&nbsp;=&nbsp;";
		body.style = '';
		break;
	case 1:
		iconsize = 64;
		bottomVisibility ('visible');
		body.style ="width:1024px !important";
		toggle.innerHTML = "&nbsp;::&nbsp;";
		break;
	case 2:
		iconsize = 64;
		body.style = "";
		bottomVisibility ('visible');
		//toggle.innerHTML = "&nbsp;+&nbsp;";
		toggle.innerHTML = "&nbsp;=&nbsp;";
		break;
	}
	updateApps();
	updateFavs();
	saveSettings();
}
loadSettings ();
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
		return;
		/* this is not necessary because the launcher app takes the background
		   image if there's no background-image loaded */
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

	var running = false;
	var updating = false;
	function updateAppCache (app) {
		if (updating)
			return;
		updating = true;
		icons = [];
		input.value = "";
		FxosApps.all().then(icns => {
			icons = [];
			icns.forEach(icon => {
				var min = Math.min (icns.length, 6);
				icons[icons.length] = icon;
			})
		}).then (foo => {
			updateFavs();
			updateApps();
			updating = false;
		});
	}

	function updateFavs() {
		var str = "";
		for (var idx in icons) {
			var icon = icons[idx];
			if (favs.indexOf (icon.name) != -1)
				str += renderFav (icon);
		}
		bottom.innerHTML = str;
	}

	function updateApps() {
		var filter = input.value;
		if (input.value.length<1) filter = "";
		var str = "";
		str = "";
		firstResult = null;
		for (var idx in icons) {
			var icon = icons[idx];
			if (filter=="" || icon.name.toLowerCase().indexOf (filter.toLowerCase()) != -1) {
				if (!firstResult)
					firstResult = icon;
				str += renderApp (icon);
			}
		}
		if (!hideOnScroll && input.value == "")
			str += "<div style='height:128px'></div>";
		if (mode == 2) {
			apps.innerHTML = "<center>"+str+"</center>";
		} else {
			apps.innerHTML = str;
		}
	}

	var firstResult = null;
	window.addEventListener("DOMContentLoaded", () => {
		apps = document.getElementById('apps');
		bottom = document.getElementById('bottom');
		topbar = document.getElementById('topbar');
		input = document.getElementById('input');
		toggle = document.getElementById('toggle');
		input.value = "";
		writing = false;
		input.onkeyup = function(e) {
			if (e.keyCode==13) {
				 bottomVisibility ('visible');
				if (input.value != "") {
					if (firstResult) {
						firstResult.launch();
						saveSettings();
						addFav(icon.name);
					}
				} else {
					input.blur ();
				}
			} else {
				updateApps();
			}
// on enter execute the first result?
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
			//	console.log(maxy, wh,y,h, "=", delta);
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
			/*
			if (focused != input) {
				var y = document.body.scrollTop; // screen offset
				if (y > odelta) {
					// scrolldown
					if (y+8>odelta) {
						topbarVisibility ('hidden');
						if (hideOnScroll)
							bottomVisibility ('hidden');
					}
				} else {
					// scrollup
					if (y+8<odelta) {
						topbarVisibility ('visible');
						if (mode != 0) {
							bottomVisibility ('visible');
						}
					}
				}
				
				odelta = y;
			}
														 */
		}, true);
		/*
		document.body.onfocus = function () {
			writing = false;
			input.onblur();
		}
		*/
		input.onfocus = function () {
			writing = true;
		  bottomVisibility ('hidden');
			toggle.innerHTML="&nbsp;-&nbsp;";
		}
		input.onblur = function () {
			if (mode)
				bottomVisibility('visible');
			switch (mode) {
			case 0: toggle.innerHTML="&nbsp;=&nbsp;"; break;
			case 1: toggle.innerHTML="&nbsp;::&nbsp;"; break;
			case 2: toggle.innerHTML="&nbsp;=&nbsp;"; break;
			}
		}

		toggle.ontouchstart = function () {
			if (mode == 0) {
				bottomVisibility('hidden');
			}
			if (writing) { // this.innerHTML.indexOf("-") != -1) {
				writing = false;
window.document.getElementById('apps').scrollTop = 0
input.value = '';
				updateApps();
			} else {
				useMode (-1);
			}
			bottomVisibility ('visible');
			document.body.click ();
		}

		toggle.ontouchend = function() {
			toggle.blur ();
			document.body.click ();
			bottomVisibility ('visible');
		}

		var appMgr = navigator.mozApps.mgmt;
		appMgr.addEventListener("install", function (event) {
			console.log(event.application);
			setTimeout (function() {
				updateAppCache();
			}, 2000);
		});
		appMgr.addEventListener("uninstall", function (event) {
			console.log(event.application);
			updateAppCache();
		});

	//	navigator.mozSettings.addObserver('wallpaper.image', updateWallpaper);
	//	updateWallpaper();
		updateAppCache();
	}, true);

	function renderFav(icon) {
		iconHash[icon.icon] = icon;
		return '<div class="bottom-tile"><img width="'+iconsize+'px" height="'+
			iconsize+ 'px" src="'+icon.icon+'" /></div>';
	}

	function renderApp(icon) {
		if (!icon.name)
			return "";
		var roundicon_str = "";
		if (roundicons) {
			roundicon_str = 'border-radius: 50%; background-position: 50%;'
		}
		//var str = '<img width="'+iconsize+'px" height="'+iconsize+ 'px" alt="..?.." src="'+icon.icon+'" />';
		var str = '<div style="margin:7px;display:inline-block;width:'+iconsize+'px;height:'+
				iconsize+'px;	'+roundicon_str+'background-image:url(\''+icon.icon+
				'\');background-size:'+iconsize+'px '+iconsize+'px;"></div>'
		var style='';
		switch (mode) {
		case 0:
			//str += '&nbsp;&nbsp;</a><br />';
			str += '<br />';
			break;
		case 2:
			style = "style='display:inline-block'";
			break;
		case 1:
			str += '&nbsp;&nbsp;'+icon.name+'<br />'; //'</a><br />';
			break;
		}
		iconHash[icon.icon] = icon;
		return "<div class=tile "+style+">"+str+"</div>";
	}

	var opened = [];
	var disableAppStart = false;
	var longpress = null;
	var touch_top = 0;
	var touch_y = 0;

	window.addEventListener('touchstart', function(te) {
		touch_top = document.body.scrollTop; // screen offset
		touch_x = te.changedTouches[0].pageX; // screen offset
		touch_y = te.changedTouches[0].pageY; // screen offset

		disableAppStart = false;
		/*
		if (longpress) {
			clearTimeout (longpress);
			longpress = null;
		}
		*/
		
		if (canDelete) {
			var icon = getIconFor (te.target);
			if (icon.app.removable) {
				longpress = setTimeout (function(e) {
				/*	clearTimeout (longpress);
					longpress = null;*/
					if (disableAppStart) {
						disableAppStart = false;
					//	return;
					}
				disableAppStart = true;
				var icon = getIconFor (te.target);
					var appMgr = navigator.mozApps.mgmt;
						appMgr.uninstall(icon.app);
					longpress = null;
				}, LONG_PRESS_TIMEOUT);
			}
		}
	});

	window.addEventListener('touchmove', function(e) {
		try {
			var cur_touch_y = e.changedTouches[0].pageY;
			if (Math.abs (cur_touch_y-touch_y)>10) {
				disableAppStart = true;
				if (longpress) {
					clearTimeout (longpress);
					longpress = null;
					return;
				}
			}
		} catch (err) {
		}
		try {
			var cur_touch_x = e.changedTouches[0].pageX;
			if (Math.abs (cur_touch_x-touch_x)>10) {
				disableAppStart = true;
				if (longpress) {
					clearTimeout (longpress);
					longpress = null;
					return;
				}
			}
		} catch (err) {
		}
		var cur_touch_top = document.body.scrollTop; // screen offset
		if (Math.abs (cur_touch_top-touch_top)>10) {
			disableAppStart = true;
			if (longpress) {
				clearTimeout (longpress);
				longpress = null;
			}
		}
		disableAppStart = true;
	});

	window.addEventListener('touchend', function(e) {
		
		if (longpress) {
			clearTimeout (longpress);
			longpress = null;
		}
		
			if (disableAppStart) {
				disableAppStart = false;
				return;
			}
			if (true) {
			var icon = getIconFor (e.target);
			if (icon) {
				document.body.focus ();
				writing = false;
				running = true;
				icon.launch();
				saveSettings();
				addFav(icon.name);
			}
		} else {
			longpress = null;
			disableAppStart = false;

			/* do nothing here just uninstall */
		}
	});

	function getIconFor (target) {
		var container = target
		if (container.src)
			return iconHash[container.src];
		if (container.style.backgroundImage) {
			var app = container.style.backgroundImage;
			app = app.replace('url("','');
			app = app.replace ('")','');
			return iconHash[app];
		}
		container = container.childNodes[0];
		if (container) {
		 if (container.src) {
			return iconHash[container.src];
		 }
			
	if (container.style.backgroundImage) {
		var app = container.style.backgroundImage;
		app = app.replace('url("','');
		app = app.replace ('")','');

			return iconHash[app];
		}
			//alert("UNKN");
		}
		return null;
	}

	window.addEventListener('hashchange', function() {
window.document.getElementById('apps').scrollTop = 0
		return false;
		/* Home button is pressed */
	      if (running) {
		      running = false;
		      return;
	      }
	      var needs_update = input.value != "";
	      topbarVisibility ('visible');
	      var element = document.querySelector(":focus");
	      if (element == input) {
		      input.value = "";
		      input.blur ();
		      if (mode != 0) {
			      bottomVisibility ('visible');
		      }
	      } else {
		      input.focus();
		      bottomVisibility ('hidden');
	      }
	      if (needs_update) {
		      updateApps();
	      }
	      document.body.scrollTo (0,0);
	      return false;
      });
}());
