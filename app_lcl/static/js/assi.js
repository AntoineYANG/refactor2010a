/*
 * @Author: Antoine YANG 
 * @Date: 2020-07-24 13:09:46 
 * @Last Modified by: Antoine YANG
 * @Last Modified time: 2020-08-10 13:06:53
 */

const make = (tag, attr, style, text) => {
    const e = tag.startsWith("svg.")
        ? document.createElementNS("http://www.w3.org/2000/svg", tag.substring(4))
        : document.createElement(tag);
    if (tag.startsWith("svg.")) {
        e.isSvgElement = true;
    }
    if (attr) {
        for (const key in attr) {
            if (attr.hasOwnProperty(key)) {
                const val = attr[key];
                if (tag.startsWith("svg.")) {
                    if (key === "innerHTML") {
                        $(e).html(val)
                    } else if (key.startsWith("on")) {
                        $(e).on(key.substring(2), attr[key]);
                    } else {
                        $(e).attr(key, val);
                    }
                } else {
                    e[key] = val;
                }
            }
        }
    }
    if (style) {
        let s = "";
        for (const key in style) {
            if (style.hasOwnProperty(key)) {
                const val = style[key];
                s += `${ key }: ${ val }; `
            }
        }
        if (s) {
            e.style = s;
        }
    }
    if (text) {
        e.innerText = text;
    }

    return e;
};

const update = (e, attr, style, text) => {
    if (attr) {
        for (const key in attr) {
            if (attr.hasOwnProperty(key)) {
                const val = attr[key];
                if (e.isSvgElement) {
                    if (key === "innerHTML") {
                        $(e).html(val)
                    } else if (key.startsWith("on")) {
                        $(e).on(key.substring(2), attr[key]);
                    } else {
                        $(e).attr(key, val);
                    }
                } else {
                    e[key] = val;
                }
            }
        }
    }
    if (style) {
        let s = "";
        for (const key in style) {
            if (style.hasOwnProperty(key)) {
                const val = style[key];
                s += `${ key }: ${ val }; `
            }
        }
        if (s) {
            e.style = s;
        }
    }
    if (text) {
        e.innerText = text;
    }
};

const solveNode = (p, n, r) => {
    if (n.hasOwnProperty('<call>')) {
        if (n.id !== void 0 && r.hasOwnProperty(n.id)) {
            // ?
            use(n, p);
        } else {
            use(n, p);
        }
    } else {
        if (n.id !== void 0 && r.hasOwnProperty(n.id)) {
            update(r[n.id], n.attr, n.style, n.text);
        } else {
            const e = make(n.tag, n.attr, n.style, n.text);
            r[n.id] = e;
            p.appendChild(e);
        }
    }
};

const createNode = (p, s) => {
    const e = {
        '<props>': p,
        '<state>': s,
        '<refs>': {},
        '<call>': pn => {
            const c = e['<render>'](pn);
            let prevRefs = {};
            for (const id in e["<refs>"]) {
                if (e["<refs>"].hasOwnProperty(id)) {
                    prevRefs[id] = true;
                }
            }
            if (Array.isArray(c)) {
                c.forEach(d => {
                    if (!d) {
                        return;
                    }
                    prevRefs[d.id] = false;
                    const parent = (typeof d.parent === "number" || typeof d.parent === "string"
                        ? e.find(d.parent) : d.parent) || pn || e["<parent>"];
                    solveNode(parent, d, e['<refs>']);
                });
            } else if (c) {
                prevRefs[c.id] = false;
                const parent = (typeof c.parent === "number" || typeof c.parent === "string"
                    ? e.find(c.parent) : c.parent) || pn || e["<parent>"];
                solveNode(parent, c, e['<refs>']);
            }
            Object.keys(prevRefs).forEach(ref => {
                if (prevRefs[ref]) {
                    e["<refs>"][ref].remove();
                    delete e["<refs>"][ref];
                }
            });
            e['<next>'](pn);
            e['<parent>'] = pn;
        },
        '<render>': _pn => {
            throw "Method not overriden";
        },
        '<next>': _pn => {},
        '<parent>': null,
        render: f => {
            e["<render>"] = f;
            return e;
        },
        next: f => {
            e["<next>"] = f;
            return e;
        },
        find: id => e["<refs>"][id],
        update: debounced(s => {
            if (!e['<state>']) {
                e['<state>'] = {};
            }
            for (const key in s) {
                if (s.hasOwnProperty(key)) {
                    const val = s[key];
                    e['<state>'][key] = val;
                }
            }
            e['<call>'](e['<parent>']);
        }, 50, true)
    };
    
    return e;
}

const use = (Q, P) => {
    Q['<call>'](P);
};

const buildMap = (option, containerID, accessToken, styleURL, onload) => {
    mapboxgl.accessToken = accessToken;

    const map = new mapboxgl.Map({
        attributionControl: false,
        bearing: 0,
        center: option.center || [120.15, 30.28],
        container: containerID,
        dragRotate: false,
        interactive: true,
        maxBounds: undefined,
        maxZoom: option.maxZoom || 15,
        minZoom: option.minZoom || 8,
        pitch: 0,
        pitchWithRotate: false,
        refreshExpiredTiles: false,
        style: styleURL || 'mapbox://styles/mapbox/streets-v10',
        zoom: option.zoom || 12
    });

    map.on('zoomend', () => {
        if (W["<parent>"]) {
            W.update({
                charts: [...G["<state>"].list.filter(d => d.ref['<state>'].active)]
            });
            if (map.owner) {
                map.owner["<state>"].snapshots.zoom = map.getZoom();
            }
        }
    }).on('dragend', () => {
        if (W["<parent>"]) {
            W.update({
                charts: [...G["<state>"].list.filter(d => d.ref['<state>'].active)]
            });
            if (map.owner) {
                map.owner["<state>"].snapshots.center = [
                    map.getCenter().lng,
                    map.getCenter().lat
                ];
            }
        }
    });

    if (onload) {
        map.on('load', () => {
            onload(map);
        });
    }

    return map;
};
