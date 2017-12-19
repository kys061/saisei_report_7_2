reportApp.service('ReportUserGroupSize', function($window, $q, ReportData) {
    var UserGroupSize = function() {
        var self = this;
        this.q_userGroupSize = function() {
            var deferred = $q.defer();
            // var from = from;
            // var until = until;
            // var duration = duration;
            // if (isset) {
            ReportData.getUserGroupSize().then(function (data) {
                /**********************************/
                /* get userGroupSize          */
                /**********************************/
                // console.log(data);
                var group_size = data.data.size;
                console.log(group_size);

                deferred.resolve({
                    group_size: group_size
                });
            });
            return deferred.promise;
        };
    };
    return UserGroupSize;
});