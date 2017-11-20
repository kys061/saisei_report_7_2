reportApp.service('ReportUserData', function($window, $q, ReportData, UserAppData) {
    var UserData = function() {
        var self = this;
        // this.q_userAppData = function(){
        //     var deferred = $q.defer();
        //
        // };
        this.q_userData = function(from, until, duration, isset) {
            var deferred = $q.defer();
            var from = from;
            var until = until;
            var duration = duration;
            if (isset) {
                ReportData.getUserData().then(function (data) {
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
                    var _users_series = ['총사용량(단위:Mbit/s)', '다운로드 사용량(단위:Mbit/s)', '업로드 사용량(단위:Mbit/s)'];
                    var _users_total = [];
                    var _users_download = [];
                    var _users_upload = [];
                    var _users_tb_data = [];
                    var _users_data = [];
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
                        _users_download.push((_users[i]['dest_smoothed_rate'] * 0.001).toFixed(3));
                        _users_upload.push((_users[i]['source_smoothed_rate'] * 0.001).toFixed(3));
                        _users_tb_data.push({
                            name: _users[i]['name'],
                            from: user_from.toLocaleString(),
                            until: user_until.toLocaleString(),
                            total: (_users[i]['total_rate'] * 0.001).toFixed(3),
                            down: (_users[i]['dest_smoothed_rate'] * 0.001).toFixed(3),
                            up: (_users[i]['source_smoothed_rate'] * 0.001).toFixed(3)
                        });
                    }
                    // var _users_data = [_users_total, _users_download, _users_upload];
                    _users_data.push(_users_total);
                    _users_data.push(_users_download);
                    _users_data.push(_users_upload);
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

                    for (var i = 0; i < _users_label.length; i++) {
                        /**********************************/
                        /* USER-APP DATA                  */
                        /**********************************/
                        UserAppData.getUserAppData(_users_label[i]).then(function (data) {
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
                            var top1_from = new Date(data['data']['collection'][0]['from']);
                            top1_from.setHours(top1_from.getHours() + 9);
                            var top1_until = new Date(data['data']['collection'][0]['until']);
                            top1_until.setHours(top1_until.getHours() + 9);
                            var top2_from = new Date(data['data']['collection'][1]['from']);
                            top2_from.setHours(top2_from.getHours() + 9);
                            var top2_until = new Date(data['data']['collection'][1]['until']);
                            top2_until.setHours(top2_until.getHours() + 9);
                            var top3_from = new Date(data['data']['collection'][2]['from']);
                            top3_from.setHours(top3_from.getHours() + 9);
                            var top3_until = new Date(data['data']['collection'][2]['until']);
                            top3_until.setHours(top3_until.getHours() + 9);
                            // console.log(data['data']['collection'][0].link.href.split('/')[6]);
                            _users_app.push({
                                "user_name": data['data']['collection'][0].link.href.split('/')[6],
                                "top1_app_name": data['data']['collection'][0]['name'],
                                "top1_app_total": (data['data']['collection'][0]['total_rate'] * 0.001).toFixed(3),
                                "top1_app_from": top1_from.toLocaleString(),
                                "top1_app_until": top1_until.toLocaleString(),
                                "top2_app_name": data['data']['collection'][1]['name'],
                                "top2_app_total": (data['data']['collection'][1]['total_rate'] * 0.001).toFixed(3),
                                "top2_app_from": top2_from.toLocaleString(),
                                "top2_app_until": top2_until.toLocaleString(),
                                "top3_app_name": data['data']['collection'][2]['name'],
                                "top3_app_total": (data['data']['collection'][2]['total_rate'] * 0.001).toFixed(3),
                                "top3_app_from": top3_from.toLocaleString(),
                                "top3_app_until": top3_until.toLocaleString()
                            });
                            _users_app.sort(function (a, b) { // DESC
                                return b['top1_app_total'] - a['top1_app_total'];
                            });
                            _users_app_top1.push((data['data']['collection'][0]['total_rate'] * 0.001).toFixed(3));
                            _users_app_top2.push((data['data']['collection'][1]['total_rate'] * 0.001).toFixed(3));
                            _users_app_top3.push((data['data']['collection'][2]['total_rate'] * 0.001).toFixed(3));
                            _users_appName_top1.push(data['data']['collection'][0]['name']);
                            _users_appName_top2.push(data['data']['collection'][1]['name']);
                            _users_appName_top3.push(data['data']['collection'][2]['name']);
                            // $rootScope._users_app_top1 = _users_app_top1;
                            _users_app_label.push(data['data']['collection'][0].link.href.split('/')[6] + "(" +
                                "1." + data['data']['collection'][0]['name'] + "," +
                                "2." + data['data']['collection'][1]['name'] + "," +
                                "3." + data['data']['collection'][2]['name'] + ")"
                            );
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
                            _users_label: _users_label,
                            _users_series: _users_series,
                            _users_option: _users_option,
                            colors: colors
                        },
                        user_app: {
                            _users_app: _users_app, // for table
                            _users_app_data: _users_app_data,
                            _users_app_label: _users_app_label,
                            _users_app_series: _users_app_series,
                            _users_app_option: _users_app_option,
                            colors: colors
                        }
                    });
                });
            }
            return deferred.promise;
        }
    };
    return UserData;
});