reportApp.factory('ReportData', function($http, $log, $base64, $window, ReportFrom, ReportUntil, ReportUrl,
                                         ReportQstring, ReportAuth, ReportConfig, SharedData, Notification)
{
    var is_worktime = SharedData.getIsWorktime();
    var period_type = SharedData.getPeriodType();
    var errorCode = SharedData.getErrorCode();
    var from;
    var until;
    var rest_from;
    var rest_until;
    var headers;
    var result;

    // open sync
    $.ajaxSetup({
        async: false
    });
    // get config
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



    console.log("is_worktime: " + is_worktime);

    var setExtras = function (){
        if (period_type === 'day'){
            from = SharedData.getWorkFrom();
            until = SharedData.getWorkUntil();
        } else if (period_type === 'week'){
            from = SharedData.getWorkFrom();
            until = SharedData.getWorkUntil();
        } else if (period_type === 'month'){
            from = SharedData.getWorkFrom();
            until = SharedData.getWorkUntil();
        } else {
            if (is_worktime){
                from = SharedData.getWorkFrom();
                until = SharedData.getWorkUntil();
            } else {
                from = SharedData.getFrom();
                until = SharedData.getUntil();
            }
        }

        // set date and headers
        rest_from = new ReportFrom("").setFrom(from).getFrom();
        rest_until = new ReportUntil("").setUntil(until).getUntil();
        headers = new ReportAuth("").addId(config.common.id).addPasswd(config.common.passwd).getAuth();
    };


    console.log("from in ReportData: " + from + " : " + until);


    console.log("REPORTDATA->from : until -> " + from + ':' + until);

    //
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /*
     *   get meta data link
     */
    function getMetaLink() {
        setExtras();
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
                    Notification.error(errorCode.metadata.E01);
                    // notie.alert({
                    //     type: 'error',
                    //     stay: 'true',
                    //     time: 3600,
                    //     text: 'ERROR - 메타 데이터가 존재하지 않습니다.'
                    // });
                }
            })
    }
    /*
     *   get interface name
     */
    function getInterfaceName(hostname) {
        setExtras();
        //http://10.161.147.55:5000/rest/stm/configurations/running/interfaces/?token=1&order=%3Eactual_direction&with=actual_direction=external,class%3C=ethernet_interface&start=0&limit=10&select=name,type,actual_direction,state,description
        var int_url = new ReportUrl("")
            .addDefault(config.common.ip, config.common.port, config.common.path.replace(':hostname', hostname))
            .addSection("interfaces/")
            .addQstring("?token=1&order=%3Eactual_direction&with=actual_direction=external,class%3C=ethernet_interface&start=0&limit=10&select=name,type,actual_direction,peer,state,description")
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
     *   get EXT interface name
     */
    function getExtInterfaceNameWithSpan(hostname) {
        setExtras();
        //http://10.161.147.55:5000/rest/stm/configurations/running/interfaces/?token=1&order=%3Eactual_direction&with=actual_direction=external,class%3C=ethernet_interface&start=0&limit=10&select=name,type,actual_direction,state,description
        var int_url = new ReportUrl("")
            .addDefault(config.common.ip, config.common.port, config.common.path.replace(':hostname', hostname))
            .addSection("interfaces/")
            .addQstring("?token=1&order=%3Eactual_direction&with=actual_direction=external,span_port=true,class%3C=ethernet_interface,&start=0&limit=10&select=name,type,actual_direction,state,description,span_port")
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
     *   get INT interface name
     */
    function getIntInterfaceNameWithSpan(hostname) {
        setExtras();
        //http://10.161.147.55:5000/rest/stm/configurations/running/interfaces/?token=1&order=%3Eactual_direction&with=actual_direction=external,class%3C=ethernet_interface&start=0&limit=10&select=name,type,actual_direction,state,description
        var int_url = new ReportUrl("")
            .addDefault(config.common.ip, config.common.port, config.common.path.replace(':hostname', hostname))
            .addSection("interfaces/")
            .addQstring("?token=1&order=%3Eactual_direction&with=actual_direction=internal,span_port=true,class%3C=ethernet_interface,&start=0&limit=10&select=name,type,actual_direction,state,description,span_port")
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
 *   get interface rcv rate
 */
    function getIntRcvData(hostname, int_name) {
        setExtras();
        // set urls
        console.log('locations:>>>>>', $window.location.protocol+"//"+$window.location.hostname+":");
        var rest_qstring = new ReportQstring("")
            .addSelect('?select='+config.interface_rcv.attr)
            .addFrom('&from='+rest_from)
            .addTimezone('&time='+config.interface_rcv.timezone)
            .addOperation('&operation='+config.interface_rcv.operation)
            .addLimit('&history_points='+config.interface_rcv.hist_point)
            .addUntil('&until='+rest_until)
            // .addUntil('&until='+rest_until+"&int_name="+int_name)    // for report api
            .getQstring();
        var rest_url = new ReportUrl("")
            .addDefault(config.common.ip, config.common.port, config.common.path.replace(":hostname", hostname))
            .addSection(config.interface_rcv.section.replace(":int_name", int_name))
            // .addDefault(config.common.ip, config.common.port, config.common.report_api_path.replace(":hostname", hostname))  // for report api
            // .addSection("interfaces")    // for report api
            .addQstring(rest_qstring)
            .getUrls();
        console.log(rest_url);
        return $http({
            method: 'GET',
            url: rest_url,
            headers: headers
        }).
        then(function(data, status, headers, config) {
                console.log("report data : ", data)
                // successcb(data);
                return data;
            },
            function onError(response) {
                console.log(response);
                if (response.status < 0) {
                    Notification.error(errorCode.interface.E03);
                    // notie.alert({
                    //     type: 'error',
                    //     stay: 'true',
                    //     time: 3600,
                    //     text: 'ERROR - 인터페이스 수신 데이터가 존재하지 않습니다.'
                    // });
                    //alert("ERROR! - 데이터가 존재하지 않습니다.");
                }
            })
    }
    /*
     *   get interface trs rate
     */
    function getIntTrsData(hostname, int_name) {
        setExtras();
        // set urls
        var rest_qstring = new ReportQstring("")
            .addSelect('?select='+config.interface_trs.attr)
            .addFrom('&from='+rest_from)
            .addTimezone('&time='+config.interface_trs.timezone)
            .addOperation('&operation='+config.interface_trs.operation)
            .addLimit('&history_points='+config.interface_trs.hist_point)
            .addUntil('&until='+rest_until)
            .getQstring();
        var rest_url = new ReportUrl("")
            .addDefault(config.common.ip, config.common.port, config.common.path.replace(":hostname", hostname))
            .addSection(config.interface_trs.section.replace(":int_name", int_name))
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
                    Notification.error(errorCode.interface.E02);
                    // notie.alert({
                    //     type: 'error',
                    //     stay: 'true',
                    //     time: 3600,
                    //     text: 'ERROR - 인터페이스 송신 데이터가 존재하지 않습니다.'
                    // });
                }
            })
    }
    /*
 *   get user's total rate
 */
    function getUserData(hostname) {
        setExtras();
        // set urls
        var rest_qstring = new ReportQstring("")
            .addSelect('?select='+config.users_tr.attr)
            .addOrder('&order='+config.users_tr.order)
            .addLimit('&limit='+config.users_tr.limit)
            .addWith('&with='+config.users_tr.with)
            .addFrom('&from='+rest_from)
            .addOperation('&operation='+config.users_tr.operation)
            .addUntil('&until='+rest_until)
            .getQstring();
        var rest_url = new ReportUrl("")
            .addDefault(config.common.ip, config.common.port, config.common.path.replace(":hostname", hostname))
            .addSection(config.users_tr.section)
            .addQstring(rest_qstring)
            .getUrls();
        console.log("getUserData : "+rest_url);
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
                    Notification.error(errorCode.user.E01);
                    // notie.alert({
                    //     type: 'error',
                    //     stay: 'true',
                    //     time: 3600,
                    //     text: 'ERROR - 유저 데이터가 존재하지 않습니다.'
                    // });
                }
            })
    }

    /*
     *   get user's total rate
     */
    function getUserActiveFlows(hostname) {
        setExtras();
        // set urls
        var rest_qstring = new ReportQstring("")
            .addSelect('?select='+config.users_active_flows.attr)
            .addFrom('&from='+rest_from)
            .addOperation('&operation=raw')
            .addHistPoint('&history_points='+config.users_active_flows.hist_point)
            .addLimit('&limit='+config.users_active_flows.limit)
            .addOrder('&order='+config.users_active_flows.order)
            .addUntil('&until='+rest_until)
            .getQstring();
        var rest_url = new ReportUrl("")
            .addDefault(config.common.ip, config.common.port, config.common.path.replace(":hostname", hostname))
            .addSection(config.users_tr.section)
            .addQstring(rest_qstring)
            .getUrls();
        console.log(this.name, rest_url);
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
                    Notification.error(errorCode.user.E02);
                    // notie.alert({
                    //     type: 'error',
                    //     stay: 'true',
                    //     time: 3600,
                    //     text: 'ERROR - 유저 ActiveFlows데이터가 존재하지 않습니다.'
                    // });
                }
            })
    }
    /*
     *   get user's packet disc rate
     */
    function getUserPacketDiscRate(hostname) {
        setExtras();
        // set urls
        var rest_qstring = new ReportQstring("")
            .addSelect('?select='+config.users_tr.attr)
            //.addOperation('&operation=raw')
            .addOrder('&order='+config.users_tr.order)
            .addLimit('&limit='+config.users_tr.limit)
            .addWith('&with='+config.users_tr.with)
            .addFrom('&from='+rest_from)
            .addUntil('&until='+rest_until)
            .getQstring();
        var rest_url = new ReportUrl("")
            .addDefault(config.common.ip, config.common.port, config.common.path.replace(":hostname", hostname))
            .addSection(config.users_tr.section)
            .addQstring(rest_qstring)
            .getUrls();
        // console.log(rest_url);
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
                    Notification.error(errorCode.user.E03);
                    // notie.alert({
                    //     type: 'error',
                    //     stay: 'true',
                    //     time: 3600,
                    //     text: 'ERROR - 유저 패킷 제어양 데이터가 존재하지 않습니다.'
                    // });
                }
            })
    }
    /*
     *   get user group act flows
     */
    function getUserGroupActiveFlows(hostname, size) {
        setExtras();
        // set urls
        //http://10.161.147.55:5000/rest/stm/configurations/running/user_groups/
        // ?select=active_flows
        // &from=-24h
        // &operation=raw
        // &history_points=true
        // &limit=50
        // &order=%3Cactive_flows
        var rest_qstring = new ReportQstring("")
            .addSelect('?select='+config.user_group_active_flows.attr)
            .addFrom('&from='+rest_from)
            .addOperation('&operation=raw')
            .addHistPoint('&history_points='+config.user_group_active_flows.hist_point)
            .addLimit('&limit='+size)
            .addOrder('&order='+config.user_group_active_flows.order)
            .addUntil('&until='+rest_until)
            .getQstring();
        var rest_url = new ReportUrl("")
            .addDefault(config.common.ip, config.common.port, config.common.path.replace(":hostname", hostname))
            .addSection(config.user_group_active_flows.section)
            .addQstring(rest_qstring)
            .getUrls();
        // console.log("get active url : " + rest_url);
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
                    Notification.error(errorCode.user_group.E02);
                    // notie.alert({
                    //     type: 'error',
                    //     stay: 'true',
                    //     time: 3600,
                    //     text: 'ERROR - 유저그룹 ActiveFlows 데이터가 존재하지 않습니다.'
                    // });
                }
            })
    }
    /*
     *   get user's total rate
     */
    function getUserGroupSize(hostname) {
        setExtras();
        // set urls
        var rest_qstring = new ReportQstring("")
            .addLimit('?limit=0')
            .getQstring();
        var rest_url = new ReportUrl("")
            .addDefault(config.common.ip, config.common.port, config.common.path.replace(":hostname", hostname))
            .addSection(config.user_group_tr.section)
            .addQstring(rest_qstring)
            .getUrls();
        console.log("getUserGroupSize in reportData.js", rest_url);
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
                    //     stay: 'true',
                    //     time: 3600,
                    //     text: 'ERROR - 유저 그룹 사이즈가 존재하지 않습니다.'
                    // });
                }
            }
        )
    }
    /*
     *   get user's total rate
     */
    function getUserGroupData(hostname, group_size) {
        setExtras();
        // set urls
        var rest_qstring = new ReportQstring("")
            .addSelect('?select='+config.user_group_tr.attr)
            .addOrder('&order='+config.user_group_tr.order)
            .addLimit('&limit='+group_size)
            // .addWith('&with='+config.user_group_tr.with)
            .addFrom('&from='+rest_from)
            .addOperation('&operation='+config.user_group_tr.operation)
            .addUntil('&until='+rest_until)
            .getQstring();
        var rest_url = new ReportUrl("")
            .addDefault(config.common.ip, config.common.port, config.common.path.replace(":hostname", hostname))
            .addSection(config.user_group_tr.section)
            .addQstring(rest_qstring)
            .getUrls();
        console.log("getUserGroupData : "+rest_url);
        return $http({
            method: 'GET',
            url: rest_url,
            headers: headers
        }).
        then(function(data, status, headers, config) {
                if (data.data.collection.length === 0){
                    Notification.error(errorCode.user_group.W01);
                    // notie.alert({
                    //     type: 'error',
                    //     text: 'WARN - 유저그룹 데이터가 존재하지 않습니다.'
                    // });
                } else {
                    return data;
                }
                // successcb(data);
            },
            function onError(response) {
                if (response.status < 0) {
                    Notification.error(errorCode.user_group.E01);
                    // notie.alert({
                    //     type: 'error',
                    //     stay: 'true',
                    //     time: 3600,
                    //     text: 'ERROR - 유저그룹 데이터가 존재하지 않습니다.'
                    // });
                }
            })
    }
    return {
        getMetaLink: getMetaLink,
        getInterfaceName: getInterfaceName,
        getExtInterfaceNameWithSpan: getExtInterfaceNameWithSpan,
        getIntInterfaceNameWithSpan: getIntInterfaceNameWithSpan,
        getIntRcvData: getIntRcvData,
        getIntTrsData: getIntTrsData,
        getUserData: getUserData,
        getUserActiveFlows: getUserActiveFlows,
        getUserGroupSize: getUserGroupSize,
        getUserGroupData: getUserGroupData,
        getUserGroupActiveFlows: getUserGroupActiveFlows
    };
});