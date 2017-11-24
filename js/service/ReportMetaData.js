reportApp.service('ReportMetaData', function($window, $q, ReportData) {
    var metaData = function() {
        var self = this;
        this.q_metaLinkData = function() {
            var deferred = $q.defer();
            // var from = from;
            // var until = until;
            // var duration = duration;
            // if (isset) {
            ReportData.getMetaLink().then(function (data) {
                /**********************************/
                /* MetaLinkData          */
                /**********************************/
                // console.log(data);
                deferred.resolve({ metadata: data });
            });
            return deferred.promise;
        };
    };
    return metaData;
});