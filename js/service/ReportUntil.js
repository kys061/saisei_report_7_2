reportApp.service('ReportUntil', function() {
    var Until = function (start) {
        var self = this;
        this.setUntil = function(_until){
            var until = new Date(_until);
            var _until_yy = moment(until.toUTCString()).utc().format('YYYY');
            var _until_mm = moment(until.toUTCString()).utc().format('MM');
            var _until_dd = moment(until.toUTCString()).utc().format('DD');
            var _until_hh = moment(until.toUTCString()).utc().format('HH');
            var _until_min = moment(until.toUTCString()).utc().format('mm');
            var _until_sec = moment(until.toUTCString()).utc().format('ss');
            start = start+_until_hh+":"+_until_min+":"+_until_sec+"_"+_until_yy+_until_mm+_until_dd;
            return self;
        };
        this.getUntil = function(){
            return start;
        };
    };
    return Until;
});