/*******************************************************************************
 *Server Status module for Total.js.
 *With this you can get real time traffic datas from your application.
 *******************************************************************************
 *MIT License
 *
 *Copyright (c) 2016 David Horvath <dacr@dacr.hu>
 *
 *Permission is hereby granted, free of charge, to any person obtaining a copy
 *of this software and associated documentation files (the "Software"), to deal
 *in the Software without restriction, including without limitation the rights
 *to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *copies of the Software, and to permit persons to whom the Software is
 *furnished to do so, subject to the following conditions:
 *
 *The above copyright notice and this permission notice shall be included in all
 *copies or substantial portions of the Software.
 *
 *THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 *SOFTWARE.
 */


exports.id = 'serverStatus';
exports.version = '1.0.1';

/******************************************************
 * Init datas
 *****************************************************/
var now = new Date();
var serverStatusCleanInterval = CONFIG('serverStatusCleanInterval') || 1;
var serverStatusUrl = CONFIG('serverStatusUrl') || '/server-status';
var serverStatusStats = {
    request: {
        count: 0,
        timestamp: now
    },
    requestBegin: {
        count: 0,
        timestamp: now
    },
    requestEnd: {
        count: 0,
        timestamp: now
    },
    GET: {
        count: 0,
        timestamp: now
    },
    POST: {
        count: 0,
        timestamp: now
    },
    PUT: {
        count: 0,
        timestamp: now
    },
    DELETE: {
        count: 0,
        timestamp: now
    },
    uploadBegin: {
        count: 0,
        timestamp: now
    },
    uploadEnd: {
        count: 0,
        timestamp: now
    },
    websocket: {
        count: 0,
        timestamp: now
    },
    websocketBegin: {
        count: 0,
        timestamp: now
    },
    websocketEnd: {
        count: 0,
        timestamp: now
    },
    numberOfIPs: []
};

/******************************************************
 * Events & routes
 *****************************************************/
exports.install = function (options) {
    F.on('request', requestInc);
    F.on('request-begin', requestBeginInc);
    F.on('request-end', requestEndInc);
    F.on('upload-begin', uploadBeginInc);
    F.on('upload-end', uploadEndInc);
    F.on('websocket', websocketInc);
    F.on('websocket-begin', websocketBeginInc);
    F.on('websocket-end', websocketEndInc);
    F.route('/server-status', serverStatus);
};


/******************************************************
 * Increment counters
 *****************************************************/
function requestInc(req, res) {
    now = new Date();
    if (now.diff(serverStatusStats.request.timestamp, 'seconds') > serverStatusCleanInterval) {
        serverStatusStats.request.count = 1;
        serverStatusStats.request.timestamp = now;
        serverStatusStats[req.method].count = 1;
        serverStatusStats[req.method].timestamp = now;
    } else {
        serverStatusStats.request.count += 1;
        serverStatusStats[req.method].count += 1;
    }
    numberOfIPs(req.ip);
}

function requestBeginInc(req, res) {
    now = new Date();
    if (now.diff(serverStatusStats.requestBegin.timestamp, 'seconds') > serverStatusCleanInterval) {
        serverStatusStats.requestBegin.count = 1;
        serverStatusStats.requestBegin.timestamp = now;
    } else {
        serverStatusStats.requestBegin.count += 1;
    }
    numberOfIPs(req.ip);
}

function requestEndInc(req, res) {
    now = new Date();
    if (now.diff(serverStatusStats.requestEnd.timestamp, 'seconds') > serverStatusCleanInterval) {
        serverStatusStats.requestEnd.count = 1;
        serverStatusStats.requestEnd.timestamp = now;
    } else {
        serverStatusStats.requestEnd.count += 1;
    }
    numberOfIPs(req.ip);
}

function uploadBeginInc(req, res) {
    now = new Date();
    if (now.diff(serverStatusStats.uploadBegin.timestamp, 'seconds') > serverStatusCleanInterval) {
        serverStatusStats.uploadBegin.count = 1;
        serverStatusStats.uploadBegin.timestamp = now;
    } else {
        serverStatusStats.uploadBegin.count += 1;
    }
    numberOfIPs(req.ip);
}

