reportApp.factory('ReportData', function($http, $log, $base64, $window, ReportFrom, ReportUntil, ReportUrl,
                                         ReportQstring, ReportAuth, ReportConfig, SharedData)
{
    var from = SharedData.getFrom();
    var until = SharedData.getUntil();
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
                    notie.alert({
                        type: 'error',
                        // stay: 'true',
                        // time: 3600,
                        text: 'ERROR - DPDK 인터페이스 이름이 존재하지 않습니다.'
                    });
                }
            })
    }
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
                    notie.alert({
                        type: 'error',
                        // stay: 'true',
                        // time: 3600,
                        text: 'ERROR - 메타 데이터가 존재하지 않습니다.'
                    });
                }
            })
    }
/*
 *   get user's total rate
 */
    function getUserGroupActiveFlows(hostname, size) {
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
                    notie.alert({
                        type: 'error',
                        // stay: 'true',
                        // time: 3600,
                        text: 'ERROR - 유저그룹 ActiveFlows 데이터가 존재하지 않습니다.'
                    });
                }
            })
    }
    /*
     *   get user's total rate
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
                    notie.alert({
                        type: 'error',
                        // stay: 'true',
                        // time: 3600,
                        text: 'ERROR - 유저 그룹 사이즈가 존재하지 않습니다.'
                    });
                }
            }
        )
    }
    /*
     *   get user's total rate
     */
    function getUserGroupData(hostname, group_size) {
        // set urls
        var rest_qstring = new ReportQstring("")
            .addSelect('?select='+config.user_group_tr.attr)
            .addOrder('&order='+config.user_group_tr.order)
            .addLimit('&limit='+group_size)
            // .addWith('&with='+config.user_group_tr.with)
            .addFrom('&from='+rest_from)
            .addUntil('&until='+rest_until)
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
        then(function(data, status, headers, config) {
                if (data.data.collection.length === 0){
                    notie.alert({
                        type: 'error',
                        text: 'WARN - 그룹 데이터가 존재하지 않습니다.'
                    });
                } else {
                    return data;
                }
                // successcb(data);
            },
            function onError(response) {
                if (response.status < 0) {
                    notie.alert({
                        type: 'error',
                        // stay: 'true',
                        // time: 3600,
                        text: 'ERROR - 유저 데이터가 존재하지 않습니다.'
                    });
                }
            })
    }
    /*
     *   get user's total rate
     */
    function getUserData(hostname) {
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
                    notie.alert({
                        type: 'error',
                        // stay: 'true',
                        // time: 3600,
                        text: 'ERROR - 유저 데이터가 존재하지 않습니다.'
                    });
                }
            })
    }
    /*
     *   get user's total rate
     */
    function getUserActiveFlows(hostname) {
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
        console.log("get active url : " + rest_url);
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
                        // stay: 'true',
                        // time: 3600,
                        text: 'ERROR - 유저 ActiveFlows데이터가 존재하지 않습니다.'
                    });
                }
            })
    }
    /*
     *   get user's packet disc rate
     */
    function getUserPacketDiscRate(hostname) {
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
                    notie.alert({
                        type: 'error',
                        // stay: 'true',
                        // time: 3600,
                        text: 'ERROR - 유저 패킷 제어양 데이터가 존재하지 않습니다.'
                    });
                }
            })
    }
    /*
     *   get interface rcv rate
     */
    function getIntRcvData(hostname, int_name) {
        // set urls
        var rest_qstring = new ReportQstring("")
            .addSelect('?select='+config.interface_rcv.attr)
            .addFrom('&from='+rest_from)
            .addOrder('&operation='+config.interface_rcv.operation)
            .addLimit('&history_points='+config.interface_rcv.hist_point)
            .addUntil('&until='+rest_until)
            .getQstring();
        var rest_url = new ReportUrl("")
            .addDefault(config.common.ip, config.common.port, config.common.path.replace(":hostname", hostname))
            .addSection(config.interface_rcv.section.replace(":int_name", int_name))
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
                        // stay: 'true',
                        // time: 3600,
                        text: 'ERROR - 인터페이스 수신 데이터가 존재하지 않습니다.'
                    });
                    //alert("ERROR! - 데이터가 존재하지 않습니다.");
                }
            })
    }
    /*
     *   get interface trs rate
     */
    function getIntTrsData(hostname, int_name) {
        // set urls
        var rest_qstring = new ReportQstring("")
            .addSelect('?select='+config.interface_trs.attr)
            .addFrom('&from='+rest_from)
            .addOrder('&operation='+config.interface_trs.operation)
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
                    notie.alert({
                        type: 'error',
                        // stay: 'true',
                        // time: 3600,
                        text: 'ERROR - 인터페이스 송신 데이터가 존재하지 않습니다.'
                    });
                }
            })
    }
    return {
        getInterfaceName: getInterfaceName,
        getMetaLink: getMetaLink,
        getUserData: getUserData,
        getUserActiveFlows: getUserActiveFlows,
        getUserGroupSize: getUserGroupSize,
        getUserGroupData: getUserGroupData,
        getUserGroupActiveFlows: getUserGroupActiveFlows,
        getIntRcvData: getIntRcvData,
        getIntTrsData: getIntTrsData
    };
});