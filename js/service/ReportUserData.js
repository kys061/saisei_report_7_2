reportApp.service('ReportUserData', function($window, $q, ReportData, UserAppData, _) {
    var UserData = function() {
        var self = this;
        // this.q_userAppData = function(){
        //     var deferred = $q.defer();
        //
        // };
        this.q_userData = function(hostname, from, until, work_from, work_until, duration, isset) {
            var deferred = $q.defer();
            var from = from;
            var until = until;
            var duration = duration;
            var complete_count = 0;
            if (isset) {
                ReportData.getUserActiveFlows(hostname).then(function (data) {
                    complete_count += 1;
                    // 1. 데이터를 가져온다.
                    // 2. 시간과 데이터의 값을 각각의 배열로 만든다.
                    // 3. 데이터 배열에서 max값을 가진 index를 구한다.
                    // 4. 해당 index를 가진 배열의 데이터 값과 시간 값을 가진 쌍으로 가진 10개의 2차원 배열을 만든다.
                    //  -> [[시간, max값], ... [시간, max값]]
                    /**
                     * Add attributes to each object of an array.
                     *
                     * @param {array} foo - Array of objects where we will add the attibutes
                     * @param {function} iterator
                     */
                    // _.each(foo, function(element, index) {
                    //     _.extend(element, {field1: index}, {field2: 'bar', field3: 'baz'});
                    // });
                    console.log(data);
                    var _history_users_active_flows_data = data['data']['collection'];
                    var _history_users_active_flows = data['data']['collection'][0]['_history_active_flows'];
                    var _history_users_active_flows_length = data['data']['collection'][0]['_history_length_active_flows'];
                    var users_act_flow_data = [];
                    var users_act_flow_time = [];
                    var arr_users_act_flow_data = [];
                    var arr_users_act_flow_time = [];
                    var users_act_flow_max_data = [];

                    // change date to ko
                    _.each(_history_users_active_flows_data, function(collection) {
                        // console.log(collection);
                        // console.log(_.max(collection['_history_active_flows'], function(history_active_flows){
                        //     return history_active_flows[1];
                        // }));
                        // _.each(_.max(collection['_history_active_flows'], function (history_active_flows) {
                        //     return history_active_flows[1];
                        // }), function (max_active_flow_data) {
                        //     console.log(max_active_flow_data);
                        //     // var t = new Date(max_active_flow_data[0]);
                        //     // return max_active_flow_data.push(t);
                        // });
                        users_act_flow_max_data.push(_.max(collection['_history_active_flows'], function(history_active_flows){
                            return history_active_flows[1];
                        }));
                    });
                    // data : users_act_flow_max_data
                    // elem : element
                    // index : index of element
                    _.each(users_act_flow_max_data, function(elem, index, data){
                        var t = new Date(elem[0]);
                        elem.push(t.toLocaleString());
                    });



                    // console.log(_history_users_active_flows_data);
                    // for(var j = 0; j < _history_users_active_flows_data.length; j++) {
                    //     for (var i = 0; i < _history_users_active_flows_data[j]['_history_active_flows'].length; i++) {
                    //         // if (i % 20 === 0) {
                    //         var t = new Date(_history_users_active_flows_data[j]['_history_active_flows'][i][0]);
                    //         // var t = new Date(_history_users_active_flows[i][0]);
                    //         users_act_flow_time.push(t.toLocaleString());
                    //         users_act_flow_data.push(_history_users_active_flows_data[j]['_history_active_flows'][i][1]);
                    //         // users_act_flow_data.push(_history_users_active_flows[i][1]);
                    //         // data_rcv_rate.push(Math.round(_history_rcv[i][1] * 0.001));
                    //         // }
                    //     }
                    //     arr_users_act_flow_time.push(users_act_flow_time);
                    //     arr_users_act_flow_data.push(users_act_flow_data);
                    // }
                    // console.log(arr_users_act_flow_time);
                    // console.log(arr_users_act_flow_data);
                    // var users_act_flow_max_val = [];
                    // var users_act_flow_max_time = [];
                    // for (var k = 0; k < _history_users_active_flows_data.length; k++) {
                    //     var users_act_flow_max_index = users_act_flow_data.indexOf(Math.max.apply(Math, arr_users_act_flow_data[k]));
                    //     users_act_flow_max_val.push(Math.max.apply(Math, arr_users_act_flow_data[k]));
                    //     users_act_flow_max_time.push(arr_users_act_flow_time[k][users_act_flow_max_index]);
                    //     users_act_flow_max_data.push([arr_users_act_flow_time[k][users_act_flow_max_index], Math.max.apply(Math, arr_users_act_flow_data[k])])
                    // }

                    // var users_act_flow_max_index = users_act_flow_data.indexOf(Math.max.apply(Math, users_act_flow_data));
                    // var users_act_flow_max_val = Math.max.apply(Math, users_act_flow_data);
                    // var users_act_flow_max_time = users_act_flow_time[users_act_flow_max_index];

                    // users_act_flow_max_data.push([users_act_flow_max_val, users_act_flow_max_time]);

                    // console.log(users_act_flow_data);
                    // var users_act_flow_max_index = users_act_flow_data.indexOf(Math.max.apply(Math, users_act_flow_data));
                    // var users_act_flow_max_val = Math.max.apply(Math, users_act_flow_data);
                    // var users_act_flow_max_time = users_act_flow_time[users_act_flow_max_index];

                    // for (var j = 0; j < _history_users_active_flows_length; j++) {
                    //     users_act_flow_max_data.push([]);
                    // }

                    // console.log(users_act_flow_max);
                    // console.log(users_act_flow_data[users_act_flow_data.indexOf(Math.max.apply(Math, users_act_flow_data))]);
                    // console.log(users_act_flow_data.indexOf(Math.max.apply(Math, users_act_flow_data)));

                    ReportData.getUserData(hostname).then(function (data) {
                        complete_count += 1;
                        // console.log("getUserData : ", data);
                        var _arr_collection = data.data.collection;
                        console.log("getUserData : ", _arr_collection);
                        /*
                         * USER TOTAL RATE OF INTERFACE
                         */

                        /******************************************************************************************************************/
                        /* 사용자 전체 사용량 데이터 변수
                        /******************************************************************************************************************/
                        // for users data
                        var _users_label = [];
                        var _users_from = [];
                        var _users_until = [];
                        var _users_series = ['다운로드 사용량(Mbit/s)', '업로드 사용량(Mbit/s)'];
                        var _users_flow_disc_series = ['플로우 사용량(/s)', '제어량(/s)'];
                        var _users_total = [];
                        var _users_download = [];
                        var _users_upload = [];
                        var _users_active_flows = [];
                        var _users_packet_disc_rate = [];
                        var _users_packet_disc = [];
                        var _users_tb_data = [];
                        var _users_data = [];
                        var _users_flow_disc_data = [];
                        /******************************************************************************************************************/
                        /* 사용자-어플리케이션 TOP3 데이터 변수
                        /******************************************************************************************************************/
                        // for users app data
                        var _users_app = [];
                        var _users_app_top1 = [];
                        var _users_app_top2 = [];
                        var _users_app_top3 = [];
                        var _users_app_data = [];
                        var _users_appName_top1 = [];
                        var _users_appName_top2 = [];
                        var _users_appName_top3 = [];
                        var _users_app_label = [];
                        var _users_app_series = [];
                        var _users_app_option = [];

                        var colors = ['#ff6384', '#45b7cd', '#ffe200'];
                        var _users = data['data']['collection'];
                        // console.log(data['data']['collection']);
                        /*
                           1. _users_label : username for user graph,
                           2. _users_from : start local date,
                           3. _users_until : end local date,
                           4. _users_total : total rate,
                           5. _users_download : dest_smoothed_rate,
                           6. _users_upload : source_smoothed_rate,
                           7. _users_tb_data : all data for table,
                           8. _users_data : all data for user graph,
                           9. _users_option : option for user graph,
                           10.
                        */
                        for (var i = 0; i < _users.length; i++) {
                            _users_label.push(_users[i]['name']);
                            var user_from = new Date(_users[i]['from']);
                            user_from.setHours(user_from.getHours() + 9);
                            _users_from.push(user_from.toLocaleString());
                            var user_until = new Date(_users[i]['until']);
                            _users_until.push(user_until.setHours(user_until.getHours() + 9));
                            _users_total.push((_users[i]['total_rate'] * 0.001).toFixed(3));
                            _users_download.push((_users[i]['dest_rate'] * 0.001).toFixed(3));
                            _users_upload.push((_users[i]['source_rate'] * 0.001).toFixed(3));
                            _users_active_flows.push(_users[i]['active_flows']);
                            _users_packet_disc_rate.push(_users[i]['packet_discard_rate']);
                            _users_packet_disc_rate.push(_users[i]['packets_discarded']);
                            _users_tb_data.push({
                                name: _users[i]['name'],
                                from: (_.has(_users[i], "from")) ? user_from.toLocaleString():"None",
                                until: (_.has(_users[i], "until")) ? user_until.toLocaleString():"None",
                                total: (_users[i]['total_rate'] * 0.001).toFixed(3),
                                down: (_users[i]['dest_rate'] * 0.001).toFixed(3),
                                up: (_users[i]['source_rate'] * 0.001).toFixed(3),
                                flows: _users[i]['active_flows'],
                                // max_flows: users_act_flow_max_data,
                                disc_rate: _users[i]['packet_discard_rate'],
                                pack_disc: _users[i]['packets_discarded']

                            });
                        }
                        console.log("user_act_flow_max_data");
                        console.log(users_act_flow_max_data);
                        _.each(_users_tb_data, function(e, i){
                            _.each(users_act_flow_max_data, function(elem, index){
                                if (index === i) {
                                    _.extend(e, {max_flows: elem[1]}, {max_flows_time: elem[2]});
                                }
                            });
                        });


                        console.log(_users_tb_data);

                        // var _users_data = [_users_total, _users_download, _users_upload];
                        // _users_data.push(_users_total);
                        _users_data.push(_users_download);
                        _users_data.push(_users_upload);
                        // _users_data.push(_users_active_flows);
                        // _users_data.push(_users_packet_disc_rate);
                        _users_flow_disc_data.push(_users_active_flows);
                        _users_flow_disc_data.push(_users_packet_disc_rate);

                        var _users_option = {
                            scales: {
                                yAxes: [{
                                    ticks: {
                                        fontSize: 12,
                                        fontStyle: "bold"
                                    },
                                    scaleLabel: {
                                        display: true,
                                        fontSize: 14,
                                        labelString: '내부사용자',
                                        fontStyle: "bold"
                                    }
                                }],
                                xAxes: [{
                                    ticks: {
                                        fontSize: 12,
                                        fontStyle: "bold"
                                    },
                                    scaleLabel: {
                                        display: true,
                                        fontSize: 14,
                                        labelString: '사용량(Mbit/s)',
                                        fontStyle: "bold"
                                    }
                                }]
                            }
                        };

                        // var _users_option = {
                        //     scales: {
                        //         yAxes: [{
                        //             ticks: {
                        //                 fontSize: 12,
                        //                 fontStyle: "bold"
                        //             },
                        //             scaleLabel: {
                        //                 display: true,
                        //                 fontSize: 14,
                        //                 labelString: '내부사용자',
                        //                 fontStyle: "bold"
                        //             }
                        //         }],
                        //         xAxes: [{
                        //             id: 'x-axis-2',
                        //             type: 'linear',
                        //             display: true,
                        //             position: 'top',
                        //             ticks: {
                        //                 fontSize: 12,
                        //                 fontStyle: "bold"
                        //             },
                        //             scaleLabel: {
                        //                 display: true,
                        //                 fontSize: 14,
                        //                 labelString: '사용/제어량(/s)',
                        //                 fontStyle: "bold"
                        //             }
                        //         },
                        //         {
                        //             id: 'x-axis-1',
                        //             type: 'linear',
                        //             display: true,
                        //             position: 'bottom',
                        //             ticks: {
                        //                 fontSize: 12,
                        //                 fontStyle: "bold"
                        //             },
                        //             scaleLabel: {
                        //                 display: true,
                        //                 fontSize: 14,
                        //                 labelString: '사용량(Mbit/s)',
                        //                 fontStyle: "bold"
                        //             }
                        //         }]
                        //     }
                        // };

                        var _users_flow_disc_option = {
                            scales: {
                                yAxes: [{
                                    ticks: {
                                        fontSize: 12,
                                        fontStyle: "bold"
                                    },
                                    scaleLabel: {
                                        display: true,
                                        fontSize: 14,
                                        labelString: '내부사용자',
                                        fontStyle: "bold"
                                    }
                                }],
                                xAxes: [{
                                    ticks: {
                                        fontSize: 12,
                                        fontStyle: "bold"
                                    },
                                    scaleLabel: {
                                        display: true,
                                        fontSize: 14,
                                        labelString: '사용/제어량(/s)',
                                        fontStyle: "bold"
                                    }
                                }]
                            }
                        };
                        var _users_datasetOverride = [{
                            xAxisID: 'x-axis-1'
                        }, {
                            xAxisID: 'x-axis-2'
                        }];
                        for (var i = 0; i < _users_label.length; i++) {
                            complete_count += 1;
                            /**********************************/
                            /* USER-APP DATA                  */
                            /**********************************/
                            UserAppData.getUserAppData(hostname, _users_label[i]).then(function (data) {
                                /*
                                    1. top1_from, top1_until
                                    2. top2_from, top2_until
                                    3. top3_from, top3_until
                                    4. _users_app : user_app all data for table
                                    5. _users_app_top1, _users_app_top2, _users_app_top3 : app total rate data for graph
                                    6. _users_appName_top1, _users_appName_top2, _users_appName_top3 : app name for graph
                                    7. _users_app_label : user name and app name for graph
                                    8. _users_app_option : options for graph
                                */

                                if (_.has(data['data']['collection'][0], "from") && _.has(data['data']['collection'][0], "until")) {
                                    var top1_from = new Date(data['data']['collection'][0]['from']);
                                    top1_from.setHours(top1_from.getHours() + 9);
                                    var top1_until = new Date(data['data']['collection'][0]['until']);
                                    top1_until.setHours(top1_until.getHours() + 9);
                                }else{
                                    var top1_from = "None";
                                    var top1_until = "None";
                                }
                                if (_.has(data['data']['collection'][1], "from") && _.has(data['data']['collection'][1], "until")) {
                                    var top2_from = new Date(data['data']['collection'][1]['from']);
                                    top2_from.setHours(top2_from.getHours() + 9);
                                    var top2_until = new Date(data['data']['collection'][1]['until']);
                                    top2_until.setHours(top2_until.getHours() + 9);
                                }else{
                                    var top2_from = "None";
                                    var top2_until = "None";
                                }
                                if (_.has(data['data']['collection'][2], "from") && _.has(data['data']['collection'][2], "until")) {
                                    var top3_from = new Date(data['data']['collection'][2]['from']);
                                    top3_from.setHours(top3_from.getHours() + 9);
                                    var top3_until = new Date(data['data']['collection'][2]['until']);
                                    top3_until.setHours(top3_until.getHours() + 9);
                                }else{
                                    var top3_from = "None";
                                    var top3_until = "None";
                                }
                                // var top3_from = new Date(data['data']['collection'][2]['from']);
                                // top3_from.setHours(top3_from.getHours() + 9);
                                // var top3_until = new Date(data['data']['collection'][2]['until']);
                                // top3_until.setHours(top3_until.getHours() + 9);
                                // console.log(data['data']['collection'][0].link.href.split('/')[6]);
                                _users_app.push({
                                    "user_name": data['data']['collection'][0].link.href.split('/')[6],
                                    "top1_app_name": (_.has(data['data']['collection'][0], "name")) ? data['data']['collection'][0]['name']:'None',
                                    "top1_app_total": (_.has(data['data']['collection'][0], "total_rate")) ? (data['data']['collection'][0]['total_rate'] * 0.001).toFixed(3):0,
                                    "top1_app_from": top1_from.toLocaleString(),
                                    "top1_app_until": top1_until.toLocaleString(),
                                    "top2_app_name": (_.has(data['data']['collection'][1], "name")) ? data['data']['collection'][1]['name']:'None',
                                    "top2_app_total": (_.has(data['data']['collection'][1], "total_rate")) ? (data['data']['collection'][1]['total_rate'] * 0.001).toFixed(3):0,
                                    "top2_app_from": top2_from.toLocaleString(),
                                    "top2_app_until": top2_until.toLocaleString(),
                                    "top3_app_name": (_.has(data['data']['collection'][2], "name")) ? data['data']['collection'][2]['name']:'None',
                                    "top3_app_total": (_.has(data['data']['collection'][2], "total_rate")) ? (data['data']['collection'][2]['total_rate'] * 0.001).toFixed(3):0,
                                    "top3_app_from": top3_from.toLocaleString(),
                                    "top3_app_until": top3_until.toLocaleString()
                                });
                                _users_app.sort(function (a, b) { // DESC
                                    return b['top1_app_total'] - a['top1_app_total'];
                                });
                                (_.has(data['data']['collection'][0], "total_rate"))?_users_app_top1.push((data['data']['collection'][0]['total_rate'] * 0.001).toFixed(3)):_users_app_top1.push(0);
                                (_.has(data['data']['collection'][1], "total_rate"))?_users_app_top2.push((data['data']['collection'][1]['total_rate'] * 0.001).toFixed(3)):_users_app_top2.push(0);
                                (_.has(data['data']['collection'][2], "total_rate"))?_users_app_top3.push((data['data']['collection'][2]['total_rate'] * 0.001).toFixed(3)):_users_app_top3.push(0);
                                // _users_app_top2.push((data['data']['collection'][1]['total_rate'] * 0.001).toFixed(3));
                                // _users_app_top3.push((data['data']['collection'][2]['total_rate'] * 0.001).toFixed(3));
                                (_.has(data['data']['collection'][0], "name"))?_users_appName_top1.push((data['data']['collection'][0]['name'] * 0.001).toFixed(3)):_users_appName_top1.push(0);
                                (_.has(data['data']['collection'][1], "name"))?_users_appName_top2.push((data['data']['collection'][1]['name'] * 0.001).toFixed(3)):_users_appName_top2.push(0);
                                (_.has(data['data']['collection'][2], "name"))?_users_appName_top3.push((data['data']['collection'][2]['name'] * 0.001).toFixed(3)):_users_appName_top3.push(0);
                                // _users_appName_top1.push(data['data']['collection'][0]['name']);
                                // _users_appName_top2.push(data['data']['collection'][1]['name']);
                                // _users_appName_top3.push(data['data']['collection'][2]['name']);
                                // $rootScope._users_app_top1 = _users_app_top1;
                                if (_.has(data['data']['collection'][0], "name") && _.has(data['data']['collection'][1], "name") && _.has(data['data']['collection'][2], "name")){
                                    _users_app_label.push(data['data']['collection'][0].link.href.split('/')[6] + "(" +
                                        "1." + data['data']['collection'][0]['name'] + "," +
                                        "2." + data['data']['collection'][1]['name'] + "," +
                                        "3." + data['data']['collection'][2]['name'] + ")"
                                    );
                                }else if (_.has(data['data']['collection'][0], "name") && _.has(data['data']['collection'][1], "name")){
                                    _users_app_label.push(data['data']['collection'][0].link.href.split('/')[6] + "(" +
                                        "1." + data['data']['collection'][0]['name'] + "," +
                                        "2." + data['data']['collection'][1]['name'] + ")"
                                    );
                                }else if (_.has(data['data']['collection'][0], "name") && _.has(data['data']['collection'][2], "name")){
                                    _users_app_label.push(data['data']['collection'][0].link.href.split('/')[6] + "(" +
                                        "1." + data['data']['collection'][0]['name'] + "," +
                                        "3." + data['data']['collection'][2]['name'] + ")"
                                    );
                                }else if (_.has(data['data']['collection'][1], "name") && _.has(data['data']['collection'][2], "name")){
                                    _users_app_label.push(data['data']['collection'][1].link.href.split('/')[6] + "(" +
                                        "2." + data['data']['collection'][1]['name'] + "," +
                                        "3." + data['data']['collection'][2]['name'] + ")"
                                    );
                                }else if (_.has(data['data']['collection'][0], "name")){
                                    _users_app_label.push(data['data']['collection'][0].link.href.split('/')[6] + "(" +
                                        "1." + data['data']['collection'][0]['name'] + ")"
                                    );
                                }else if (_.has(data['data']['collection'][1], "name")){
                                    _users_app_label.push(data['data']['collection'][1].link.href.split('/')[6] + "(" +
                                        "2." + data['data']['collection'][1]['name'] + ")"
                                    );
                                }else{
                                    _users_app_label.push(data['data']['collection'][2].link.href.split('/')[6] + "(" +
                                        "3." + data['data']['collection'][2]['name'] + ")"
                                    );
                                }
                            });
                            // console.log("status : " + cfpLoadingBar.status());
                        }
                        var _users_app_data = [
                            _users_app_top1,
                            _users_app_top2,
                            _users_app_top3
                        ];
                        var _users_app_series = ["TOP APP 1", "TOP APP 2", "TOP APP 3"];
                        var _users_app_option = {
                            scales: {
                                xAxes: [{
                                    ticks: {
                                        fontSize: 12,
                                        fontStyle: "bold"
                                    },
                                    scaleLabel: {
                                        display: true,
                                        fontSize: 14,
                                        labelString: 'APP 사용량(Mbit/s)',
                                        fontStyle: "bold"
                                    }
                                }],
                                yAxes: [{
                                    ticks: {
                                        fontSize: 12,
                                        fontStyle: "bold"
                                    },
                                    scaleLabel: {
                                        display: true,
                                        fontSize: 14,
                                        labelString: '사용자 어플리케이션(Top1,Top2,Top3)',
                                        fontStyle: "bold"
                                    }
                                }]
                            }
                        };
                        deferred.resolve({
                            user: {
                                _users_tb_data: _users_tb_data, // for table
                                _users_data: _users_data,
                                _users_flow_disc_data: _users_flow_disc_data,
                                _users_label: _users_label,
                                _users_series: _users_series,
                                _users_flow_disc_series: _users_flow_disc_series,
                                _users_option: _users_option,
                                _users_flow_disc_option: _users_flow_disc_option,
                                _users_datasetOverride: _users_datasetOverride,
                                colors: colors
                            },
                            user_app: {
                                _users_app: _users_app, // for table
                                _users_app_data: _users_app_data,
                                _users_app_label: _users_app_label,
                                _users_app_series: _users_app_series,
                                _users_app_option: _users_app_option,
                                colors: colors
                            },
                            complete_count: complete_count
                        });
                    });
                });

            }
            return deferred.promise;
        };
        this.q_userFlowData = function(hostname, from, until, duration, isset){
            var deferred = $q.defer();
            var from = from;
            var until = until;
            var duration = duration;
            if (isset) {
                ReportData.getUserActiveFlows(hostname).then(function (data) {
                    console.log(data);
                    deferred.resolve("resolve!");
                });
            }
            return deferred.promise;
        }
    };
    return UserData;
});