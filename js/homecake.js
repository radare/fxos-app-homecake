(function() {
    /* modes

     */

    var parallax = false;
    var normalfavs = [
        'Camera',
        'Settings',
        'Phone',
        'Music',
    ];
    var minifavs = [
        'Camera',
        'Settings',
        'Phone',
        'Music',
        'Marketplace',
        'Contacts'
    ];
    var mode = 1;
    var apps = document.getElementById('apps');
    var bottom = document.getElementById('bottom');
    var topbar = document.getElementById('topbar');
    var input = document.getElementById('input');
    var bottom;
    var iconsize = 64;
    var iconMap = new WeakMap();
    var writing = false;

    /*
     * auxiliary functions
     *
     */

    function show_bottom() {
        bottom.style.visibility = 'visible';
    }

    function hide_bottom() {
        bottom.style.visibility = 'hidden';
    }

    function hide_topbar() {
        topbar.style.visibility = 'hidden';
    }

    function show_topbar() {
        topbar.style.visibility = 'visible';
    }


    /*
     * end auxiliary functions
     *
     */



    function useMode(m) {

        if (m == -1) {
            if (++mode > 3) mode = 0;
        } else {
            mode = m;
        }


        switch (mode) {
            case 0:
                iconsize = 290;
                if (bottom) hide_bottom();
                toggle.innerHTML = "&nbsp;=&nbsp;";
                break;
            case 1:
                //favs for normal mode
                favs = normalfavs;

                iconsize = 64;
                if (bottom) show_bottom();
                toggle.innerHTML = "&nbsp;-&nbsp;";
                break;
            case 2:
                //favs in dock for miniicons
                favs = minifavs;

                iconsize = 32;
                if (bottom) show_bottom();
                toggle.innerHTML = "&nbsp;▒&nbsp;";
                break;
            case 3:
                if (bottom) hide_bottom();

                iconsize = 48;
                toggle.innerHTML = "&nbsp;+&nbsp;";
                break;
        }


        apps.setAttribute("class", (3 == mode)? "grid_container": "tile");

        updateApps();
        updateFavs();
    }
    useMode(mode);

    function addFav(name) {
        if (favs.indexOf(name) != -1)
            return;
        var newfavs = [name];
        for (i = 0; i < (favs.length -1); i++) {
            newfavs[newfavs.length] = favs[i];
        }
        favs = newfavs;
        updateFavs();
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

    function updateAppCache() {
        iconMap = new WeakMap();
        icons = [];
        input.value = "";
        FxosApps.all().then(icns => {
            icns.forEach(icon => {
                var min = Math.min(icns.length, 6);
                icons[icons.length] = icon;
                if (icons.length == min) {
                    updateApps();
                }
            })
        }).then(foo => {
            updateFavs();
            updateApps();
        });
    }

    function updateFavs() {
        bottom.innerHTML = "";
        for (var idx in icons) {
            var icon = icons[idx];
            if (favs.indexOf(icon.name) != -1)
                renderFav(icon);
        }
    }

    function updateApps() {
        var filter = input.value;
        if (input.value.length < 1) filter = "";
        apps.innerHTML = "";
        for (var idx in icons) {
            var icon = icons[idx];
            if (filter == "" || icon.name.toLowerCase().indexOf(filter.toLowerCase()) != -1) {
                if ( 3 != mode) {
                    renderApp(icon);
                }else{
                    renderApp4Grid(icon);
                }
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
        window.addEventListener("scroll", function() {
            if (parallax) {
                var wh = document.body.height; // document size
                var y = document.body.scrollTop; // screen offset
                var h = document.body.clientHeight; // screen size
                wh = 8500;
                var miny = 0;
                var maxy = 1024 - h; // h-wh;

                var delta = maxy * (y / wh); //(maxy - y);
                //console.log(maxy, wh, y, h, "=", delta);
                // parallax
                if (delta != odelta) {
                    document.getElementById('wallpaper').style['background-position'] = "0px -" + delta + "px";
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
                    if (y + 16 > odelta) {
                        if (topbar) hide_topbar();
                        if (bottom) hide_bottom();
                    }
                } else {
                    // scrollup
                    if (y + 16 < odelta) {
                        if (topbar) show_topbar();
                        if (mode > 0 && mode < 3) {
                            if (bottom) show_bottom();
                        }
                    }
                }
                odelta = y;
            }
        }, true);
        document.body.onfocus = function() {
            writing = false;
        }
        input.onfocus = function() {
            writing = true;
            hide_bottom();
            toggle.innerHTML = "&nbsp;-&nbsp;";
        }
        input.onblur = function() {
            show_bottom();
            writing = false;

            if (mode) {
                if (mode == 1) toggle.innerHTML = "&nbsp;-&nbsp;";
                if (mode == 2) toggle.innerHTML = "&nbsp;+&nbsp;";
                if (mode == 3) toggle.innerHTML = "&nbsp;▒&nbsp;";
            } else {
                toggle.innerHTML = "&nbsp;=&nbsp;";
            }
        }
        toggle.onclick = function() {
            if (mode == 0) {
                if (bottom) hide_bottom();
            }
            if (mode == 2) {
                if (bottom) bottom.style.height = '80px';
            }
            if (mode == 1) {
                if (bottom) bottom.style.height = '50px';
            }
            if (writing) { // this.innerHTML.indexOf("-") != -1) {
                writing = false;
            } else {
                useMode(-1);
            }
            document.body.focus();
        }

        /*
                let appMgr = navigator.mozApps.mgmt;
                appMgr.oninstall = populate;
                appMgr.onuninstall = populate;
                populate();
        */

        navigator.mozSettings.addObserver('wallpaper.image', updateWallpaper);
        updateWallpaper();
        updateAppCache();
    }, true);



    function renderIcon(icon) {
        var appEl = document.createElement('div');
        appEl.className = 'tile';
        appEl.innerHTML = '<div class="wrapper"><div class="back" style="background-image: url(' + icon.icon + ');"></div><div class="front"></div></div>';
        iconMap.set(appEl, icon);
        apps.appendChild(appEl);
    }

    function renderFav(icon) {
        var appEl = document.createElement('div');
        appEl.className = 'bottom-tile';
        appEl.innerHTML = '<a href="#"><img width="' + iconsize + 'px" height="' + iconsize +
            'px" src="' + icon.icon + '"></a>';
        iconMap.set(appEl, icon);
        bottom.appendChild(appEl);
    }

    function my_div(my_class) {
        var appEl = document.createElement('div');
        appEl.className = my_class;
        return appEl;
    }

    function renderApp(icon) {
        var appEl = document.createElement('div');
        appEl.className = 'tile';
        //appEl.innerHTML = '<div class="wrapper"><div class="back" style="background-image: url(' + icon.icon + ');">'+
        //  icon.name+'</div><div class="front"></div>JAJAJAJAJ</div>';
        appEl.innerHTML = '<a href="#"><img width="' + iconsize + 'px" height="' + iconsize +
            'px" src="' + icon.icon + '">';
        switch (mode) {
            case 0:
                appEl.innerHTML += '&nbsp;&nbsp;</a><br />';
                break;
            case 1:
                appEl.innerHTML += '&nbsp;&nbsp;' + icon.name + '</a><br />';
                break;
            case 2:
                appEl.innerHTML += '&nbsp;&nbsp;<span class="cute">' + icon.name + '</span></a><br />';
                break;
        }
        iconMap.set(appEl, icon);
        apps.appendChild(appEl);
    }

    var n = 0;
    function renderApp4Grid(icon) {

        if (n > icons.length){
            n = 0;
        }else{
            n++;
        }

        var o = my_div("grid");

        o.innerHTML = '<a href="#"><img width="' + iconsize + 'px" height="' + iconsize +
            'px" src="' + icon.icon + '">&nbsp;&nbsp;</a>';

        iconMap.set(o, icon);
        apps.appendChild(o);

    }

    var opened = [];

    window.addEventListener('click', function(e) {
        var container = e.target
        var icon = iconMap.get(container);
        if (!icon) {
            container = container.parentNode.parentNode;
            icon = iconMap.get(container);
        }
        if (icon) {
            writing = false;
            document.body.focus();
            icon.launch();
            addFav(icon.name);
            input.value = "";
            updateApps();
        }
    });
}());
