reportApp.service('ReportUrl', function() {
    var Urls = function (start) {
        var self = this;
        this.addDefault = function(ip, port, path){
            start = start + ip + port + path;
            return self;
        };
        this.addSection = function(section){
            start = start + section;
            return self;
        };
        this.addQstring = function(qstring){
            start = start + qstring;
            return self;
        };
        this.getUrls = function(){
            // callback(start);
            return start;
        };
    };

    return Urls;
});