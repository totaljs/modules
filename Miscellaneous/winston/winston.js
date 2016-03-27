var winston = require('winston');
DailyRotateFile = require('winston-daily-rotate-file');
var fs = require('fs');
var isimler = [];
var yol = __dirname+'/../logs/';
var loggers = {};

exports.id = 'winston';
exports.version = '1.00';

F.on('install', function(type, name) {
    if (type === "module") {
        var adi = MODULE(name).name;
        isimler.push(adi);
        try {
            fs.statSync(yol+'/'+adi);
        } catch (err) {
            fs.mkdir(yol+'/'+adi);
        }
        var logger;
        loggers[adi]= {};
        logger = new (winston.Logger)({
            transports: [new DailyRotateFile({
                name: adi+'_error',
                filename:  yol +'/'+ adi + '/error',
                level: 'error',
                datePattern: '_yyyyMMdd.log'
            })],
            levels: {error: 0}
        });
        loggers[adi]['error'] = logger;
        logger = new (winston.Logger)({
            transports: [new DailyRotateFile({
                name: adi+'_info',
                filename:  yol +'/'+ adi + '/info',
                level: 'info',
                datePattern: '_yyyyMMdd.log'
            })],
            levels: {info: 0},
            exitOnError: false
        });
        loggers[adi]['info'] = logger;
        logger = new (winston.Logger)({
            transports: [new DailyRotateFile({
                name: adi+'_sql',
                filename:  yol +'/'+ adi + '/sql',
                level: 'sql',
                datePattern: '_yyyyMMdd.log'
            })],
            levels: {sql: 0},
            exitOnError: false
        });
        loggers[adi]['sql'] = logger;
    }
});

F.on('load', function() {
    F.logla = {};
    isimler.forEach(function(item) {
        F.logla[item+'_error'] = function(str) {
            if (F.isDebug) console.log(str);
            loggers[item]['error'].error(str);
        };
        F.logla[item+'_info'] = function(str) {
            if (F.isDebug) console.log(str);
            loggers[item]['info'].info(str);
        };
        F.logla[item+'_sql'] = function(str) {
            if (F.isDebug) console.log(str);
            loggers[item]['sql'].sql(str);
        };
    });
});