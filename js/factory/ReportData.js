reportApp.factory('ReportData', function($http, $log, $base64, $window, ReportFrom, ReportUntil, ReportUrl,
                                         ReportQstring, ReportAuth, ReportConfig, SharedData)
{
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
    // set date and headers
    var rest_from = new ReportFrom("").setFrom(from).getFrom();
    var rest_until = new ReportUntil("").setUntil(until).getUntil();
    var headers = new ReportAuth("").addId(config.common.id).addPasswd(config.common.passwd).getAuth();
    /*
     *   get user's total rate
     */
    function getUserData() {
        // set urls
        var rest_qstring = new ReportQstring("")
            .addSelect('?select='+config.users_tr.attr)
            .addOrder('&order='+config.users_tr.order)
            .addLimit('&limit='+config.users_tr.limit)
            .addWith('&with='+config.users_tr.with)
            .addFrom('&from='+rest_from)
            .addUntil('&until='+rest_until)
            .getQstring();
        var rest_url = new ReportUrl("")
            .addDefault(config.common.ip, config.common.port, config.common.path)
            .addSection(config.users_tr.section)
            .addQstring(rest_qstring)
            .getUrls();
        console.log(rest_url);
        return $http({
            method: 'GET',
            url: rest_url,
            headers: headers
        }).
        then(function(data, status, headers, config) {
                return data;
                // successcb(data);
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
    /*
     *   get interface rcv rate
     */
    function getIntRcvData() {
        // set urls
        var rest_qstring = new ReportQstring("")
            .addSelect('?select='+config.interface_rcv.attr)
            .addFrom('&from='+rest_from)
            .addOrder('&operation='+config.interface_rcv.operation)
            .addLimit('&history_points='+config.interface_rcv.hist_point)
            .addUntil('&until='+rest_until)
            .getQstring();
        var rest_url = new ReportUrl("")
            .addDefault(config.common.ip, config.common.port, config.common.path)
            .addSection(config.interface_rcv.section)
            .addQstring(rest_qstring)
            .getUrls();

        return $http({
            method: 'GET',
            url: rest_url,
            headers: headers
        }).
        then(function(data, status, headers, config) {
                // successcb(data);
                return data;
            },
            function onError(response) {
                console.log(response);
                if (response.status < 0) {
                    notie.alert({
                        type: 'error',
                        stay: 'true',
                        time: 3600,
                        text: 'ERROR - 인터페이스 데이터가 존재하지 않습니다.'
                    });
                    //alert("ERROR! - 데이터가 존재하지 않습니다.");
                }
            })
    }
    /*
     *   get interface trs rate
     */
    function getIntTrsData() {
        // set urls
        var rest_qstring = new ReportQstring("")
            .addSelect('?select='+config.interface_trs.attr)
            .addFrom('&from='+rest_from)
            .addOrder('&operation='+config.interface_trs.operation)
            .addLimit('&history_points='+config.interface_trs.hist_point)
            .addUntil('&until='+rest_until)
            .getQstring();
        var rest_url = new ReportUrl("")
            .addDefault(config.common.ip, config.common.port, config.common.path)
            .addSection(config.interface_trs.section)
            .addQstring(rest_qstring)
            .getUrls();
        console.log(rest_url);
        return $http({
            method: 'GET',
            url: rest_url,
            headers: headers
        }).
        then(function(data, status, headers, config) {
                // successcb(data);
                return data;
            },
            function onError(response) {
                if (response.status < 0) {
                    notie.alert({
                        type: 'error',
                        stay: 'true',
                        time: 3600,
                        text: 'ERROR - 인터페이스 데이터가 존재하지 않습니다.'
                    });
                }
            })
    }
    return {
        getUserData: getUserData,
        getIntRcvData: getIntRcvData,
        getIntTrsData: getIntTrsData
    };
});