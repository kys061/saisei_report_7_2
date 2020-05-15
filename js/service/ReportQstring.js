reportApp.service('ReportQstring', function() {
    var Qstring = function (start) {
        var self = this;
        this.addSelect = function(attr){
            start = start + attr;
            return self;
        };
        this.addOperation = function(operation){
            start = start + operation;
            return self;
        };
        this.addOrder = function(order){
            start = start + order;
            return self;
        };
        this.addHistPoint = function(val){
            start = start + val;
            return self;
        };
        this.addLimit = function(limit){
            start = start + limit;
            return self;
        };
        this.addWith = function(_with){
            start = start + _with;
            return self;
        };
        this.addFrom = function(from){
            start = start + from;
            return self;
        };
        this.addUntil = function(until){
            start = start + until;
            return self;
        };
        this.addTimezone = function(timezone){
            start = start + timezone;
            return self;
        };

        this.getQstring = function(){
            return start;
        };
    };

    return Qstring;
});