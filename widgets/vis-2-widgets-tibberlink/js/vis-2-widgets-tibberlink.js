/*
    ioBroker.vis vis-2-widgets-tibberlink — Widget-Set
    3 Widgets: Aktueller Preis · Preisdiagramm · Live Verbrauch

    version: "0.2.0"
    Copyright 2026 ssbingo s.sternitzke@online.de
*/
"use strict";

/* global $, vis, systemDictionary */

if (typeof systemDictionary !== "undefined") {
    $.extend(true, systemDictionary, {
        "tib_title":      { "en": "Title",                      "de": "Titel" },
        "tib_darkmode":   { "en": "Dark mode",                  "de": "Dunkelmodus" },
        "oid_price":      { "en": "Current Price OID",          "de": "Aktueller Preis OID" },
        "oid_energy":     { "en": "Energy Price OID",           "de": "Energieanteil OID" },
        "oid_tax":        { "en": "Tax OID",                    "de": "Steuer OID" },
        "oid_level":      { "en": "Price Level OID",            "de": "Preisstufe OID" },
        "oid_today":      { "en": "Today Prices JSON OID",      "de": "Heute Preise JSON OID" },
        "oid_tomorrow":   { "en": "Tomorrow Prices JSON OID",   "de": "Morgen Preise JSON OID" },
        "oid_power":      { "en": "Current Power OID",          "de": "Aktuelle Leistung OID" },
        "oid_consumption":{ "en": "Consumption Today OID",      "de": "Verbrauch Heute OID" },
        "oid_cost":       { "en": "Cost Today OID",             "de": "Kosten Heute OID" },
        "oid_minpower":   { "en": "Min Power OID",              "de": "Min Leistung OID" },
        "oid_avgpower":   { "en": "Avg Power OID",              "de": "Ø Leistung OID" },
        "oid_maxpower":   { "en": "Max Power OID",              "de": "Max Leistung OID" }
    });
}

