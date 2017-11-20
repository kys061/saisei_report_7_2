reportApp.service('ReportFrom', function() {
    var From = function (start) {
        var self = this;
        this.setFrom = function(_from){
            var from = new Date(_from);
            var _from_yy = moment(from.toUTCString()).utc().format('YYYY');
            var _from_mm = moment(from.toUTCString()).utc().format('MM');
            var _from_dd = moment(from.toUTCString()).utc().format('DD');
            var _from_hh = moment(from.toUTCString()).utc().format('HH');
            var _from_min = moment(from.toUTCString()).utc().format('mm');
            var _from_sec = moment(from.toUTCString()).utc().format('ss');
            start = start+_from_hh+":"+_from_min+":"+_from_sec+"_"+_from_yy+_from_mm+_from_dd;
            return self;
        };
        this.getFrom = function(){
            return start;
        };
    };
    return From;
});