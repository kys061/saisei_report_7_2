reportApp.factory('UserAppData', function($http, $log, $base64, $window, ReportConfig, ReportFrom, ReportUntil, ReportUrl, ReportQstring, ReportAuth, SharedData) {
    var from = SharedData.getFrom();
    var until = SharedData.getUntil();
    // open sync
    $.ajaxSetup({
        async: false
    });
    // get config
    var result;
    var config = (function() {
        // var result;
        $.getJSON("./config/report-config.json", function(d) {
            console.log(d);
            result = d.config;
        });
        return result;
    })();
    // close sync
    $.ajaxSetup({
        async: true
    });

    function getUserAppData(userid) {
        var rest_from = new ReportFrom("")
            .setFrom(from)
            .getFrom();
        var rest_until = new ReportUntil("")
            .setUntil(until)
            .getUntil();
        var rest_qstring = new ReportQstring("")
            .addSelect('?select='+config.user_app.attr)
            .addOrder('&order='+config.user_app.order)
            .addLimit('&limit='+config.user_app.limit)
            .addWith('&with='+config.user_app.with)
            .addFrom('&from='+rest_from)
            .addUntil('&until='+rest_until)
            .getQstring();
        var rest_url = new ReportUrl("")
            .addDefault(config.common.ip, config.common.port, config.common.path)
            .addSection(config.user_app.section.replace(':userID', userid))
            .addQstring(rest_qstring)
            .getUrls();
        var headers = new ReportAuth("")
            .addId(config.common.id)
            .addPasswd(config.common.passwd)
            .getAuth();

        return $http({
            method: 'GET',
            url: rest_url,
            headers: headers
        }).
        then(function(data, status, headers, config) {
                return data;
            },
            function onError(response) {
                if (response.status < 0) {
                    notie.alert({
                        type: 'error',
                        stay: 'true',
                        time: 3600,
                        text: 'ERROR - 유저 데이터가 존재하지 않습니다.'
                    });
                }
            })
    }

    return {
        getUserAppData: getUserAppData
    };
});