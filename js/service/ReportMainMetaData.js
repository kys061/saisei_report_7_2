reportApp.service('ReportMainMetaData', function($window, $q, ReportMain) {
    var metaData = function() {
        var self = this;
        this.q_metaLinkData = function() {
            var deferred = $q.defer();
            // var from = from;
            // var until = until;
            // var duration = duration;
            // if (isset) {
            ReportMain.getMetaLink().then(function (data) {
                /**********************************/
                /* MetaLinkData          */
                /**********************************/
                // console.log(data);
                var metadata = data;
                var intLink = metadata.data.collection[0]['interfaces'].link.href;
                var hostname = metadata.data.collection[0]['system_name'];

                deferred.resolve({
                    int_link: intLink,
                    hostname: hostname
                });
            });
            return deferred.promise;
        };
    };
    return metaData;
});