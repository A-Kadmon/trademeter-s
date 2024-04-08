// костыль для в. 3.2
const RD_modifier = -1; // realdata[0] - same realdata[1] in past
////

const bonds2 = {
    cash: 0,
    bondsTotal: 0,
    get total(){
        return this.cash + this.bondsTotal;
    },

    init(opts, cash){
        this.opts = opts;
        this.cash = cash;
        this.bondsTotal = 0;
        this.uB( cash );
    },

    uB(s){
        //return s;
        if ( isNaN(s) ) { return s; }
        var d = s - this.total;
        //if ( d!= 0) console.log('d != 0 ');//t

        //console.log('s', s, 'd', d,'CR',this.opts.couponRate); // t

        this.cash += this.bondsTotal * (1 + this.opts.couponRate) + d;

        //console.log('cash', this.cash); // t

        if (this.cash < 0) {
            this.cash = 0;
            this.bondsTotal = 0;
        }
        else  {
            if (this.cash >= this.opts.price) {
                let t = this.cash % this.opts.price;
                this.bondsTotal = this.cash - t;
                this.cash = t;
            }
        }
        if ( isNaN(s) ) { console.log( this.total );  }
        return this.total;
    }

}


function getDataRate(rate, present, future, payment, paymentper, payload, payloadper, periods, dayoffirstpayment=0, dayoffirstpayload=0, comission = 0, realdata = [], customRate_ = undefined, bond = undefined)
{

    var res = present;

    // для в 4.1
    if ( bondsOptions !== undefined ) {
        bonds2.init(bondsOptions, present);
        console.log( 'gdr',present, bonds2.total, bonds2.cash, bonds2.bondsTotal );
    }

    // костыль для в. 3.2
    dayoffirstpayment++;
    dayoffirstpayload++;
    /////

    var p1 = dayoffirstpayment;
    var p2 = dayoffirstpayload;
    var day = 1;
    var x = 1;
    var RD_modifier = -1;
    if ( RD_modifier == 0 )  var arr = [present];
    else arr = [];

    rate += 1;
    payment = payment * (1 + comission);

    while ( x <= periods) {
        if ( realdata[x + RD_modifier] !== undefined ) {
            if (customRate_ === undefined ) res = res * (1 + realdata[x + RD_modifier].scale);
            else res = res * rate;
            p1--; p2--;
            res += realdata[x + RD_modifier].payload;
            res -= realdata[x + RD_modifier].payment;
            if (!p2) { p2 = payloadper; }
            if (!p1) { p1 = paymentper; }
        } else {
            res = res * rate;
            p1--; p2--;
            if (!p2) { p2 = payloadper; res += payload; }
            if (!p1) { p1 = paymentper; res -= payment; }
        }
        x++;


        if ( bondsOptions !== undefined ) {
            res = bonds2.uB( res );
        }


        if ( res < 0 ) {
            res = 0;
            arr.push(res);
            break;
        }

        arr.push(res);
    }
    return arr;
}

function _ff3_(rate, periods, present, payment, paymentper, payload, payloadper, dayoffirstpayment = 1, dayoffirstpayload = 1, realdata = []) {

    // костыль для в. 3.2
    dayoffirstpayment++;
    dayoffirstpayload++;
    /////

    var res = present;
    var p1 = dayoffirstpayment;
    var p2 = dayoffirstpayload;
    rate += 1;

    for (var x = 1; x <= periods; x++) {
        if ( realdata[x + RD_modifier] !== undefined ) {
            res = res * rate;
            p1--; p2--;
            res += realdata[x + RD_modifier].payload;
            res -= realdata[x + RD_modifier].payment;
            if (!p2) { p2 = payloadper; }
            if (!p1) { p1 = paymentper; }
            // console.log('нашли ', x);
        } else {
            res = res * rate;
            p1--; p2--;
            if (!p2) { p2 = payloadper; res += payload; }
            if (!p1) { p1 = paymentper; res -= payment; }
        }
    }
    return res;
}

/* function saveFile(object){
  var data = new Blob([JSON.stringify(object)], {type: "text/javascript"});
  var link = document.createElement("a");
  //var link = document.getElementById("test");
  link.setAttribute("href", URL.createObjectURL(data));
  link.setAttribute("download", "myCase.cse");
	//link.setAttribute("target",'_blank');
	//link.click();
	console.log('saved');
	link.remove();
} */
function saveFile(object){
    var blob = new Blob([JSON.stringify(object)], {type: "text/plain;charset=utf-8"});
    saveAs(blob, "myCase.txt");
    console.log('saved');
}
var _global = typeof window === 'object' && window.window === window
    ? window : typeof self === 'object' && self.self === self
        ? self : typeof global === 'object' && global.global === global
            ? global
            : this

