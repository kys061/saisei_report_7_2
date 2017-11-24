reportApp.service('ReportIntName', function($window, $q, ReportData) {
    var intName = function() {
        var self = this;
        this.q_intName = function(hostname) {
            var deferred = $q.defer();
            // var from = from;
            // var until = until;
            // var duration = duration;
            // if (isset) {
            ReportData.getInterfaceName(hostname).then(function (data) {
                /**********************************/
                /* MetaLinkData          */
                /**********************************/
                // console.log(data);
                deferred.resolve({ int_data: data });
            });
            return deferred.promise;
        };
    };
    return intName;
});