function uploadEndInc(req, res) {
    now = new Date();
    if (now.diff(serverStatusStats.uploadEnd.timestamp, 'seconds') > serverStatusCleanInterval) {
        serverStatusStats.uploadEnd.count = 1;
        serverStatusStats.uploadEnd.timestamp = now;
    } else {
        serverStatusStats.uploadEnd.count += 1;
    }
    numberOfIPs(req.ip);
}

function websocketInc(req, res) {
    now = new Date();
    if (now.diff(serverStatusStats.websocket.timestamp, 'seconds') > serverStatusCleanInterval) {
        serverStatusStats.websocket.count = 1;
        serverStatusStats.websocket.timestamp = now;
    } else {
        serverStatusStats.websocket.count += 1;
    }
    numberOfIPs(req.ip);
}

function websocketBeginInc(req, res) {
    now = new Date();
    if (now.diff(serverStatusStats.websocketBegin.timestamp, 'seconds') > serverStatusCleanInterval) {
        serverStatusStats.websocketBegin.count = 1;
        serverStatusStats.websocketBegin.timestamp = now;
    } else {
        serverStatusStats.websocketBegin.count += 1;
    }
    numberOfIPs(req.ip);
}

function websocketEndInc(req, res) {
    now = new Date();
    if (now.diff(serverStatusStats.websocketEnd.timestamp, 'seconds') > serverStatusCleanInterval) {
        serverStatusStats.websocketEnd.count = 1;
        serverStatusStats.websocketEnd.timestamp = now;
    } else {
        serverStatusStats.websocketEnd.count += 1;
    }
    numberOfIPs(req.ip);
}

/******************************************************
 * Update cache of users' IPs
 *****************************************************/
function numberOfIPs(ip) {
    var index = serverStatusStats.numberOfIPs.findIndex('ip', ip);
    now = new Date();

    if (index < 0) {
        serverStatusStats.numberOfIPs.push({
            ip: ip,
            timestamp: now
        });
    } else {
        serverStatusStats.numberOfIPs[index].timestamp = now;
    }
}

/******************************************************
 * Get server status
 *****************************************************/
function serverStatus() {

    //check allowed IPs and secret key
    if ((CONFIG('serverStatusSecretKey') && (CONFIG('serverStatusSecretKey') !== this.query.key)) || (CONFIG('serverStatusAllowedIPs') && JSON.parse(CONFIG('serverStatusAllowedIPs')).indexOf(this.req.ip) < 0)) {
        this.throw403();
        return;
    }

    //make 'self' from 'this' to async functions
    var self = this;

    async(function* () {
        now = new Date();

        //cleaning cache of users' IPs
        serverStatusStats.numberOfIPs.forEach(function (item, index) {
            if (now.diff(item.timestamp, 'seconds') > serverStatusCleanInterval) {
                serverStatusStats.numberOfIPs.splice(index, 1);
            }
        });

        //cleaning counters
        for (item in serverStatusStats) {
            if (now.diff(serverStatusStats[item].timestamp, 'seconds') > serverStatusCleanInterval) {
                serverStatusStats[item].count = 0;
            }
        }

    })(function (err) {
        //response: one value
        if (self.query.item) {
            if (self.query.item === "numberOfIPs") {
                self.plain(serverStatusStats.numberOfIPs.length || 0);
                return;
            }
            self.plain(serverStatusStats[self.query.item].count.toString() + '\n');
            return;
        }

        //response: all values
        self.json({
            request: serverStatusStats.request.count,
            requestBegin: serverStatusStats.requestBegin.count,
            requestEnd: serverStatusStats.requestEnd.count,
            GET: serverStatusStats.GET.count,
            POST: serverStatusStats.POST.count,
            PUT: serverStatusStats.PUT.count,
            DELETE: serverStatusStats.DELETE.count,
            uploadBegin: serverStatusStats.uploadBegin.count,
            uploadEnd: serverStatusStats.uploadEnd.count,
            websocket: serverStatusStats.websocket.count,
            websocketBegin: serverStatusStats.websocketBegin.count,
            websocketEnd: serverStatusStats.websocketEnd.count,
            numberOfIPs: serverStatusStats.numberOfIPs.length || 0
        }, true);
    });
}
