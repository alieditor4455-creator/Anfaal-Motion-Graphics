/*  Anfaal Builder — After Effects 2026 (ExtendScript)
    Builds a fully editable comp from a reel JSON exported by tools/ae/export_reel.mjs.

    Run:  File > Scripts > Run Script File… > AnfaalBuilder.jsx
          (or install into Scripts/ScriptUI Panels for a dockable panel — see README.md)
    1) Paste the JSON (or click "Load .json…")   2) Pick the reel's media folder   3) Build

    Everything is created as normal AE layers: text stays editable, timings are keyframes,
    shapes are shape layers, full screens are precomps. Any single feature that fails is skipped
    and listed in the report at the end, so one problem never stops the whole build.
*/
(function AnfaalBuilder(thisObj) {
    var SCRIPT = "Anfaal Builder";
    var report = [];
    function warn(msg) { report.push(msg); }

    /* ------------------------------------------------------------ helpers */
    function parseJSON(txt) {
        txt = String(txt).replace(/^﻿/, "");
        if (typeof JSON !== "undefined" && JSON.parse) return JSON.parse(txt);
        return eval("(" + txt + ")"); // ExtendScript fallback (file comes from our own exporter)
    }
    function hex(c) {
        if (c instanceof Array) return c;
        c = String(c).replace("#", "");
        if (c.length === 3) c = c.charAt(0) + c.charAt(0) + c.charAt(1) + c.charAt(1) + c.charAt(2) + c.charAt(2);
        return [parseInt(c.substr(0, 2), 16) / 255, parseInt(c.substr(2, 2), 16) / 255, parseInt(c.substr(4, 2), 16) / 255];
    }
    function color(spec, P) { return hex(P && P[spec] ? P[spec] : spec); }
    function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
    function safe(label, fn) {
        try { return fn(); } catch (e) { warn(label + ": " + e.toString() + (e.line ? " (line " + e.line + ")" : "")); return null; }
    }
    function ease(prop, keyIdxs, influence) {
        // smooth ease in/out on the given keyframes (glide, no overshoot)
        for (var i = 0; i < keyIdxs.length; i++) {
            var k = keyIdxs[i];
            try {
                var dims = prop.value instanceof Array ? prop.value.length : 1;
                if (prop.propertyValueType === PropertyValueType.TwoD_SPATIAL || prop.propertyValueType === PropertyValueType.ThreeD_SPATIAL) dims = 1;
                var e = [];
                for (var d = 0; d < dims; d++) e.push(new KeyframeEase(0, influence || 75));
                prop.setTemporalEaseAtKey(k, e, e);
            } catch (err) { /* hold/unsupported key types are fine as linear */ }
        }
    }
    function keyset(prop, pairs, infl) {
        // pairs: [[time, value], ...]
        var idx = [];
        for (var i = 0; i < pairs.length; i++) { prop.setValueAtTime(pairs[i][0], pairs[i][1]); }
        for (var j = 1; j <= prop.numKeys; j++) idx.push(j);
        ease(prop, idx, infl);
    }
    function findFile(folder, rel) {
        if (!rel) return null;
        var f = new File(folder.fsName + "/" + rel);
        if (f.exists) return f;
        warn("missing media: " + rel);
        return null;
    }
    var importCache = {};
    function importItem(folder, rel, parentFolder) {
        if (importCache[rel]) return importCache[rel];
        var f = findFile(folder, rel);
        if (!f) return null;
        var item = safe("import " + rel, function () {
            var io = new ImportOptions(f);
            var it = app.project.importFile(io);
            if (parentFolder) it.parentFolder = parentFolder;
            return it;
        });
        if (item) importCache[rel] = item;
        return item;
    }
    function setFont(td, name) { if (!name) return; try { td.font = name; } catch (e) { warn("font not installed: " + name + " (using default)"); } }

    /* ------------------------------------------------------------ text + shapes */
    function addText(comp, str, o, P, F) {
        var lyr = comp.layers.addText(str);
        var tp = lyr.property("ADBE Text Properties").property("ADBE Text Document");
        var td = tp.value;
        td.resetCharStyle();
        td.fontSize = o.size || 48;
        setFont(td, o.font || F.body);
        td.fillColor = color(o.color || "white", P);
        td.applyFill = true;
        td.applyStroke = false;
        td.justification = ParagraphJustification.CENTER_JUSTIFY;
        if (o.tracking !== undefined) td.tracking = o.tracking;
        if (o.caps) td.allCaps = true;
        tp.setValue(td);
        lyr.name = o.name || str.substr(0, 28);
        // centre the anchor on the text box so position = visual centre
        safe("anchor " + lyr.name, function () {
            var r = lyr.sourceRectAtTime(0, false);
            lyr.property("ADBE Transform Group").property("ADBE Anchor Point").setValue([r.left + r.width / 2, r.top + r.height / 2]);
        });
        lyr.property("ADBE Transform Group").property("ADBE Position").setValue([o.x === undefined ? comp.width / 2 : o.x, o.y]);
        return lyr;
    }
    function addRect(comp, o, P) {
        // rounded rectangle shape layer (glass card / pill / button / needle)
        var lyr = comp.layers.addShape();
        lyr.name = o.name || "Rect";
        var root = lyr.property("ADBE Root Vectors Group");
        var grp = root.addProperty("ADBE Vector Group");
        grp.name = "Box";
        var vecs = grp.property("ADBE Vectors Group");
        var rect = vecs.addProperty("ADBE Vector Shape - Rect");
        rect.property("ADBE Vector Rect Size").setValue([o.w, o.h]);
        rect.property("ADBE Vector Rect Roundness").setValue(o.radius === undefined ? Math.min(o.w, o.h) / 2 : o.radius);
        if (o.anchorBottom) rect.property("ADBE Vector Rect Position").setValue([0, -o.h / 2]);
        if (o.fill) {
            var fill = vecs.addProperty("ADBE Vector Graphic - Fill");
            fill.property("ADBE Vector Fill Color").setValue(color(o.fill, P));
            fill.property("ADBE Vector Fill Opacity").setValue(o.fillOpacity === undefined ? 100 : o.fillOpacity);
        }
        if (o.stroke) {
            var st = vecs.addProperty("ADBE Vector Graphic - Stroke");
            st.property("ADBE Vector Stroke Color").setValue(color(o.stroke, P));
            st.property("ADBE Vector Stroke Width").setValue(o.strokeWidth || 2);
            st.property("ADBE Vector Stroke Opacity").setValue(o.strokeOpacity === undefined ? 40 : o.strokeOpacity);
        }
        var tr = lyr.property("ADBE Transform Group");
        tr.property("ADBE Position").setValue([o.x === undefined ? comp.width / 2 : o.x, o.y]);
        if (o.rot) tr.property("ADBE Rotate Z").setValue(o.rot);
        if (o.shadow !== false) safe("shadow " + lyr.name, function () {
            var ds = lyr.property("ADBE Effect Parade").addProperty("ADBE Drop Shadow");
            ds.property("ADBE Drop Shadow-0002").setValue(o.glow ? 0 : 55); // opacity handled below
            ds.property("ADBE Drop Shadow-0003").setValue(180);
            ds.property("ADBE Drop Shadow-0004").setValue(o.glow ? 0 : 24);
            ds.property("ADBE Drop Shadow-0005").setValue(o.glow ? 40 : 50);
            if (o.glow) { ds.property("ADBE Drop Shadow-0001").setValue(color(o.glow, P)); ds.property("ADBE Drop Shadow-0002").setValue(60); }
        });
        return lyr;
    }
    /** glide in (ease-out, rise + blur) at `at`, glide out (ease-in, lift + blur) at `out` — Forex Premium motion */
    function glide(lyr, at, out, rise) {
        rise = rise === undefined ? 40 : rise;
        var tr = lyr.property("ADBE Transform Group");
        var pos = tr.property("ADBE Position");
        var p0 = pos.value;
        var op = tr.property("ADBE Opacity");
        var inT = 0.6, outT = 0.47;
        var pairsP = [[at, [p0[0], p0[1] + rise]], [at + inT, p0]];
        var pairsO = [[at, 0], [at + inT, 100]];
        if (out !== null && out !== undefined && out > at + inT + 0.05) {
            pairsP.push([out - outT, p0]); pairsP.push([out, [p0[0], p0[1] - 30]]);
            pairsO.push([out - outT, 100]); pairsO.push([out, 0]);
        }
        keyset(pos, pairsP, 80);
        keyset(op, pairsO, 70);
        safe("blur " + lyr.name, function () {
            var b = lyr.property("ADBE Effect Parade").addProperty("ADBE Gaussian Blur 2");
            b.name = "Glide blur";
            var bl = b.property("ADBE Gaussian Blur 2-0001");
            var pb = [[at, 16], [at + inT, 0]];
            if (out !== null && out !== undefined && out > at + inT + 0.05) { pb.push([out - outT, 0]); pb.push([out, 16]); }
            keyset(bl, pb, 70);
            b.property("ADBE Gaussian Blur 2-0003").setValue(1); // repeat edge pixels
        });
        lyr.inPoint = Math.max(0, at);
        if (out !== null && out !== undefined) lyr.outPoint = out;
    }

    /* ------------------------------------------------------------ building blocks */
    function twoTier(comp, k, P, F) {
        var tone = { hue: "hue", gold: "gold", red: "red", white: "white" }[k.tone || "hue"];
        var lead = addText(comp, String(k.lead).toUpperCase(), { y: k.y, size: Math.round(30 * (k.scale || 1)), font: F.label, color: "soft", tracking: 400, name: "KW lead · " + k.lead }, P, F);
        var key = addText(comp, String(k.key).toUpperCase(), { y: k.y + Math.round(95 * (k.scale || 1)), size: Math.round(150 * (k.scale || 1)), font: F.head, color: tone, tracking: 10, name: "KW · " + k.key }, P, F);
        safe("glow " + k.key, function () {
            var g = key.property("ADBE Effect Parade").addProperty("ADBE Drop Shadow");
            g.property("ADBE Drop Shadow-0001").setValue(color(tone, P));
            g.property("ADBE Drop Shadow-0002").setValue(45);
            g.property("ADBE Drop Shadow-0004").setValue(0);
            g.property("ADBE Drop Shadow-0005").setValue(28);
        });
        glide(lead, k.t, k.to, 18);
        glide(key, k.t + 0.12, k.to, 34);
        return [lead, key];
    }
    function caption(comp, c, P, F) {
        var words = c.words, str = "";
        for (var i = 0; i < words.length; i++) str += (i ? " " : "") + words[i].w;
        var txt = addText(comp, str, { y: c.y, size: 44, font: F.body, color: "white", name: "CAP · " + str.substr(0, 24) }, P, F);
        // hot words in brand colour (AE 2024+ per-character styling)
        safe("hot words " + str.substr(0, 16), function () {
            var tp = txt.property("ADBE Text Properties").property("ADBE Text Document");
            var td = tp.value, pos = 0;
            for (var i = 0; i < words.length; i++) {
                if (words[i].hot) {
                    var cr = td.characterRange(pos, pos + words[i].w.length);
                    cr.fillColor = color(words[i].hot === "red" ? "red" : "hue", P);
                }
                pos += words[i].w.length + 1;
            }
            tp.setValue(td);
        });
        // word-by-word highlight: unspoken words dimmed (Opacity animator driven by the word times)
        safe("word highlight " + str.substr(0, 16), function () {
            var anims = txt.property("ADBE Text Properties").property("ADBE Text Animators");
            var an = anims.addProperty("ADBE Text Animator");
            an.name = "Word highlight";
            an.property("ADBE Text Animator Properties").addProperty("ADBE Text Opacity").setValue(42);
            var sel = an.property("ADBE Text Selectors").addProperty("ADBE Text Selector");
            var adv = sel.property("ADBE Text Range Advanced");
            adv.property("ADBE Text Range Units").setValue(2);  // index
            adv.property("ADBE Text Range Type2").setValue(3);  // words
            var times = [];
            for (var i = 0; i < words.length; i++) times.push(words[i].t0.toFixed(3));
            sel.property("ADBE Text Index Start").expression = "var t=[" + times.join(",") + "];var n=0;for(var i=0;i<t.length;i++){if(time>=t[i])n=i+1;}n;";
            sel.property("ADBE Text Index End").setValue(words.length);
        });
        // pill behind
        var r = safe("caption box", function () { return txt.sourceRectAtTime(c.t0, false); });
        var pill = addRect(comp, { name: "CAP box", w: (r ? r.width : 600) + 60, h: 78, radius: 22, x: comp.width / 2, y: c.y, fill: "pill", fillOpacity: 72, stroke: "hue", strokeOpacity: 14, strokeWidth: 1.5, shadow: false }, P);
        pill.moveAfter(txt);
        var t0 = Math.max(0, c.t0 - 0.05), t1 = c.t1;
        txt.inPoint = pill.inPoint = t0; txt.outPoint = pill.outPoint = t1;
        var ps = [txt, pill];
        for (var j = 0; j < 2; j++) {
            var op = ps[j].property("ADBE Transform Group").property("ADBE Opacity");
            keyset(op, [[t0, 0], [t0 + 0.2, 100], [Math.max(t0 + 0.25, t1 - 0.13), 100], [t1, 0]], 60);
        }
        return ps;
    }
    function item(comp, it, P, F, media, base) {
        var at = (it.at || 0), out = it.out === undefined ? null : it.out;
        var L = null;
        if (it.type === "image") {
            var src = importItem(media, it.file, base.mediaFolder);
            if (!src) return;
            L = comp.layers.add(src);
            L.name = it.name || it.file;
            var sc = it.w ? (it.w / src.width) * 100 : 100;
            L.property("ADBE Transform Group").property("ADBE Scale").setValue([sc, sc]);
            L.property("ADBE Transform Group").property("ADBE Position").setValue([it.x, it.y]);
            if (it.rot) L.property("ADBE Transform Group").property("ADBE Rotate Z").setValue(it.rot);
            if (it.opacity !== undefined) L.property("ADBE Transform Group").property("ADBE Opacity").setValue(it.opacity);
            if (it.frame !== false) {
                var fr = addRect(comp, { name: (it.name || it.file) + " · frame", w: it.w + 24, h: (src.height * sc / 100) + 24, radius: 30, x: it.x, y: it.y, rot: it.rot, fill: "glass", fillOpacity: 60, stroke: "hue", strokeOpacity: 28 }, P);
                fr.moveAfter(L);
                if (it.glide !== false) glide(fr, at, out, it.rise);
            }
        } else if (it.type === "label") {
            L = addText(comp, it.text, { x: it.x, y: it.y, size: it.size || 24, font: F.label, color: it.color || "soft", tracking: 600, caps: true, name: "Label · " + it.text }, P, F);
        } else if (it.type === "title") {
            twoTier(comp, { t: at, to: out, lead: it.lead, key: it.key, tone: it.tone, y: it.y, scale: it.scale || 0.8 }, P, F);
            return;
        } else if (it.type === "text") {
            L = addText(comp, it.text, { x: it.x, y: it.y, size: it.size || 60, font: it.font === "head" ? F.head : it.font === "mono" ? F.mono : F.body, color: it.color || "white", name: it.name || ("Text · " + it.text) }, P, F);
        } else if (it.type === "pill" || it.type === "button" || it.type === "card") {
            var isBtn = it.type !== "card";
            var tx = addText(comp, it.text || "", { x: it.x, y: it.y, size: it.size || (isBtn ? 50 : 60), font: F.head, color: it.textColor || (isBtn ? "#03140B" : "white"), tracking: 60, name: (it.type) + " text · " + (it.text || "") }, P, F);
            var r = safe("measure " + it.text, function () { return tx.sourceRectAtTime(0, false); });
            var bx = addRect(comp, { name: it.type + " · " + (it.text || ""), w: it.w || ((r ? r.width : 400) + (isBtn ? 110 : 80)), h: it.h || (isBtn ? 100 : 160), radius: it.radius === undefined ? (isBtn ? 999 : 40) : it.radius, x: it.x, y: it.y, fill: it.fill || (isBtn ? "hue" : "glass"), fillOpacity: isBtn ? 100 : 70, stroke: isBtn ? null : "hue", strokeOpacity: 25, glow: isBtn ? "hue" : null }, P);
            bx.moveAfter(tx);
            if (it.glide !== false) { glide(bx, at, out, it.rise); glide(tx, at, out, it.rise); }
            if (it.sub) { var sb = addText(comp, it.sub, { x: it.x, y: it.y - (it.h || 160) / 2 - 30, size: 24, font: F.label, color: "soft", tracking: 600, caps: true, name: "sub · " + it.sub }, P, F); glide(sb, at, out); }
            return;
        } else if (it.type === "counter") {
            L = addText(comp, "0", { x: it.x, y: it.y, size: it.size || 150, font: F.head, color: it.color || "hue", name: "Counter · " + (it.name || "") }, P, F);
            var tpc = L.property("ADBE Text Properties").property("ADBE Text Document");
            tpc.expression = "var v=Math.round(linear(time," + (it.countAt || at) + "," + ((it.countAt || at) + (it.dur || 1.6)) + "," + it.from + "," + it.to + "));"
                + "var s=Math.abs(v).toString().replace(/\\B(?=(\\d{3})+(?!\\d))/g,',');"
                + "'" + (it.prefix || "") + "'+(v<0?'−':'" + (it.plus ? "+" : "") + "')+'" + (it.unit || "") + "'+s+'" + (it.suffix || "") + "';";
            safe("counter anchor", function () { L.property("ADBE Transform Group").property("ADBE Anchor Point").expression = "var r=sourceRectAtTime(time,false);[r.left+r.width/2,r.top+r.height/2];"; });
        } else if (it.type === "needle") {
            L = addRect(comp, { name: it.name || "Needle", w: it.wid || 10, h: it.len || 260, radius: 5, x: it.x, y: it.y, fill: it.color || "white", anchorBottom: true, shadow: false }, P);
            var rz = L.property("ADBE Transform Group").property("ADBE Rotate Z");
            var pr = [];
            for (var q = 0; q < it.keys.length; q++) pr.push([it.keys[q][0], it.keys[q][1]]);
            keyset(rz, pr, 70);
        } else if (it.type === "rect") {
            L = addRect(comp, it, P);
        }
        if (L && it.glide !== false) glide(L, at, out, it.rise);
    }
    function shutter(comp, t, P) {
        var hf = 7 / comp.frameRate, H = comp.height, W = comp.width;
        var mk = function (top) {
            var s = comp.layers.addSolid(color("bg", P), "Shutter " + (top ? "top" : "bottom") + " @" + t.toFixed(2) + "s", W + 40, Math.round(H / 2) + 40, 1, hf * 2 + 0.05);
            var pos = s.property("ADBE Transform Group").property("ADBE Position");
            var off = top ? -H / 4 - 20 : H + H / 4 + 20;
            var on = top ? H / 4 - 10 : H - H / 4 + 10;
            s.startTime = t - hf;
            keyset(pos, [[t - hf, [W / 2, off]], [t, [W / 2, on]], [t + hf, [W / 2, off]]], 60);
            return s;
        };
        mk(true); mk(false);
    }

    /* ------------------------------------------------------------ build */
    function build(spec, media) {
        report = []; importCache = {};
        var P = spec.palette || {};
        if (!P.soft) P.soft = "#BFC8C2";
        if (!P.glass) P.glass = "#0E2A1C";
        if (!P.pill) P.pill = "#06120C";
        if (!P.bg) P.bg = "#030A06";
        var F = spec.fonts || {};
        var W = spec.width || 1080, H = spec.height || 1920, fps = spec.fps || 30, D = spec.duration;

        app.beginUndoGroup(SCRIPT);
        var root = app.project.items.addFolder(spec.name || "Anfaal reel");
        var base = { mediaFolder: app.project.items.addFolder("Media"), precomps: app.project.items.addFolder("Full screens") };
        base.mediaFolder.parentFolder = root; base.precomps.parentFolder = root;
        var comp = app.project.items.addComp(spec.name || "Anfaal reel", W, H, 1, D, fps);
        comp.parentFolder = root;
        comp.bgColor = color("bg", P);

        // 1) background world
        safe("background", function () {
            var bg = spec.background || {};
            comp.layers.addSolid(color("bg", P), "BG colour", W, H, 1, D);
            if (bg.file) {
                var it = importItem(media, bg.file, base.mediaFolder);
                if (it) {
                    var L = comp.layers.add(it);
                    L.name = "BG · chart wall";
                    L.property("ADBE Transform Group").property("ADBE Opacity").setValue(bg.opacity === undefined ? 90 : bg.opacity);
                    if (bg.from && bg.to) keyset(L.property("ADBE Transform Group").property("ADBE Position"), [[0, bg.from], [D, bg.to]], 33);
                    L.outPoint = D;
                }
            }
        });
        // 2) speaker segments (cuts applied, jump-cut punch)
        safe("speaker", function () {
            var sp = spec.speaker;
            if (!sp) return;
            var it = importItem(media, sp.file, base.mediaFolder);
            if (!it) return;
            for (var i = 0; i < sp.segments.length; i++) {
                var s = sp.segments[i];
                var L = comp.layers.add(it);
                L.name = "Speaker · " + s.srcIn.toFixed(2) + "–" + s.srcOut.toFixed(2) + "s";
                L.startTime = s.at - s.srcIn;
                L.inPoint = s.at;
                L.outPoint = Math.min(D, s.at + (s.srcOut - s.srcIn));
                var scl = L.property("ADBE Transform Group").property("ADBE Scale");
                var base100 = (sp.scale || 100);
                if (i === 0 && sp.openZoom) keyset(scl, [[0, [base100 * 1.22, base100 * 1.22]], [1.33, [base100, base100]]], 85);
                else if (s.punch) keyset(scl, [[s.at, [base100 * 1.07, base100 * 1.07]], [s.at + 0.33, [base100, base100]]], 85);
                else scl.setValue([base100, base100]);
                L.property("ADBE Transform Group").property("ADBE Anchor Point").setValue([W / 2, sp.anchorY || 900]);
                L.property("ADBE Transform Group").property("ADBE Position").setValue([W / 2, sp.anchorY || 900]);
                if (it.hasAudio) L.audioEnabled = false;
            }
        });
        // 3) on-camera keywords + cards
        var kw = spec.keywords || [];
        for (var k = 0; k < kw.length; k++) (function (x) { safe("keyword " + x.key, function () { twoTier(comp, x, P, F); }); })(kw[k]);
        var cards = spec.onCamera || [];
        for (var c = 0; c < cards.length; c++) (function (x) { safe("card " + (x.text || x.type), function () { item(comp, x, P, F, media, base); }); })(cards[c]);

        // 4) full screens as precomps
        var fsl = spec.fullscreens || [];
        for (var f = 0; f < fsl.length; f++) (function (fs) {
            safe("full screen " + fs.name, function () {
                var dur = fs.to - fs.from;
                var pc = app.project.items.addComp("FS · " + fs.name, W, H, 1, dur, fps);
                pc.parentFolder = base.precomps;
                pc.layers.addSolid(color("bg", P), "BG", W, H, 1, dur);
                if (fs.bgFile) safe("fs bg", function () {
                    var it = importItem(media, fs.bgFile, base.mediaFolder);
                    if (it) { var L = pc.layers.add(it); L.property("ADBE Transform Group").property("ADBE Opacity").setValue(fs.bgOpacity === undefined ? 35 : fs.bgOpacity); L.outPoint = dur; }
                });
                for (var j = 0; j < fs.items.length; j++) (function (x) { safe(fs.name + " · " + (x.text || x.key || x.file || x.type), function () { item(pc, x, P, F, media, base); }); })(fs.items[j]);
                var L2 = comp.layers.add(pc);
                L2.startTime = fs.from;
                L2.name = "FS · " + fs.name;
                keyset(L2.property("ADBE Transform Group").property("ADBE Scale"), [[fs.from, [105, 105]], [fs.from + 0.4, [100, 100]]], 85);
            });
        })(fsl[f]);

        // 5) captions (on top)
        var caps = spec.captions || [];
        for (var q = 0; q < caps.length; q++) (function (x) { safe("caption @" + x.t0, function () { caption(comp, x, P, F); }); })(caps[q]);

        // 6) finishing: vignette, grain, shutters, end fade
        safe("vignette", function () {
            var v = comp.layers.addSolid([0, 0, 0], "Vignette", W, H, 1, D);
            var m = v.property("ADBE Mask Parade").addProperty("ADBE Mask Atom");
            var sh = new Shape(); var rx = W * 0.62, ry = H * 0.42, cx = W / 2, cy = H * 0.45, kk = 0.5523;
            sh.vertices = [[cx, cy - ry], [cx + rx, cy], [cx, cy + ry], [cx - rx, cy]];
            sh.inTangents = [[-rx * kk, 0], [0, -ry * kk], [rx * kk, 0], [0, ry * kk]];
            sh.outTangents = [[rx * kk, 0], [0, ry * kk], [-rx * kk, 0], [0, -ry * kk]];
            sh.closed = true;
            m.property("ADBE Mask Shape").setValue(sh);
            m.property("ADBE Mask Feather").setValue([380, 380]);
            m.inverted = true;
            v.property("ADBE Transform Group").property("ADBE Opacity").setValue(45);
        });
        if (spec.grain !== false) safe("grain", function () {
            var g = comp.layers.addSolid([0.5, 0.5, 0.5], "Grain (adjustment)", W, H, 1, D);
            g.adjustmentLayer = true;
            g.property("ADBE Effect Parade").addProperty("ADBE Noise").property("ADBE Noise-0001").setValue(4);
        });
        var tr = spec.transitions || [];
        for (var s2 = 0; s2 < tr.length; s2++) (function (t) { safe("shutter @" + t, function () { shutter(comp, t, P); }); })(tr[s2]);
        if (spec.endFade) safe("end fade", function () {
            var e = comp.layers.addSolid(color("bg", P), "End fade", W, H, 1, D);
            keyset(e.property("ADBE Transform Group").property("ADBE Opacity"), [[D - spec.endFade, 0], [D, 100]], 50);
        });

        // 7) audio: voice, music, sfx
        var au = spec.audio || [];
        for (var a = 0; a < au.length; a++) (function (x) {
            safe("audio " + x.file, function () {
                var it = importItem(media, x.file, base.mediaFolder);
                if (!it) return;
                var L = comp.layers.add(it);
                L.name = (x.role ? x.role + " · " : "") + x.file;
                L.startTime = x.at || 0;
                if (x.gain) L.property("ADBE Audio Group").property("ADBE Audio Levels").setValue([x.gain, x.gain]);
                if (L.outPoint > D) L.outPoint = D;
            });
        })(au[a]);

        comp.openInViewer();
        app.endUndoGroup();
        return comp;
    }

    /* ------------------------------------------------------------ UI */
    function ui(host) {
        var w = host instanceof Panel ? host : new Window("dialog", SCRIPT, undefined, { resizeable: true });
        w.orientation = "column"; w.alignChildren = ["fill", "top"];
        w.add("statictext", undefined, "1) Paste the reel JSON (or load the .json file)");
        var box = w.add("edittext", undefined, "", { multiline: true, scrolling: true });
        box.preferredSize = [460, 220];
        var row = w.add("group");
        var load = row.add("button", undefined, "Load .json…");
        var media = null;
        w.add("statictext", undefined, "2) Pick the reel's media folder");
        var mrow = w.add("group");
        var pick = mrow.add("button", undefined, "Choose media folder…");
        var mlabel = mrow.add("statictext", undefined, "(not chosen)", { truncate: "middle" });
        mlabel.preferredSize = [300, 20];
        var go = w.add("button", undefined, "3) Build editable comp");
        load.onClick = function () {
            var f = File.openDialog("Reel JSON", "*.json");
            if (!f) return;
            f.encoding = "UTF-8"; f.open("r"); box.text = f.read(); f.close();
            if (!media) { media = f.parent; mlabel.text = media.fsName; }
        };
        pick.onClick = function () { var fo = Folder.selectDialog("Media folder for this reel"); if (fo) { media = fo; mlabel.text = fo.fsName; } };
        go.onClick = function () {
            var spec;
            try { spec = parseJSON(box.text); } catch (e) { alert("The JSON could not be read:\n" + e.toString()); return; }
            if (!media) { alert("Choose the media folder first (step 2)."); return; }
            if (!app.project) app.newProject();
            build(spec, media);
            alert(report.length ? ("Built with " + report.length + " note(s):\n\n" + report.join("\n")) : "Built. Everything is editable — enjoy!");
            if (w instanceof Window) w.close();
        };
        if (w instanceof Window) { w.center(); w.show(); } else { w.layout.layout(true); }
        return w;
    }

    // exposed for the automated tests
    if (typeof $ !== "undefined" && $.global) $.global.__anfaalBuild = build;
    if (typeof $ !== "undefined" && $.global) $.global.__anfaalReport = function () { return report; };
    if (!(typeof $ !== "undefined" && $.global && $.global.__ANFAAL_TEST__)) ui(thisObj);
})(this);
