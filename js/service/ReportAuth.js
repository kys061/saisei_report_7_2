reportApp.service('ReportAuth', function($base64) {
    var Auth = function (start) {
        var self = this;
        this.addId = function(id){
            start = start + id;
            return self;
        };
        this.addPasswd = function(pass){
            start = start + ":" + pass;
            return self;
        };
        this.getAuth = function(){
            return {
                "Authorization": "Basic " + $base64.encode(start)
            };
        };
    };
    return Auth;
});