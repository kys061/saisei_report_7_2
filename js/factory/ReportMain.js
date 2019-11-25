reportApp.factory('ReportMain', function($http, $log, $base64, $window, ReportFrom, ReportUntil, ReportUrl,
                                               ReportQstring, ReportAuth, ReportConfig, SharedData, Notification)
{
    var from = SharedData.getFrom();
    var until = SharedData.getUntil();
    var errorCode = SharedData.getErrorCode();
    console.log("REPORTDATA->from : until -> " + from + ':' + until);
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
    console.log(config);
    // set date and headers
    var rest_from = new ReportFrom("").setFrom(from).getFrom();
    var rest_until = new ReportUntil("").setUntil(until).getUntil();
    var headers = new ReportAuth("").addId(config.common.id).addPasswd(config.common.passwd).getAuth();
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /*
     *   get meta data link
     */
    function getMetaLink() {
        var meta_url = new ReportUrl("")
            .addDefault(config.common.ip, config.common.port, config.common.metapath)
            .addSection("")
            .addQstring("")
            .getUrls();
        // console.log("meta_url");
        // console.log(meta_url);
        return $http({
            method: 'GET',
            url: meta_url,
            headers: headers
        }).
        then(function(data, status, headers, config) {
                return data;
                // successcb(data);
            },
            function onError(response) {
                if (response.status < 0) {
                    Notification.error({ message: errorCode.metadata.E01, delay: null, title: errorCode.title.error });
                    // notie.alert({
                    //     type: 'error',
                    //     // stay: 'true',
                    //     // time: 3600,
                    //     text: 'ERROR - 메타 데이터가 존재하지 않습니다.'
                    // });
                }
            })
    }
    /*
     *   get meta data link
     */
    function getInterfaceName(hostname) {
        //http://10.161.147.55:5000/rest/stm/configurations/running/interfaces/?token=1&order=%3Eactual_direction&with=actual_direction=external,class%3C=ethernet_interface&start=0&limit=10&select=name,type,actual_direction,state,description
        var int_url = new ReportUrl("")
            .addDefault(config.common.ip, config.common.port, config.common.path.replace(':hostname', hostname))
            .addSection("interfaces/")
            .addQstring("?token=1&order=%3Eactual_direction&with=actual_direction=external,class%3C=ethernet_interface&start=0&limit=10&select=name,type,actual_direction,state,description")
            .getUrls();
        // console.log(int_url);
        return $http({
            method: 'GET',
            url: int_url,
            headers: headers
        }).
        then(function(data, status, headers, config) {
                return data;
                // successcb(data);
            },
            function onError(response) {
                if (response.status < 0) {
                    Notification.error(errorCode.interface.E01);
                    // notie.alert({
                    //     type: 'error',
                    //     stay: 'true',
                    //     time: 3600,
                    //     text: 'ERROR - DPDK 인터페이스 이름이 존재하지 않습니다.'
                    // });
                }
            })
    }
    /*
     *   get user's group size
     */
    function getUserGroupSize(hostname) {
        // set urls
        var rest_qstring = new ReportQstring("")
            .addLimit('?limit=0')
            .getQstring();
        var rest_url = new ReportUrl("")
            .addDefault(config.common.ip, config.common.port, config.common.path.replace(":hostname", hostname))
            .addSection(config.user_group_tr.section)
            .addQstring(rest_qstring)
            .getUrls();
        // console.log(rest_url);
        return $http({
            method: 'GET',
            url: rest_url,
            headers: headers
        }).
        then(
            function(data, status, headers, config) {
                return data;
                // successcb(data);
            },
            function onError(response) {
                if (response.status < 0) {
                    Notification.error(errorCode.user_group.E03);
                    // notie.alert({
                    //     type: 'error',
                    //     // stay: 'true',
                    //     // time: 3600,
                    //     text: 'ERROR - 유저 그룹 사이즈가 존재하지 않습니다.'
                    // });
                }
            }
        )
    }
    /*
     *   get user's size
    */
    function getUserSize(hostname) {
        // set urls
        var rest_qstring = new ReportQstring("")
            .addLimit('?limit=0')
            .getQstring();
        var rest_url = new ReportUrl("")
            .addDefault(config.common.ip, config.common.port, config.common.path.replace(":hostname", hostname))
            .addSection(config.users_tr.section)
            .addQstring(rest_qstring)
            .getUrls();
        console.log("getUserSize", rest_url);
        return $http({
            method: 'GET',
            url: rest_url,
            headers: headers
        }).
        then(
            function(data, status, headers, config) {
                return data;
                // successcb(data);
            },
            function onError(response) {
                if (response.status < 0) {
                    Notification.error(errorCode.user.E03);
                    // notie.alert({
                    //     type: 'error',
                    //     // stay: 'true',
                    //     // time: 3600,
                    //     text: 'ERROR - 유저 사이즈가 존재하지 않습니다.'
                    // });
                }
            }
        )
    }
    return {
        getMetaLink: getMetaLink,
        getInterfaceName: getInterfaceName,
        getUserSize: getUserSize,
        getUserGroupSize: getUserGroupSize
    };
});