function bom (blob, opts) {
    if (typeof opts === 'undefined') opts = { autoBom: false }
    else if (typeof opts !== 'object') {
        console.warn('Deprecated: Expected third argument to be a object')
        opts = { autoBom: !opts }
    }

    // prepend BOM for UTF-8 XML and text/* types (including HTML)
    // note: your browser will automatically convert UTF-16 U+FEFF to EF BB BF
    if (opts.autoBom && /^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(blob.type)) {
        return new Blob([String.fromCharCode(0xFEFF), blob], { type: blob.type })
    }
    return blob
}

function download (url, name, opts) {
    var xhr = new XMLHttpRequest()
    xhr.open('GET', url)
    xhr.responseType = 'blob'
    xhr.onload = function () {
        saveAs(xhr.response, name, opts)
    }
    xhr.onerror = function () {
        console.error('could not download file')
    }
    xhr.send()
}

function corsEnabled (url) {
    var xhr = new XMLHttpRequest()
    // use sync to avoid popup blocker
    xhr.open('HEAD', url, false)
    try {
        xhr.send()
    } catch (e) {}
    return xhr.status >= 200 && xhr.status <= 299
}

// `a.click()` doesn't work for all browsers (#465)
function click (node) {
    try {
        node.dispatchEvent(new MouseEvent('click'))
    } catch (e) {
        var evt = document.createEvent('MouseEvents')
        evt.initMouseEvent('click', true, true, window, 0, 0, 0, 80,
            20, false, false, false, false, 0, null)
        node.dispatchEvent(evt)
    }
}

// Detect WebView inside a native macOS app by ruling out all browsers
// We just need to check for 'Safari' because all other browsers (besides Firefox) include that too
// https://www.whatismybrowser.com/guides/the-latest-user-agent/macos
var isMacOSWebView = _global.navigator && /Macintosh/.test(navigator.userAgent) && /AppleWebKit/.test(navigator.userAgent) && !/Safari/.test(navigator.userAgent)

var saveAs = _global.saveAs || (
    // probably in some web worker
    (typeof window !== 'object' || window !== _global)
        ? function saveAs () { /* noop */ }

        // Use download attribute first if possible (#193 Lumia mobile) unless this is a macOS WebView
        : ('download' in HTMLAnchorElement.prototype && !isMacOSWebView)
            ? function saveAs (blob, name, opts) {
                var URL = _global.URL || _global.webkitURL
                var a = document.createElement('a')
                name = name || blob.name || 'download'

                a.download = name
                a.rel = 'noopener' // tabnabbing

                // TODO: detect chrome extensions & packaged apps
                // a.target = '_blank'

                if (typeof blob === 'string') {
                    // Support regular links
                    a.href = blob
                    if (a.origin !== location.origin) {
                        corsEnabled(a.href)
                            ? download(blob, name, opts)
                            : click(a, a.target = '_blank')
                    } else {
                        click(a)
                    }
                } else {
                    // Support blobs
                    a.href = URL.createObjectURL(blob)
                    setTimeout(function () { URL.revokeObjectURL(a.href) }, 4E4) // 40s
                    setTimeout(function () { click(a) }, 0)
                }
            }

            // Use msSaveOrOpenBlob as a second approach
            : 'msSaveOrOpenBlob' in navigator
                ? function saveAs (blob, name, opts) {
                    name = name || blob.name || 'download'

                    if (typeof blob === 'string') {
                        if (corsEnabled(blob)) {
                            download(blob, name, opts)
                        } else {
                            var a = document.createElement('a')
                            a.href = blob
                            a.target = '_blank'
                            setTimeout(function () { click(a) })
                        }
                    } else {
                        navigator.msSaveOrOpenBlob(bom(blob, opts), name)
                    }
                }

                // Fallback to using FileReader and a popup
                : function saveAs (blob, name, opts, popup) {
                    // Open a popup immediately do go around popup blocker
                    // Mostly only available on user interaction and the fileReader is async so...
                    popup = popup || open('', '_blank')
                    if (popup) {
                        popup.document.title =
                            popup.document.body.innerText = 'downloading...'
                    }

                    if (typeof blob === 'string') return download(blob, name, opts)

                    var force = blob.type === 'application/octet-stream'
                    var isSafari = /constructor/i.test(_global.HTMLElement) || _global.safari
                    var isChromeIOS = /CriOS\/[\d]+/.test(navigator.userAgent)

                    if ((isChromeIOS || (force && isSafari) || isMacOSWebView) && typeof FileReader !== 'undefined') {
                        // Safari doesn't allow downloading of blob URLs
                        var reader = new FileReader()
                        reader.onloadend = function () {
                            var url = reader.result
                            url = isChromeIOS ? url : url.replace(/^data:[^;]*;/, 'data:attachment/file;')
                            if (popup) popup.location.href = url
                            else location = url
                            popup = null // reverse-tabnabbing #460
                        }
                        reader.readAsDataURL(blob)
                    } else {
                        var URL = _global.URL || _global.webkitURL
                        var url = URL.createObjectURL(blob)
                        if (popup) popup.location = url
                        else location.href = url
                        popup = null // reverse-tabnabbing #460
                        setTimeout(function () { URL.revokeObjectURL(url) }, 4E4) // 40s
                    }
                }
)