vis.binds["vis-2-widgets-tibberlink"] = {
    version: "0.2.0",

    showVersion: function () {
        if (vis.binds["vis-2-widgets-tibberlink"].version) {
            console.log("Version vis-2-widgets-tibberlink: " + vis.binds["vis-2-widgets-tibberlink"].version);
            vis.binds["vis-2-widgets-tibberlink"].version = null;
        }
    },

    // ── Helfer ──────────────────────────────────────────────────────────────
    _fmtCt: function (v) {
        var n = parseFloat(v);
        return isNaN(n) ? "-- ct/kWh" : (n * 100).toFixed(2) + " ct/kWh";
    },
    _fmtCtShort: function (v) {
        var n = parseFloat(v);
        return isNaN(n) ? "--" : (n * 100).toFixed(2) + " ct";
    },
    _fmtW: function (v) {
        var n = parseFloat(v);
        if (isNaN(n)) return "-- W";
        if (Math.abs(n) >= 1000) return (n / 1000).toFixed(2) + " kW";
        return Math.round(n) + " W";
    },
    _fmtKWh: function (v) {
        var n = parseFloat(v);
        return isNaN(n) ? "-- kWh" : n.toFixed(3) + " kWh";
    },
    _fmtCost: function (v) {
        var n = parseFloat(v);
        return isNaN(n) ? "-- €" : n.toFixed(2) + " €";
    },

    // Farbe nach Preisstufe
    _levelColor: function (level) {
        switch ((level || "").toUpperCase()) {
            case "VERY_CHEAP":     return "#1abc9c";
            case "CHEAP":         return "#27ae60";
            case "NORMAL":        return "#f39c12";
            case "EXPENSIVE":     return "#e67e22";
            case "VERY_EXPENSIVE":return "#e74c3c";
            default:              return "#95a5a6";
        }
    },

    // Deutsches Label für Preisstufe
    _levelText: function (level) {
        switch ((level || "").toUpperCase()) {
            case "VERY_CHEAP":     return "Sehr günstig";
            case "CHEAP":         return "Günstig";
            case "NORMAL":        return "Normal";
            case "EXPENSIVE":     return "Teuer";
            case "VERY_EXPENSIVE":return "Sehr teuer";
            default:              return level || "--";
        }
    },

    _el:  function (id) { return document.getElementById(id); },
    _txt: function (id, v) {
        var e = vis.binds["vis-2-widgets-tibberlink"]._el(id);
        if (e) e.textContent = v;
    },
    _css: function (id, p, v) {
        var e = vis.binds["vis-2-widgets-tibberlink"]._el(id);
        if (e) e.style[p] = v;
    },
    _val: function (data, attr) {
        var oid = data.attr(attr);
        if (!oid) return undefined;
        return vis.states[oid + ".val"];
    },
    _isDark: function (data) {
        var v = data.attr("tib_darkmode");
        return (v === true || v === "true" || v === "1" || v === 1);
    },
    _subscribe: function (wid, data, attrs, onChange) {
        var $div  = $("#" + wid);
        var bound = [];
        for (var i = 0; i < attrs.length; i++) {
            var oid = data.attr(attrs[i]);
            if (oid) {
                var key = oid + ".val";
                bound.push(key);
                vis.states.bind(key, onChange);
            }
        }
        $div.data("bound",       bound);
        $div.data("bindHandler", onChange);
    },

    // ── Skalierungs-Helper ───────────────────────────────────────────────────
    _applyScale: function ($div, designWidth) {
        var el = $div[0];
        if (!el || !designWidth) return;

        var outer, inner;
        var existing = el.querySelector(":scope > .tib-scale-outer");
        if (existing) {
            outer = existing;
            inner = outer.firstChild;
            inner.style.width = designWidth + "px";
        } else {
            outer = document.createElement("div");
            outer.className = "tib-scale-outer";
            inner = document.createElement("div");
            inner.className = "tib-scale-inner";
            inner.style.width = designWidth + "px";
            while (el.firstChild) inner.appendChild(el.firstChild);
            outer.appendChild(inner);
            el.appendChild(outer);
        }

        var apply = function () {
            var w = el.clientWidth;
            var h = el.clientHeight;
            if (!w) return;
            var innerH = inner.offsetHeight;
            var sx = w / designWidth;
            var sy = (h > 0 && innerH > 0) ? (h / innerH) : sx;
            inner.style.transform = "scale(" + sx + ", " + sy + ")";
            inner.style.left = "0";
            inner.style.top  = "0";

            var textComp = sx >= sy ? "scaleX(" + (sy / sx) + ")" : "scaleY(" + (sx / sy) + ")";
            if (!el._tibTextSelector) {
                el._tibTextSelector = [
                    ".tib-text",
                    "[class*='-title']", "[class*='-lbl']", "[class*='-label']",
                    "[class*='-val']",   "[class*='-value']", "[class*='-name']",
                    "[class*='-big']",   "[class*='-sub']",   "[class*='-badge']",
                    "[class*='-unit']",  "[class*='-level']", "[class*='-cost']",
                    "[class*='-info']"
                ].join(",");
            }
            var texts = inner.querySelectorAll(el._tibTextSelector);
            for (var i = 0; i < texts.length; i++) {
                var d = getComputedStyle(texts[i]).display;
                if (d === "flex" || d === "grid" || d === "inline-flex" || d === "inline-grid") continue;
                texts[i].style.transform = textComp;
                texts[i].style.transformOrigin = "0 50%";
            }
        };
        apply();

        if (el._tibScaleObs) { try { el._tibScaleObs.disconnect(); } catch (e) {} }
        if (window.ResizeObserver) {
            el._tibScaleObs = new ResizeObserver(apply);
            el._tibScaleObs.observe(el);
            el._tibScaleObs.observe(inner);
        } else if (!el._tibScaleListener) {
            el._tibScaleListener = apply;
            window.addEventListener("resize", apply);
        }
    },

    // ── Widget 1: Aktueller Tibber Preis ────────────────────────────────────
    createPriceCard: function (widgetID, view, data, style) {
        var B    = vis.binds["vis-2-widgets-tibberlink"];
        var $div = $("#" + widgetID);
        if (!$div.length) {
            return setTimeout(function () { B.createPriceCard(widgetID, view, data, style); }, 100);
        }

        var dark  = B._isDark(data);
        var title = data.attr("tib_title") || "Tibber Strompreis";
        var w     = widgetID;
        var cls   = dark ? "tib-pc-wrap" : "tib-pc-wrap light";

        $div.html(
            '<div class="tib-w"><div class="' + cls + '">' +
            '<div class="tib-pc-title">&#9889; ' + title + '</div>' +
            '<div id="tib_pc_big_' + w + '" class="tib-pc-big">-- ct/kWh</div>' +
            '<div class="tib-pc-badge-row">' +
              '<span id="tib_pc_badge_' + w + '" class="tib-pc-badge">--</span>' +
            '</div>' +
            '<div class="tib-pc-details">' +
              '<div class="tib-stat-box">' +
                '<div class="tib-stat-label">Energieanteil</div>' +
                '<div id="tib_pc_energy_' + w + '" class="tib-stat-val" style="color:#3498db">-- ct</div>' +
              '</div>' +
              '<div class="tib-stat-box">' +
                '<div class="tib-stat-label">Steuer/Abgaben</div>' +
                '<div id="tib_pc_tax_' + w + '" class="tib-stat-val" style="color:#9b59b6">-- ct</div>' +
              '</div>' +
            '</div>' +
            '</div></div>'
        );
        B._applyScale($div, 280);

        function update() {
            var price  = B._val(data, "oid_price");
            var energy = B._val(data, "oid_energy");
            var tax    = B._val(data, "oid_tax");
            var level  = B._val(data, "oid_level") || "";
            var col    = B._levelColor(level);

            B._txt("tib_pc_big_"   + w, B._fmtCt(price));
            B._css("tib_pc_big_"   + w, "color", col);
            B._txt("tib_pc_badge_" + w, B._levelText(level));
            B._css("tib_pc_badge_" + w, "background", col);
            B._txt("tib_pc_energy_"+ w, B._fmtCtShort(energy));
            B._txt("tib_pc_tax_"   + w, B._fmtCtShort(tax));
        }

        update();
        B._subscribe(w, data, ["oid_price", "oid_energy", "oid_tax", "oid_level"], update);
    },

    // ── Widget 2: Tibber Preisdiagramm ──────────────────────────────────────
    createPriceChart: function (widgetID, view, data, style) {
        var B    = vis.binds["vis-2-widgets-tibberlink"];
        var $div = $("#" + widgetID);
        if (!$div.length) {
            return setTimeout(function () { B.createPriceChart(widgetID, view, data, style); }, 100);
        }

        var dark  = B._isDark(data);
        var title = data.attr("tib_title") || "Tibber Preisübersicht";
        var w     = widgetID;
        var cls   = dark ? "tib-chart-wrap" : "tib-chart-wrap light";

        $div.html(
            '<div class="tib-w"><div class="' + cls + '">' +
            '<div class="tib-chart-title">&#9889; ' + title + '</div>' +
            '<div id="tib_chart_bars_' + w + '" class="tib-chart-bars-wrap"></div>' +
            '<div id="tib_chart_info_' + w + '" class="tib-chart-info">-- ct/kWh</div>' +
            '</div></div>'
        );
        B._applyScale($div, 360);

        function renderBars() {
            var barsEl = B._el("tib_chart_bars_" + w);
            var infoEl = B._el("tib_chart_info_" + w);
            if (!barsEl) return;

            var today    = [];
            var tomorrow = [];
            var todayRaw    = B._val(data, "oid_today")    || "[]";
            var tomorrowRaw = B._val(data, "oid_tomorrow") || "[]";
            try { today    = JSON.parse(todayRaw)    || []; } catch (e) {}
            try { tomorrow = JSON.parse(tomorrowRaw) || []; } catch (e) {}

            var all = today.concat(tomorrow);
            if (!all.length) {
                barsEl.innerHTML = '<div style="opacity:.5;text-align:center;padding:20px 0">Keine Preisdaten</div>';
                return;
            }

            var prices = all.map(function (p) { return parseFloat(p.total) || 0; });
            var maxP   = Math.max.apply(null, prices);
            var minP   = Math.min.apply(null, prices);
            var range  = (maxP - minP) || 0.001;

            var now     = new Date();
            var nowHour = now.getHours();
            var nowDate = now.toDateString();

            var svgW = 360, svgH = 120;
            var barW = svgW / all.length;
            var padT = 14, padB = 18;
            var availH = svgH - padT - padB;

            var tc  = dark ? "rgba(255,255,255,.45)" : "rgba(0,0,0,.35)";
            var lc  = dark ? "rgba(255,255,255,.18)" : "rgba(0,0,0,.12)";

            var svg = '<svg viewBox="0 0 ' + svgW + ' ' + svgH + '" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">';

            for (var i = 0; i < all.length; i++) {
                var p     = all[i];
                var pv    = parseFloat(p.total) || 0;
                var level = p.level || "NORMAL";
                var col   = B._levelColor(level);
                var bh    = Math.max(3, Math.round(((pv - minP) / range) * availH));
                var x     = i * barW;
                var y     = svgH - padB - bh;

                var isCurrent = false;
                if (p.startsAt) {
                    try {
                        var sa = new Date(p.startsAt);
                        if (sa.toDateString() === nowDate && sa.getHours() === nowHour) isCurrent = true;
                    } catch (e) {}
                }

                svg += '<rect x="' + (x + 1) + '" y="' + y + '" width="' + (barW - 2) + '" height="' + bh +
                       '" fill="' + col + '" rx="1.5" opacity="' + (isCurrent ? "1" : "0.72") + '"/>';
                if (isCurrent) {
                    svg += '<rect x="' + (x + 1) + '" y="' + y + '" width="' + (barW - 2) + '" height="' + bh +
                           '" fill="none" stroke="#fff" stroke-width="1.5" rx="1.5" opacity="0.9"/>';
                }

                var h = i % 24;
                if (p.startsAt) { try { h = new Date(p.startsAt).getHours(); } catch (e) {} }
                if (h % 4 === 0) {
                    svg += '<text x="' + (x + barW / 2) + '" y="' + (svgH - 3) +
                           '" text-anchor="middle" font-size="7" fill="' + tc + '">' + h + '</text>';
                }
            }

            // Trennlinie Heute/Morgen
            if (today.length > 0 && tomorrow.length > 0) {
                var sepX = today.length * barW;
                svg += '<line x1="' + sepX + '" y1="' + padT + '" x2="' + sepX + '" y2="' + (svgH - padB) +
                       '" stroke="' + lc + '" stroke-width="1" stroke-dasharray="3,2"/>';
                svg += '<text x="' + (today.length * barW / 2) + '" y="' + (padT - 2) +
                       '" text-anchor="middle" font-size="6.5" fill="' + lc + '">Heute</text>';
                svg += '<text x="' + (today.length * barW + tomorrow.length * barW / 2) + '" y="' + (padT - 2) +
                       '" text-anchor="middle" font-size="6.5" fill="' + lc + '">Morgen</text>';
            }

            svg += '</svg>';
            barsEl.innerHTML = svg;

            if (infoEl) {
                infoEl.textContent = "Min: " + (minP * 100).toFixed(2) + "  ·  Max: " + (maxP * 100).toFixed(2) + " ct/kWh";
            }
        }

        renderBars();
        B._subscribe(w, data, ["oid_today", "oid_tomorrow"], renderBars);
    },

    // ── Widget 3: Tibber Live Verbrauch ─────────────────────────────────────
    createLivePower: function (widgetID, view, data, style) {
        var B    = vis.binds["vis-2-widgets-tibberlink"];
        var $div = $("#" + widgetID);
        if (!$div.length) {
            return setTimeout(function () { B.createLivePower(widgetID, view, data, style); }, 100);
        }

        var dark  = B._isDark(data);
        var title = data.attr("tib_title") || "Tibber Live";
        var w     = widgetID;
        var cls   = dark ? "tib-live-wrap" : "tib-live-wrap light";

        $div.html(
            '<div class="tib-w"><div class="' + cls + '">' +
            '<div class="tib-live-title">&#9889; ' + title + '</div>' +
            '<div id="tib_live_big_' + w + '" class="tib-live-big">-- W</div>' +
            '<div class="tib-live-stats">' +
              '<div class="tib-stat-box">' +
                '<div class="tib-stat-label">Min</div>' +
                '<div id="tib_live_min_' + w + '" class="tib-stat-val" style="color:#1abc9c">--</div>' +
              '</div>' +
              '<div class="tib-stat-box">' +
                '<div class="tib-stat-label">Ø Mittel</div>' +
                '<div id="tib_live_avg_' + w + '" class="tib-stat-val" style="color:#3498db">--</div>' +
              '</div>' +
              '<div class="tib-stat-box">' +
                '<div class="tib-stat-label">Max</div>' +
                '<div id="tib_live_max_' + w + '" class="tib-stat-val" style="color:#e74c3c">--</div>' +
              '</div>' +
            '</div>' +
            '<div class="tib-live-day">' +
              '<div class="tib-stat-box">' +
                '<div class="tib-stat-label">Verbrauch heute</div>' +
                '<div id="tib_live_cons_' + w + '" class="tib-stat-val" style="color:#27ae60">-- kWh</div>' +
              '</div>' +
              '<div class="tib-stat-box">' +
                '<div class="tib-stat-label">Kosten heute</div>' +
                '<div id="tib_live_cost_' + w + '" class="tib-stat-val" style="color:#f39c12">-- €</div>' +
              '</div>' +
            '</div>' +
            '</div></div>'
        );
        B._applyScale($div, 280);

        function update() {
            var power = B._val(data, "oid_power");
            var pn    = parseFloat(power);
            var col   = (pn > 5000 ? "#e74c3c" : pn > 2000 ? "#f39c12" : "#27ae60");

            B._txt("tib_live_big_"  + w, B._fmtW(power));
            B._css("tib_live_big_"  + w, "color", col);
            B._txt("tib_live_min_"  + w, B._fmtW(B._val(data, "oid_minpower")));
            B._txt("tib_live_avg_"  + w, B._fmtW(B._val(data, "oid_avgpower")));
            B._txt("tib_live_max_"  + w, B._fmtW(B._val(data, "oid_maxpower")));
            B._txt("tib_live_cons_" + w, B._fmtKWh(B._val(data, "oid_consumption")));
            B._txt("tib_live_cost_" + w, B._fmtCost(B._val(data, "oid_cost")));
        }

        update();
        B._subscribe(w, data,
            ["oid_power", "oid_minpower", "oid_avgpower", "oid_maxpower", "oid_consumption", "oid_cost"],
            update);
    }
};

vis.binds["vis-2-widgets-tibberlink"].showVersion();
