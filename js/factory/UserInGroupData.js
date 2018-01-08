reportApp.factory('UserInGroupData', function($http, $log, $base64, $window, ReportConfig, ReportFrom, ReportUntil,
                                              ReportUrl, ReportQstring, ReportAuth, SharedData, Notification) {
    var from = SharedData.getFrom();
    var until = SharedData.getUntil();
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
    // set date and headers
    var rest_from = new ReportFrom("").setFrom(from).getFrom();
    var rest_until = new ReportUntil("").setUntil(until).getUntil();
    var headers = new ReportAuth("").addId(config.common.id).addPasswd(config.common.passwd).getAuth();
    /*
     *   get user's total rate
     */
    //http://10.161.147.55:5000/rest/stm/configurations/running/users/User-106.249.31.202
    // ?select=active_flows
    // &from=08%3A28%3A25_20151208
    // &operation=raw
    // &history_points=true
    // &until=08%3A28%3A25_20171207
    function getUserInGroupActiveFlows(hostname, user_name) {
        // set urls
        var rest_qstring = new ReportQstring("")
            .addSelect('?select='+config.user_in_group_active_flows.attr)
            .addFrom('&from='+rest_from)
            .addOperation('&operation=raw')
            .addHistPoint('&history_points='+config.user_in_group_active_flows.hist_point)
            .addUntil('&until='+rest_until)
            .getQstring();
        var rest_url = new ReportUrl("")
            .addDefault(config.common.ip, config.common.port, config.common.path.replace(":hostname", hostname))
            .addSection(config.user_in_group_active_flows.section.replace(":user_name", user_name))
            .addQstring(rest_qstring)
            .getUrls();
        console.log("get user in group active flows url : " + rest_url);
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
                console.log(response);
                if (response.status < 0) {
                    Notification.error(errorCode.user.E04);
                    // notie.alert({
                    //     type: 'error',
                    //     // stay: 'true',
                    //     // time: 3600,
                    //     text: 'ERROR - 그룹 내에 유저 ActiveFlows 데이터가 존재하지 않습니다.'
                    // });
                }
            })
    }
    function getUserInGroupAppData(hostname, userid) {
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
    function getUserInGroupData(hostname, user_group_name) {
        var rest_from = new ReportFrom("")
            .setFrom(from)
            .getFrom();
        var rest_until = new ReportUntil("")
            .setUntil(until)
            .getUntil();
        var rest_qstring = new ReportQstring("")
            .addSelect('?select='+config.user_in_group_tr.attr)
            .addOrder('&order='+config.user_in_group_tr.order)
            .addLimit('&limit='+config.user_in_group_tr.limit)
            .addOperation('&operation='+config.user_in_group_tr.operation)
            // .addWith('&with='+config.user_app.with)
            .addFrom('&from='+rest_from)
            .addUntil('&until='+rest_until)
            .getQstring();
        var rest_url = new ReportUrl("")
            .addDefault(config.common.ip, config.common.port, config.common.path.replace(":hostname", hostname))
            .addSection(config.user_in_group_tr.section.replace(':user_group_name', user_group_name))
            .addQstring(rest_qstring)
            .getUrls();
        var headers = new ReportAuth("")
            .addId(config.common.id)
            .addPasswd(config.common.passwd)
            .getAuth();
        // console.log("user in usergroup url");
        // console.log(rest_url);
        return $http({
            method: 'GET',
            url: rest_url,
            headers: headers
        }).
        then(function(data, status, headers, config) {
                console.log(data.data.collection.length);
                if (data.data.collection.length === 0){
                    Notification.error({message: 'WARN - '+user_group_name+'그룹 내에 유저 데이터가 존재하지 않습니다.', delay: 30000});
                    // notie.alert({
                    //     type: 'error',
                    //     text: 'WARN - '+user_group_name+'그룹 내에 유저 데이터가 존재하지 않습니다.'
                    // });
                    return data;
                } else {
                    return data;
                }
            },
            function onError(response) {
                if (response.status < 0) {
                    Notification.error('ERROR - '+user_group_name+'그룹 내 유저 데이터를 받아 올 수 없습니다.');
                    // notie.alert({
                    //     type: 'error',
                    //     // stay: 'true',
                    //     // time: 3600,
                    //     text: 'ERROR - 그룹 내 유저 데이터를 받아 올 수 없습니다.'
                    // });
                }
            })
    }

    return {
        getUserInGroupActiveFlows: getUserInGroupActiveFlows,
        getUserInGroupAppData: getUserInGroupAppData,
        getUserInGroupData: getUserInGroupData
    };
});