_global.saveAs = saveAs.saveAs = saveAs

if (typeof module !== 'undefined') {
    module.exports = saveAs;
}

((D, log = (arg) => console.log(arg)) => {
    const dropZone = D.querySelector("div.fileload");
    const input = D.querySelector("input.fileload");
    let file;

    D.addEventListener("dragover", (ev) => ev.preventDefault());
    D.addEventListener("drop", (ev) => ev.preventDefault());

    dropZone.addEventListener("drop", (ev) => {
        ev.preventDefault();
        file = ev.dataTransfer.files[0];
        handleFile(file);
    });

    dropZone.addEventListener("click", () => {
        input.click();
        input.addEventListener("change", () => {
            file = input.files[0];
            handleFile(file);
        });
    });

    const handleFile = (file) => {

        const reader = new FileReader();
        reader.readAsText(file);
        reader.onload = () => {
            log('load');
            //log(reader.result);
            myCase = JSON.parse(reader.result);
            docInit();

        };
    };
})(document);

const verticalLinePlugin = {
    getLinePosition: function (chart, pointIndex) {
        const meta = chart.getDatasetMeta(0); // first dataset is used to discover X coordinate of a point
        const data = meta.data;
        return data[pointIndex]._model.x;
    },
    getLinePositionY: function (chart, pointIndex) {
        const meta = chart.getDatasetMeta(0); // first dataset is used to discover X coordinate of a point
        const data = meta.data;
        return data[pointIndex]._model.y;
    },
    renderVerticalLine: function (chartInstance, pointIndex) {
        const lineLeftOffset = this.getLinePosition(chartInstance, pointIndex);
        const scale = chartInstance.scales['y-axis-0'];
        const context = chartInstance.chart.ctx;

        // render vertical line
        context.beginPath();
        context.strokeStyle = 'rgba(0,0,0,0.2)';
        context.moveTo(lineLeftOffset, scale.top);
        context.lineTo(lineLeftOffset, scale.bottom);
        context.stroke();

        // write label
        context.fillStyle = "#ff0000";
        context.textAlign = 'center';
        context.fillText('', lineLeftOffset, (scale.bottom - scale.top) / 2 + scale.top);
    },
    renderHorLine: function (chartInstance, pointIndex) {
        const lineLeftOffset = this.getLinePositionY(chartInstance, pointIndex);
        console.log(scale);
        console.log(lineLeftOffset);

        const scale = chartInstance.scales['x-axis-0'];
        const context = chartInstance.chart.ctx;


        // render vertical line
        context.beginPath();
        context.strokeStyle = '#ff0000';
        context.moveTo(scale.left, lineLeftOffset );
        context.lineTo(scale.right, lineLeftOffset );
        context.stroke();

        // write label
        //context.fillStyle = "#ff0000";
        //context.textAlign = 'center';
        //context.fillText('', lineLeftOffset, (scale.right - scale.left) / 2 + scale.top);
    },

    afterDatasetsDraw: function (chart, easing) {
        if (chart.config.lineAtIndex) {
            chart.config.lineAtIndex.forEach(pointIndex => this.renderVerticalLine(chart, pointIndex));
        }
        if (chart.config.lineHorAtIndex) {
            chart.config.lineHorAtIndex.forEach(pointIndex => this.renderHorLine(chart, pointIndex));
        }
    }
};

Chart.plugins.register(verticalLinePlugin);

