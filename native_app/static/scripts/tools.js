/*
 * @Author: Antoine YANG 
 * @Date: 2020-08-03 19:52:10 
 * @Last Modified by: Kanata You
 * @Last Modified time: 2020-11-07 12:32:44
 */

const debounced = (f, time=100, final=false) => {
    let flag = true;

    let end = null;

    return function () {
        if (flag) {
            flag = false;
            setTimeout(() => {
                flag = true;
                if (final && end) {
                    end();
                    end = null;
                }
            }, time);
            
            return f.apply(this, arguments);
        } else if (final) {
            end = () => f.apply(this, arguments);
        }
    };
};

const exist = (...list) => {
    for (let i = 0; i < list.length; i++) {
        if (list[i] !== null && list[i] !== void 0) {
            if (typeof list[i] === "number" && isNaN(list[i])) {
                continue;
            }
            return list[i];
        }
    }
    return null;
};

const Check = {
    isPoint2dArray: val => {
        try {
            val.forEach(d => {
                if (Array.isArray(d)) {
                    if (d.length !== 2) {
                        throw -1;
                    }
                } else {
                    throw -2;
                }
            });
        } catch {
            return false;
        }
        return true;
    },
    isPath2dArray: val => {
        try {
            val.forEach(p => {
                p.forEach(d => {
                    if (Array.isArray(d)) {
                        if (d.length !== 2 && d.length !== 3) {
                            throw -1;
                        }
                    } else {
                        throw -2;
                    }
                });
            });
        } catch {
            return false;
        }
        return true;
    },
    isLng: lng => typeof lng === "number" && Math.abs(lng) <= 180,
    isLat: lat => typeof lat === "number" && Math.abs(lat) <= 90,
    isGeoPointArray: val => {
        try {
            val.forEach(d => {
                if (Array.isArray(d) && d.length < 2) {
                    throw -1;
                } else if (!Check.isLng(exist(d.lng, d[0])), !Check.isLat(exist(d.lat, d[1]))) {
                    throw -2;
                }
            });
        } catch {
            return false;
        }
        return true;
    },
    isGeoPathArray: val => {
        try {
            val.forEach(p => {
                p.forEach(d => {
                    if (Array.isArray(d) && d.length < 2) {
                        throw -1;
                    } else if (!Check.isLng(exist(d.lng, d[0])), !Check.isLat(exist(d.lat, d[1]))) {
                        throw -2;
                    }
                });
            });
        } catch {
            return false;
        }
        return true;
    },
};


const downloadCanvas = canvas => {
    const a = document.createElement("a");
    a.download = "";
    a.href = canvas.toDataURL({format: "image/png", quality:1, width:12000, height:4000});
    a.click();
    a.remove();
};
