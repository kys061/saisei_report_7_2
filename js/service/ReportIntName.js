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
                var collection = data.data.collection;
                var int_ext_name = [];
                for (var i = 0; i < collection.length; i++){
                    int_ext_name.push(collection[i].name);
                }
                // deferred.resolve({ int_data: data });
                deferred.resolve({
                    int_ext_name: int_ext_name
                });
            });
            return deferred.promise;
        };
    };
    return intName;
});