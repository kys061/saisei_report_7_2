reportApp.service('ReportConfig', function($q) {
    var Config = function() {
        var self = this;
        var result;
        this.getConfig = function() {
            $.getJSON("./config/report-config.json", function (d) {
                result = d.config;
            });
            return result;
        };
        this.q_configData = function() {
            var deferred = $q.defer();
            // var config;
            $.getJSON("./config/report-config.json", function (d) {
                // config = d.config;
                deferred.resolve(d.config);
            });
            return deferred.promise;
        }
    };

    return Config;
});