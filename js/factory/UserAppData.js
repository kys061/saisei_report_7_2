reportApp.factory('UserAppData', function($http, $log, $base64, $window, ReportConfig, ReportFrom, ReportUntil, ReportUrl, ReportQstring, ReportAuth, SharedData) {

    var is_worktime = SharedData.getIsWorktime();
    var period_type = SharedData.getPeriodType();

    console.log("is_worktime: " + is_worktime);
    if (period_type === 'day'){
        var from = SharedData.getWorkFrom();
        var until = SharedData.getWorkUntil();
    } else if (period_type === 'week'){
        var from = SharedData.getWorkFrom();
        var until = SharedData.getWorkUntil();
    } else if (period_type === 'month'){
        var from = SharedData.getWorkFrom();
        var until = SharedData.getWorkUntil();
    } else {
        if (is_worktime){
            var from = SharedData.getWorkFrom();
            var until = SharedData.getWorkUntil();
        } else {
            var from = SharedData.getFrom();
            var until = SharedData.getUntil();
        }
    }
    console.log("from in ReportData: " + from);
    // var from = SharedData.getFrom();
    // var until = SharedData.getUntil();
    var errorCode = SharedData.getErrorCode();
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

    function getUserAppData(hostname, userid) {
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
            .addDefault(config.common.ip, config.common.port, config.common.path.replace(":hostname", hostname))
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
                // console.log(data);
                // console.log(data.data.collection.length);
                if (data.data.collection.length === 0){
                    Notification.error(errorCode.user.W05);
                    // notie.alert({
                    //     type: 'error',
                    //     // stay: 'true',
                    //     // time: 3600,
                    //     text: 'ERROR - 유저-앱 연관 데이터가 존재하지 않습니다.'
                    // });
                } else {
                    return data;
                }
            },
            function onError(response) {
                if (response.status < 0) {
                    Notification.error(errorCode.user.E05);
                    // notie.alert({
                    //     type: 'error',
                    //     // stay: 'true',
                    //     // time: 3600,
                    //     text: 'ERROR - 유저 데이터가 존재하지 않습니다.'
                    // });
                }
            })
    }

    return {
        getUserAppData: getUserAppData
    };
});