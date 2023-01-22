// https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths
// L Q C {B}
const P = (x, y) => {
    return { x, y };
};
const L = "L", Q = "Q", C = "C", B = "B";
const validatePath = (path) => {
    const n = path.length;
    if (n === 0)
        return true;
    if (typeof path[0] === "string")
        return false;
    for (let i = 1; i < n; i++) {
        if (typeof path[i] !== "string")
            return false;
        if (path[i] === "L") {
            if (i + 1 >= n || typeof path[i + 1] === "string")
                return false;
            i++;
        }
        else if (path[i] === "B") {
            if (i + 1 != n && typeof path[i + 1] === "string")
                return false;
            i++;
        }
        else if (path[i] === "Q") {
            if (i + 2 >= n ||
                typeof path[i + 1] === "string" ||
                typeof path[i + 2] === "string")
                return false;
            i += 2;
        }
        else if (path[i] === "C") {
            if (i + 3 >= n ||
                typeof path[i + 1] === "string" ||
                typeof path[i + 2] === "string" ||
                typeof path[i + 3] === "string")
                return false;
            i += 3;
        }
    }
    return true;
};
const reversePath = (path) => {
    const n = path.length - 1;
    let res = Array(n + 1);
    for (let i = 0; i <= n; i++) {
        const v = path[i];
        if (v === "Q") {
            res[n - i] = path[i + 1];
            i++;
            res[n - i] = v;
        }
        else if (v === "C") {
            res[n - i] = path[i + 2];
            i++;
            res[n - i] = path[i + 1];
            i++;
            res[n - i] = v;
        }
        else {
            res[n - i] = v;
        }
    }
    return res;
};
const translatePath = (path, by) => path.map((v) => typeof v === "string" ? v : { x: v.x + by.x, y: v.y + by.y });
const reflectPath = (path, orientation) => {
    switch (orientation) {
        case "H":
            return path.map((v) => (typeof v === "string" ? v : { x: -v.x, y: v.y }));
        case "V":
            return path.map((v) => (typeof v === "string" ? v : { x: v.x, y: -v.y }));
        case "B":
            return path.map((v) => typeof v === "string" ? v : { x: -v.x, y: -v.y });
    }
};
// Naive implementation of AABB (doesn't respect curves)
const getPathAABB = (path) => {
    let l = Infinity, r = -Infinity, t = Infinity, b = -Infinity;
    for (let v of path) {
        if (typeof v !== "string") {
            l = Math.min(v.x, l);
            r = Math.max(v.x, r);
            t = Math.min(v.y, t);
            b = Math.max(v.y, b);
        }
    }
    return { l, r, t, b, w: r - l, h: b - t };
};
const renderPath = (path) => {
    let d = "M";
    for (let v of path) {
        if (v === "B")
            d += " " + "L";
        else if (typeof v === "string")
            d += " " + v;
        else
            d += ` ${v.x} ${v.y}`;
    }
    d += " Z";
    return d;
};
const indexPathBs = (path) => {
    let res = [];
    path.forEach((v, i) => v === "B" && res.push(i));
    return res;
};
const extractPoints = (path) => path.filter((v) => typeof v !== "string");
