reportApp.controller('ReportCtrl', function ReportCtrl(
    $rootScope, $scope, $log, _, ReportData, SharedData, UserAppData, $location, $route, $window, cfpLoadingBar,
    $q, $timeout, ReportInterfaceData, ReportUserData, ReportMetaData, ReportIntName, ReportUserGroupData,
    Notification) {

    $scope.$on('$routeChangeStart', function(scope, next, current) {
        SharedData.setCurrentState(true);
        console.log("change back");
        $location.path('/');
        $window.location.href = '/report/';
    });

    // 메타 데이터 요청(1) + 인터페이스 정보 요청(1) + 인터페이스 데이터 요청(수신, 송신)(세그먼트*2) + 유저 데이터 요청 + ?(3) + 10명의 유저에 대한 각 앱 사용량 요청
    var req_count = 2+4+12+3+22;
    $scope.complete_check_count = req_count; // 나중에 계산 수식 필요~!!
    $scope.loaded_count = 0;
    $scope.started_count = 0;

    // report create time
    $scope.created_time = (new Date()).toLocaleString('ko-KR',{hour12: false}).replace('시 ', ':').replace('분 ', ':').replace('초','');
    // cfpLoadingBar:started
    $rootScope.$on('cfpLoadingBar:loading', function() {
        $scope.started_count += 1;
        // console.log("started_count : " + $scope.started_count);
    });

    $rootScope.$on('cfpLoadingBar:loaded', function() {
        $scope.loaded_count += 1;
        console.log("loaded_count : " + $scope.loaded_count);
    });

    $rootScope.$on('cfpLoadingBar:completed', function() {
        console.log('cfpLoadingBar:completed!!!!!!!!!!!!!!!!!!!');
        // if ($scope.complete_check_count === $scope.loaded_count) {
        // console.log('user_count', $scope.complete_user_count+$scope.complete_first_seg_count+$scope.complete_second_seg_count+$scope.complete_usergroup_count);
        // if (2+$scope.complete_user_count+$scope.complete_first_seg_count+$scope.complete_second_seg_count+$scope.complete_usergroup_count === $scope.loaded_count) {
        //     notie.alert({
        //         type: 'info',
        //         stay: 'true',
        //         time: 30,
        //         text: 'SAISEI 트래픽 보고서가 완성 되었습니다!!!'
        //     });
        // }
    });

    var is_worktime = SharedData.getIsWorktime();
    var period_type = SharedData.getPeriodType();
    var from = SharedData.getFrom();
    var until = SharedData.getUntil();
    var work_from = SharedData.getWorkFrom();
    var work_until = SharedData.getWorkUntil();
    var select2model = SharedData.getSelect2model();
    var report_type = SharedData.getReportType();

    $scope.report_type;
    console.log('is_worktime: ' + is_worktime);
    console.log('from: ' + from);
    console.log('work_from: ' + work_from);
    console.log('work_until: ' + work_until);
    console.log("from : until -> " + from + ':' + until);
    /*
     *  그래프 상태 체크
     *  [0] : 인터페이스 그래프
     *  [1] : 유저 리포트 및 유저-앱 연관 그래프
     *  [2] : 유저 그룹 그래프
     *  --- 계속 추가될 예정
     */
    $scope.grpState = [
        {
            "name": "int_report",
            "state": false
        },
        {
            "name": "user_report",
            "state": false
        },
        {
            "name": "user_group_report",
            "state": false
        }
    ];

    $scope.segState =[
        {
            name: "seg1",
            state: false
        },
        {
            name: "seg2",
            state: false
        }
    ];

    for (var k = 0; k < report_type.length; k++) {
        if (report_type[k].status) {
            for (var j = 0; j < $scope.grpState.length; j++) {
                if ($scope.grpState[j].name === report_type[k].name) {
                    // console.log(report_type[k]);
                    // console.log($scope.state[j]);
                    $scope.grpState[j].state = true;
                }
            }
        }
    }
    // 그래프 사용여부 체크
    $scope.getGraphState = function(arr, name) {
        // arr.push({cmpname: name});
        for (var i = 0; i < arr.length; i++) {
            if (arr[i].name === name) {
                return arr[i].state === true;
            }
        }
        // arr.some(function (obj) {
        //     for(var j = 0; j < arr.length; j++) {
        //         // console.log(name);
        //         // console.log($scope.grpState[j].name+"==="+report_type[k].name);
        //         if (obj.name===name){
        //             // console.log(obj.state);
        //             return obj.state === true;
        //         }
        //     }
        // });
    };
    console.log(from + " - " + until);
    // 세그먼트 사용여부 체크
    $scope.getSegState = function(arr, name) {
        for (var i = 0; i < arr.length; i++) {
            if (arr[i].name === name) {
                return arr[i].state === true;
            }
        }
    };
    // 업무시간 항목 사용 여부 체크
    $scope.getWorktimeState = function() {
        return is_worktime;
    };


    // 메타데이터 가져오기 정의
    var getMetaData = function() {
        return $q(function(resolve, reject){
            // 메타데이터
            var metaLink = new ReportMetaData();
            metaLink.q_metaLinkData().then(
                function(val) {
                    // $scope.metadata = val.metadata;
                    // $scope.intLink = $scope.metadata.data.collection[0]['interfaces'].link.href;
                    // $scope.hostname = $scope.metadata.data.collection[0]['system_name'];
                    // console.log($scope.metadata);
                    // console.log($scope.intLink); // /rest/stm/configurations/running/interfaces/
                    // console.log($scope.hostname); // stm
                    console.log(val);
                    $scope.intLink = val.int_link;
                    $scope.hostname = val.hostname;
                    var IntName = new ReportIntName();
                    IntName.q_intName($scope.hostname).then(
                        // success
                        function (val) {
                            console.log(val);
                            // var collection = val.int_data.data.collection;
                            // $scope.int_ext_name = [];
                            // for (var i = 0; i < collection.length; i++){
                            //     $scope.int_ext_name.push(collection[i].name);
                            // }
                            resolve({
                                hostname: $scope.hostname,
                                int_ext_name: val.int_ext_name,
                                int_int_name: val.int_int_name,
                                use_span: false
                            });
                        },
                        // failure
                        function (val) {
                            console.log(val);
                            reject(Error("failure!!"));
                        }
                    );

                        },
                        function(val){
                            console.log(val);
                            reject( Error("failure!!") );
                        }
                    );

        });
    };

    /*
        1. 메타데이터를 먼저 가져온다.
        2. 메타 데이터를 가져오는 것에 성공하면, 각각 세부 그래프를 위한 데이터 처리를 한다.
     */
    getMetaData().then(
        // get metadata success
        function(val){
            var hostname = val.hostname;
            // 스팬포트를 사용하지 않는 경우
            // if(!val.use_span){
                // 세그먼트가 2개인 경우
            if (val.int_ext_name.length > 1){
                var first_seg_int_ext_name = val.int_ext_name[0];
                var second_seg_int_ext_name = val.int_ext_name[1];
                var first_seg_int_int_name = val.int_int_name[0];
                var second_seg_int_int_name = val.int_int_name[1];
                console.log('인터페이스 이름: ', val.int_ext_name, val.int_int_name);
                _.each($scope.segState, function(state){
                    state.state = true
                });
                // 그래프
                // 1. 인터페이스
                var firstSegIntGrpDataset = new ReportInterfaceData();
                // 1번 세그먼트 ext데이터 추출
                firstSegIntGrpDataset.q_intData(hostname, first_seg_int_ext_name, first_seg_int_int_name, from, until, duration, $scope.grpState[0].state).then(
                    function(val){
                        $scope.data = val.data;
                        $scope.labels = val.labels;
                        $scope.series = val.series;
                        $scope.colors = val.colors;
                        $scope.options = val.options;
                        $scope.datasetOverride = val.datasetOverride;
                        $scope.int_data = val.int_data;
                        $scope.int_name = val.int_name;
                        $scope.complete_first_seg_count = val.complete_count;
                    },
                    function(val){
                        console.log(val);
                    }
                );
                var secondSegIntGrpDataset = new ReportInterfaceData();
                // 2번 세그먼트 ext 데이터 추출
                secondSegIntGrpDataset.q_intData(hostname, second_seg_int_ext_name, second_seg_int_int_name, from, until, duration, $scope.grpState[0].state).then(
                    function(val){
                        $scope.second_seg_data = val.data;
                        $scope.second_seg_labels = val.labels;
                        $scope.second_seg_series = val.series;
                        $scope.second_seg_colors = val.colors;
                        $scope.second_seg_options = val.options;
                        $scope.second_seg_datasetOverride = val.datasetOverride;
                        $scope.second_seg_int_data = val.int_data;
                        $scope.second_seg_int_name = val.int_name;
                        $scope.complete_second_seg_count = val.complete_count;
                    },
                    function(val){
                        console.log(val);
                    }
                );
             // 세그먼트가 1개인 경우
            }else{
                _.each($scope.segState, function(state, state_index){
                    if(state_index === 0) state.state = true;
                });
                var first_seg_int_ext_name = val.int_ext_name[0];
                var first_seg_int_int_name = val.int_int_name[0];
                var firstSegIntGrpDataset = new ReportInterfaceData();

                firstSegIntGrpDataset.q_intData(hostname, first_seg_int_ext_name, first_seg_int_int_name, from, until, duration, $scope.grpState[0].state).then(
                    function(val){
                        $scope.data = val.data;
                        $scope.labels = val.labels;
                        $scope.series = val.series;
                        $scope.colors = val.colors;
                        $scope.options = val.options;
                        $scope.datasetOverride = val.datasetOverride;
                        $scope.int_data = val.int_data;
                        $scope.int_name = val.int_name;
                        $scope.complete_first_seg_count = val.complete_count;
                    },
                    function(val){
                        console.log(val);
                    }
                );
            }
            // 스팬포트를 사용하는 경우
            // } else {
            //     notie.alert({
            //         type: 'error',
            //         text: '인터페이스에 스팬 포트 사용 시 리포트 생성기능 필요!!!'
            //     })
            // }

            // 2. 유저 트래픽 그래프
            // 2.1. 전체시간
            var getUserTotalTimeData = function () {
                var userGrpDataset = new ReportUserData();
                userGrpDataset.q_userData(hostname, from, until, work_from, work_until, duration, $scope.grpState[1].state).then(
                    function(val){
                        console.log(val.user._users_data);
                        $scope._users_tb_data = val.user._users_tb_data;
                        $scope._users_data = val.user._users_data;
                        $scope._users_flow_disc_data = val.user._users_flow_disc_data;
                        $scope._users_label = val.user._users_label;
                        $scope._users_series = val.user._users_series;
                        $scope._users_flow_disc_series = val.user._users_flow_disc_series;
                        $scope._users_option = val.user._users_option;
                        $scope._users_flow_disc_option = val.user._users_flow_disc_option;
                        $scope._users_datasetOverride = val.user._users_datasetOverride;
                        $scope.colors = val.user.colors;
                        //
                        $scope._users_app = val.user_app._users_app; // for table
                        $scope._users_app_data = val.user_app._users_app_data;
                        $scope._users_app_label = val.user_app._users_app_label;
                        $scope._users_app_series = val.user_app._users_app_series;
                        $scope._users_app_option = val.user_app._users_app_option;
                        //
                        console.log('user_count: ', val.complete_count);
                        $scope.complete_user_count = val.complete_count;
                    },
                    function(val){
                        console.log(val);
                    }
                );
            };
            // 2.2. 업무시간

            if (period_type === 'day') {
                $scope.report_type = "일간 리포트";
                console.log(period_type);
            } else if (period_type === 'week') {
                $scope.report_type = "주간 리포트";
                console.log(period_type);
                getUserTotalTimeData();
                // if (is_worktime) {
                //     console.log(period_type);
                //     // getUserWorkTimeData()
                // } else {
                //     console.log(period_type);
                //     // getUserTotalTimeData()
                // }
            } else if (period_type === 'month') {
                $scope.report_type = "월간 리포트";
                console.log(period_type);
            } else {
                $scope.report_type = "커스텀 리포트";
                console.log(period_type);
                getUserTotalTimeData();
            }

            // 3. 유저 그룹 트래픽 그래프
            $scope._user_group_size = 0;

            var userGroupGrpData = new ReportUserGroupData();
            userGroupGrpData.q_userGroupData(hostname, from, until, work_from, work_until, duration, $scope.grpState[2].state).then(
                function(val) {
                    console.log(' 3. 유저 그룹 트래픽 그래프');
                    console.log(val);
                    $scope._user_group_label = val.user_group._user_group_label;
                    $scope._user_group_data = val.user_group._user_group_data;
                    $scope._user_group_series = val.user_group._user_group_series;
                    $scope._user_group_option = val.user_group._user_group_option;
                    $scope._user_group_colors = val.user_group._user_group_colors;
                    $scope._user_group_size = val.user_group._user_group_size;
                    $scope._user_group_tb_data = val.user_group._user_group_tb_data;
                    $scope._user_group_size = val.user_group._user_group_size;

                    // 그룹내 유저 데이터
                    // var sort_cnt = 0;
                    // if (val.user_in_group._user_in_group_tb.length !== 0)
                    //     val.user_in_group._user_in_group_tb.top_user_data.sort(function (a, b) { return b['top_user_total'] - a['top_user_total']; });
                    //     sort_cnt += 1;
                    // $scope._user_in_group_tb = val.user_in_group._user_in_group_tb; // for table
                    $scope._user_in_group_tb = val.user_in_group._user_in_group_tb; // for table
                    $scope._user_in_group_tr_data = val.user_in_group._user_in_group_tr_data;
                    $scope._user_in_group_label = val.user_in_group._user_in_group_label;
                    $scope._user_in_group_series = val.user_in_group._user_in_group_series;
                    $scope._user_in_group_option = val.user_in_group._user_in_group_option;

                    // $scope._user_group_flow_disc_data = val.user_group._user_group_flow_disc_data;
                    // $scope._user_group_flow_disc_series = val.user_group._user_group_flow_disc_series;
                    // $scope._user_group_flow_disc_option = val.user._users_flow_disc_option;
                    // $scope._user_group_datasetOverride = val.user._users_datasetOverride;

                    //
                    $scope.complete_usergroup_count = val.complete_count;
                },
                function(val) {
                    console.log(val);
                })
        },
        // get metadata fail
        function(val){
            console.log(val);
        }
    );
    // 프린트
    $scope.export_print =  function(){
        $window.print();
    };

    // var _dataset = [];
    // var _data = [];
    // _.each($scope._user_in_group_label, function(_label, _index){
    //     _.each($scope._user_in_group_tr_data, function(_top_data){
    //         _data.push(_top_data[_index])
    //     });
    //     _dataset.push({
    //         label: _label,
    //         data: _data
    //     });
    //     console.log("_dataset");
    //     console.log(_dataset);
    // });

    //get div size init
    var size = {};
    size.header_page = {};
    size.first_page = {};
    size.second_page = {};
    size.third_page = {};
    size.fourth_page = {};
    size.fifth_page = {};
    size.fifth_page_grp = {};
    size.fifth_page_tb = {};
    size.fifth_page_tb_group={};
    size.fifth_page_tb_set={};
    size.last_page = {};
    var ratio = 2.2, second_ratio = 3, fourth_ratio = 3, fifth_ratio = 3
    // set date
    var _from = new Date(from);
    var _until = new Date(until);
    // set locale date(kr)
    $scope.from = _from.toLocaleString();
    $scope.until = _until.toLocaleString();

    var duration = $window.Sugar.Date.range(from, until).every('days').length;
    $scope.back = function() {
        $window.location.reload();
    };
    $scope.export_xls = function() {
        if($scope.grpState[0].state && $scope.grpState[1].state) {
            var data1 = alasql('SELECT * FROM HTML("#table1",{headers:true})');
            var data2 = alasql('SELECT * FROM HTML("#table2",{headers:true})');
            var data3 = alasql('SELECT * FROM HTML("#table3",{headers:true})');
            var int_file = 'SELECT * INTO CSV("interface-'+ $scope.from+"~"+$scope.until + '.csv",{headers:true, separator:","}) FROM ?';
            // var int_file = "interface.csv";
            // alasql('SELECT * INTO CSV("interface.csv",{headers:true, separator:","}) FROM ?', [data1]);
            alasql(int_file, [data1]);
            alasql('SELECT * INTO CSV("user_traffic.csv",{headers:true, separator:","}) FROM ?', [data2]);
            alasql('SELECT * INTO CSV("user_app_traffic.csv",{headers:true, separator:","}) FROM ?', [data3]);
            notie.alert({
                type: 'error',
                text: 'csv파일이 생성되었습니다!'
            });
        } else {
            if($scope.grpState[0].state){
                var data1 = alasql('SELECT * FROM HTML("#table1",{headers:true})');
                alasql('SELECT * INTO CSV("interface.csv",{headers:true, separator:","}) FROM ?', [data1]);
                notie.alert({
                    type: 'error',
                    text: 'csv파일이 생성되었습니다!'
                });
            } else if($scope.grpState[1].state){
                var data2 = alasql('SELECT * FROM HTML("#table2",{headers:true})');
                var data3 = alasql('SELECT * FROM HTML("#table3",{headers:true})');
                alasql('SELECT * INTO CSV("user_traffic.csv",{headers:true, separator:","}) FROM ?', [data2]);
                alasql('SELECT * INTO CSV("user_app_traffic.csv",{headers:true, separator:","}) FROM ?', [data3]);
                notie.alert({
                    type: 'error',
                    text: 'csv파일이 생성되었습니다!'
                });
            } else {
                notie.alert({
                    type: 'error',
                    text: '출력할 데이터가 존재하지 않습니다.'
                });
            }
        }
    };

    // $scope.promise_pdf = [];
    // var _promise_canvas_header = function() {
    //     return $q(function(resolve, reject) {
    //         html2canvas($('#header_page').delay(1000)).then(function(canvas) {
    //             $scope.header_page = canvas.toDataURL();
    //             resolve('success!!');
    //         });
    //     });
    // };
    // var _promise_canvas_int = function() {
    //     return $q(function(resolve, reject) {
    //         html2canvas($('#header_page').delay(1000)).then(function(canvas) {
    //             $scope.header_page = canvas.toDataURL();
    //             html2canvas($('#first_page').delay(1000)).then(function(canvas) {
    //                 // document.body.appendChild(canvas);
    //                 $scope.first_page = canvas.toDataURL();
    //                 resolve('success!!');
    //
    //             });
    //         });
    //     });
    // };
    // var _promise_canvas_user = function() {
    //     return $q(function(resolve, reject) {
    //         html2canvas($('#header_page').delay(1000)).then(function(canvas) {
    //             $scope.header_page = canvas.toDataURL();
    //             html2canvas($('#second_page').delay(1000)).then(function(canvas) {
    //                     // document.body.appendChild(canvas);
    //                     $scope.second_page = canvas.toDataURL();
    //                     html2canvas($('#third_page').delay(1000)).then(function(canvas) {
    //                         // document.body.appendChild(canvas);
    //                         $scope.third_page = canvas.toDataURL();
    //                         resolve('success!!');
    //                     });
    //                 });
    //         });
    //     });
    // };
    // var _promise_canvas_user_group = function() {
    //     return $q(function(resolve, reject) {
    //         html2canvas($('#header_page').delay(1000)).then(function(canvas) {
    //             $scope.header_page = canvas.toDataURL();
    //             html2canvas($('#fourth_page').delay(1000)).then(function (canvas) {
    //                             // document.body.appendChild(canvas);
    //                             $scope.fourth_page = canvas.toDataURL();
    //
    //                             html2canvas($('#fifth_page_grp')
    //                                 .append($('#table5_1')[0].outerHTML)
    //                                 .append($('#table5_2')[0].outerHTML)
    //                                 .append($('#table5_3')[0].outerHTML)
    //                             ).then(function (canvas) {
    //                                 document.body.appendChild(canvas);
    //                                 $scope.fifth_page_grp = canvas.toDataURL();
    //                                 $('#table5_1').add('#table5_2').add('#table5_3').delay(1000).remove();
    //
    //                                 $scope.fifth_page_table = [];
    //
    //                                 function makeCanvasForTable(i) {
    //                                     console.log("i : ", i);
    //                                     var _id = i + 1;
    //
    //                                     console.log("id : ", _id);
    //                                     // 5개 선택
    //                                     if (i < $scope._user_group_size && i < $scope._user_group_size - 5) {
    //                                         i += 5;
    //                                         html2canvas($('#table5_' + _id)
    //                                             .append('<div class="col-lg-12 col-sm-12" style="margin-bottom: 18px; padding=16.5px;"></div>')
    //                                             .append($('#table5_' + (_id + 1))[0].innerHTML)
    //                                             .append('<div class="col-lg-12 col-sm-12" style="margin-bottom: 18px; padding=16.5px;"></div>')
    //                                             .append($('#table5_' + (_id + 2))[0].innerHTML)
    //                                             .append('<div class="col-lg-12 col-sm-12" style="margin-bottom: 18px; padding=16.5px;"></div>')
    //                                             .append($('#table5_' + (_id + 3))[0].innerHTML)
    //                                             .append('<div class="col-lg-12 col-sm-12" style="margin-bottom: 18px; padding=16.5px;"></div>')
    //                                             .append($('#table5_' + (_id + 4))[0].innerHTML)
    //                                         ).then(function (canvas) {
    //                                             document.body.appendChild(canvas);
    //                                             $scope.fifth_page_table.push(canvas.toDataURL());
    //                                             $('#table5_' + (_id + 1)).add('#table5_' + (_id + 2)).add('#table5_' + (_id + 3)).add('#table5_' + (_id + 4)).delay(1000).remove();
    //                                             makeCanvasForTable(i);
    //
    //                                         });
    //                                     }
    //                                     else if (i < $scope._user_group_size && i === $scope._user_group_size - 4) {
    //                                         html2canvas($('#table5_' + _id)
    //                                                 .append('<div class="col-lg-12 col-sm-12" style="margin-bottom: 18px; padding=16.5px;"></div>')
    //                                                 .append($('#table5_' + (_id + 1))[0].innerHTML)
    //                                                 .append('<div class="col-lg-12 col-sm-12" style="margin-bottom: 18px; padding=16.5px;"></div>')
    //                                                 .append($('#table5_' + (_id + 2))[0].innerHTML)
    //                                                 .append('<div class="col-lg-12 col-sm-12" style="margin-bottom: 18px; padding=16.5px;"></div>')
    //                                                 .append($('#table5_' + (_id + 3))[0].innerHTML)
    //                                             // .append('<div class="col-lg-12 col-sm-12" style="margin-bottom: 18px; padding=16.5px;"></div>')
    //                                             // .append($('#table5_'+(_id+3))[0].innerHTML)
    //                                         ).then(function (canvas) {
    //                                             document.body.appendChild(canvas);
    //                                             $scope.fifth_page_table.push(canvas.toDataURL());
    //                                             $('#table5_' + (_id + 1)).add('#table5_' + (_id + 2)).add('#table5_' + (_id + 3)).delay(1000).remove();
    //                                             resolve($scope.fifth_page_table);
    //                                         });
    //                                     } else if (i < $scope._user_group_size && i === $scope._user_group_size - 3) {
    //                                         html2canvas($('#table5_' + _id)
    //                                                 .append('<div class="col-lg-12 col-sm-12" style="margin-bottom: 18px; padding=16.5px;"></div>')
    //                                                 .append($('#table5_' + (_id + 1))[0].innerHTML)
    //                                                 .append('<div class="col-lg-12 col-sm-12" style="margin-bottom: 18px; padding=16.5px;"></div>')
    //                                                 .append($('#table5_' + (_id + 2))[0].innerHTML)
    //                                             // .append('<div class="col-lg-12 col-sm-12" style="margin-bottom: 18px; padding=16.5px;"></div>')
    //                                             // .append($('#table5_'+(_id+3))[0].innerHTML)
    //                                             // .append('<div class="col-lg-12 col-sm-12" style="margin-bottom: 18px; padding=16.5px;"></div>')
    //                                             // .append($('#table5_'+(_id+3))[0].innerHTML)
    //                                         ).then(function (canvas) {
    //                                             document.body.appendChild(canvas);
    //                                             $scope.fifth_page_table.push(canvas.toDataURL());
    //                                             $('#table5_' + (_id + 1)).add('#table5_' + (_id + 2)).delay(1000).remove();
    //                                             resolve($scope.fifth_page_table);
    //                                         });
    //                                     } else if (i < $scope._user_group_size && i === $scope._user_group_size - 2) {
    //                                         html2canvas($('#table5_' + _id)
    //                                                 .append('<div class="col-lg-12 col-sm-12" style="margin-bottom: 18px; padding=16.5px;"></div>')
    //                                                 .append($('#table5_' + (_id + 1))[0].innerHTML)
    //                                             // .append('<div class="col-lg-12 col-sm-12" style="margin-bottom: 18px; padding=16.5px;"></div>')
    //                                             // .append($('#table5_'+(_id+2))[0].innerHTML)
    //                                             // .append('<div class="col-lg-12 col-sm-12" style="margin-bottom: 18px; padding=16.5px;"></div>')
    //                                             // .append($('#table5_'+(_id+3))[0].innerHTML)
    //                                             // .append('<div class="col-lg-12 col-sm-12" style="margin-bottom: 18px; padding=16.5px;"></div>')
    //                                             // .append($('#table5_'+(_id+3))[0].innerHTML)
    //                                         ).then(function (canvas) {
    //                                             document.body.appendChild(canvas);
    //                                             $scope.fifth_page_table.push(canvas.toDataURL());
    //                                             $('#table5_' + (_id + 1)).delay(1000).remove();
    //                                             resolve($scope.fifth_page_table);
    //                                         });
    //                                     } else {
    //                                         html2canvas($('#table5_' + _id)).then(function (canvas) {
    //                                             document.body.appendChild(canvas);
    //                                             $scope.fifth_page_table.push(canvas.toDataURL());
    //                                             // $('#table5_5').add('#table5_6').add('#table5_7').add('#table5_8').delay(1000).remove();
    //                                             resolve($scope.fifth_page_table);
    //                                         });
    //                                     }
    //                                 }
    //
    //                                 // call recursively
    //                                 makeCanvasForTable(3);
    //                             });
    //                         });
    //         });
    //     });
    // };
    // var _promise_canvas_int_user = function() {
    //     return $q(function(resolve, reject) {
    //         html2canvas($('#header_page').delay(1000)).then(function(canvas) {
    //             $scope.header_page = canvas.toDataURL();
    //             html2canvas($('#first_page').delay(1000)).then(function(canvas) {
    //                 // document.body.appendChild(canvas);
    //                 $scope.first_page = canvas.toDataURL();
    //                 html2canvas($('#second_page').delay(1000)).then(function(canvas) {
    //                     // document.body.appendChild(canvas);
    //                     $scope.second_page = canvas.toDataURL();
    //                     html2canvas($('#third_page').delay(1000)).then(function(canvas) {
    //                         // document.body.appendChild(canvas);
    //                         $scope.third_page = canvas.toDataURL();
    //                         resolve('success!!');
    //                     });
    //                 });
    //             });
    //         });
    //     });
    // };
    // var _promise_canvas_int_user_group = function() {
    //     return $q(function(resolve, reject) {
    //         html2canvas($('#header_page').delay(1000)).then(function(canvas) {
    //             $scope.header_page = canvas.toDataURL();
    //             html2canvas($('#first_page').delay(1000)).then(function(canvas) {
    //                 // document.body.appendChild(canvas);
    //                 $scope.first_page = canvas.toDataURL();
    //                 html2canvas($('#fourth_page').delay(1000)).then(function (canvas) {
    //                     // document.body.appendChild(canvas);
    //                     $scope.fourth_page = canvas.toDataURL();
    //
    //                     html2canvas($('#fifth_page_grp')
    //                         .append($('#table5_1')[0].outerHTML)
    //                         .append($('#table5_2')[0].outerHTML)
    //                         .append($('#table5_3')[0].outerHTML)
    //                     ).then(function (canvas) {
    //                         document.body.appendChild(canvas);
    //                         $scope.fifth_page_grp = canvas.toDataURL();
    //                         $('#table5_1').add('#table5_2').add('#table5_3').delay(1000).remove();
    //
    //                         $scope.fifth_page_table = [];
    //
    //                         function makeCanvasForTable(i) {
    //                             console.log("i : ", i);
    //                             var _id = i + 1;
    //
    //                             console.log("id : ", _id);
    //                             // 5개 선택
    //                             if (i < $scope._user_group_size && i < $scope._user_group_size - 5) {
    //                                 i += 5;
    //                                 html2canvas($('#table5_' + _id)
    //                                     .append('<div class="col-lg-12 col-sm-12" style="margin-bottom: 18px; padding=16.5px;"></div>')
    //                                     .append($('#table5_' + (_id + 1))[0].innerHTML)
    //                                     .append('<div class="col-lg-12 col-sm-12" style="margin-bottom: 18px; padding=16.5px;"></div>')
    //                                     .append($('#table5_' + (_id + 2))[0].innerHTML)
    //                                     .append('<div class="col-lg-12 col-sm-12" style="margin-bottom: 18px; padding=16.5px;"></div>')
    //                                     .append($('#table5_' + (_id + 3))[0].innerHTML)
    //                                     .append('<div class="col-lg-12 col-sm-12" style="margin-bottom: 18px; padding=16.5px;"></div>')
    //                                     .append($('#table5_' + (_id + 4))[0].innerHTML)
    //                                 ).then(function (canvas) {
    //                                     document.body.appendChild(canvas);
    //                                     $scope.fifth_page_table.push(canvas.toDataURL());
    //                                     $('#table5_' + (_id + 1)).add('#table5_' + (_id + 2)).add('#table5_' + (_id + 3)).add('#table5_' + (_id + 4)).delay(1000).remove();
    //                                     makeCanvasForTable(i);
    //
    //                                 });
    //                             }
    //                             else if (i < $scope._user_group_size && i === $scope._user_group_size - 4) {
    //                                 html2canvas($('#table5_' + _id)
    //                                         .append('<div class="col-lg-12 col-sm-12" style="margin-bottom: 18px; padding=16.5px;"></div>')
    //                                         .append($('#table5_' + (_id + 1))[0].innerHTML)
    //                                         .append('<div class="col-lg-12 col-sm-12" style="margin-bottom: 18px; padding=16.5px;"></div>')
    //                                         .append($('#table5_' + (_id + 2))[0].innerHTML)
    //                                         .append('<div class="col-lg-12 col-sm-12" style="margin-bottom: 18px; padding=16.5px;"></div>')
    //                                         .append($('#table5_' + (_id + 3))[0].innerHTML)
    //                                     // .append('<div class="col-lg-12 col-sm-12" style="margin-bottom: 18px; padding=16.5px;"></div>')
    //                                     // .append($('#table5_'+(_id+3))[0].innerHTML)
    //                                 ).then(function (canvas) {
    //                                     document.body.appendChild(canvas);
    //                                     $scope.fifth_page_table.push(canvas.toDataURL());
    //                                     $('#table5_' + (_id + 1)).add('#table5_' + (_id + 2)).add('#table5_' + (_id + 3)).delay(1000).remove();
    //                                     resolve($scope.fifth_page_table);
    //                                 });
    //                             } else if (i < $scope._user_group_size && i === $scope._user_group_size - 3) {
    //                                 html2canvas($('#table5_' + _id)
    //                                         .append('<div class="col-lg-12 col-sm-12" style="margin-bottom: 18px; padding=16.5px;"></div>')
    //                                         .append($('#table5_' + (_id + 1))[0].innerHTML)
    //                                         .append('<div class="col-lg-12 col-sm-12" style="margin-bottom: 18px; padding=16.5px;"></div>')
    //                                         .append($('#table5_' + (_id + 2))[0].innerHTML)
    //                                     // .append('<div class="col-lg-12 col-sm-12" style="margin-bottom: 18px; padding=16.5px;"></div>')
    //                                     // .append($('#table5_'+(_id+3))[0].innerHTML)
    //                                     // .append('<div class="col-lg-12 col-sm-12" style="margin-bottom: 18px; padding=16.5px;"></div>')
    //                                     // .append($('#table5_'+(_id+3))[0].innerHTML)
    //                                 ).then(function (canvas) {
    //                                     document.body.appendChild(canvas);
    //                                     $scope.fifth_page_table.push(canvas.toDataURL());
    //                                     $('#table5_' + (_id + 1)).add('#table5_' + (_id + 2)).delay(1000).remove();
    //                                     resolve($scope.fifth_page_table);
    //                                 });
    //                             } else if (i < $scope._user_group_size && i === $scope._user_group_size - 2) {
    //                                 html2canvas($('#table5_' + _id)
    //                                         .append('<div class="col-lg-12 col-sm-12" style="margin-bottom: 18px; padding=16.5px;"></div>')
    //                                         .append($('#table5_' + (_id + 1))[0].innerHTML)
    //                                     // .append('<div class="col-lg-12 col-sm-12" style="margin-bottom: 18px; padding=16.5px;"></div>')
    //                                     // .append($('#table5_'+(_id+2))[0].innerHTML)
    //                                     // .append('<div class="col-lg-12 col-sm-12" style="margin-bottom: 18px; padding=16.5px;"></div>')
    //                                     // .append($('#table5_'+(_id+3))[0].innerHTML)
    //                                     // .append('<div class="col-lg-12 col-sm-12" style="margin-bottom: 18px; padding=16.5px;"></div>')
    //                                     // .append($('#table5_'+(_id+3))[0].innerHTML)
    //                                 ).then(function (canvas) {
    //                                     document.body.appendChild(canvas);
    //                                     $scope.fifth_page_table.push(canvas.toDataURL());
    //                                     $('#table5_' + (_id + 1)).delay(1000).remove();
    //                                     resolve($scope.fifth_page_table);
    //                                 });
    //                             } else {
    //                                 html2canvas($('#table5_' + _id)).then(function (canvas) {
    //                                     document.body.appendChild(canvas);
    //                                     $scope.fifth_page_table.push(canvas.toDataURL());
    //                                     // $('#table5_5').add('#table5_6').add('#table5_7').add('#table5_8').delay(1000).remove();
    //                                     resolve($scope.fifth_page_table);
    //                                 });
    //                             }
    //                         }
    //                         // call recursively
    //                         makeCanvasForTable(3);
    //                     });
    //                 });
    //             });
    //         });
    //     });
    // };
    // var _promise_canvas_user_user_group = function() {
    //     return $q(function(resolve, reject) {
    //         html2canvas($('#header_page').delay(1000)).then(function(canvas) {
    //             $scope.header_page = canvas.toDataURL();
    //             html2canvas($('#second_page').delay(1000)).then(function(canvas) {
    //                 // document.body.appendChild(canvas);
    //                 $scope.second_page = canvas.toDataURL();
    //                 html2canvas($('#third_page').delay(1000)).then(function(canvas) {
    //                     // document.body.appendChild(canvas);
    //                     $scope.third_page = canvas.toDataURL();
    //                     html2canvas($('#fourth_page').delay(1000)).then(function (canvas) {
    //                         // document.body.appendChild(canvas);
    //                         $scope.fourth_page = canvas.toDataURL();
    //
    //                         html2canvas($('#fifth_page_grp')
    //                             .append($('#table5_1')[0].outerHTML)
    //                             .append($('#table5_2')[0].outerHTML)
    //                             .append($('#table5_3')[0].outerHTML)
    //                         ).then(function (canvas) {
    //                             document.body.appendChild(canvas);
    //                             $scope.fifth_page_grp = canvas.toDataURL();
    //                             $('#table5_1').add('#table5_2').add('#table5_3').delay(1000).remove();
    //
    //                             $scope.fifth_page_table = [];
    //
    //                             function makeCanvasForTable(i) {
    //                                 console.log("i : ", i);
    //                                 var _id = i + 1;
    //
    //                                 console.log("id : ", _id);
    //                                 // 5개 선택
    //                                 if (i < $scope._user_group_size && i < $scope._user_group_size - 5) {
    //                                     i += 5;
    //                                     html2canvas($('#table5_' + _id)
    //                                         .append('<div class="col-lg-12 col-sm-12" style="margin-bottom: 18px; padding=16.5px;"></div>')
    //                                         .append($('#table5_' + (_id + 1))[0].innerHTML)
    //                                         .append('<div class="col-lg-12 col-sm-12" style="margin-bottom: 18px; padding=16.5px;"></div>')
    //                                         .append($('#table5_' + (_id + 2))[0].innerHTML)
    //                                         .append('<div class="col-lg-12 col-sm-12" style="margin-bottom: 18px; padding=16.5px;"></div>')
    //                                         .append($('#table5_' + (_id + 3))[0].innerHTML)
    //                                         .append('<div class="col-lg-12 col-sm-12" style="margin-bottom: 18px; padding=16.5px;"></div>')
    //                                         .append($('#table5_' + (_id + 4))[0].innerHTML)
    //                                     ).then(function (canvas) {
    //                                         document.body.appendChild(canvas);
    //                                         $scope.fifth_page_table.push(canvas.toDataURL());
    //                                         $('#table5_' + (_id + 1)).add('#table5_' + (_id + 2)).add('#table5_' + (_id + 3)).add('#table5_' + (_id + 4)).delay(1000).remove();
    //                                         makeCanvasForTable(i);
    //
    //                                     });
    //                                 }
    //                                 else if (i < $scope._user_group_size && i === $scope._user_group_size - 4) {
    //                                     html2canvas($('#table5_' + _id)
    //                                             .append('<div class="col-lg-12 col-sm-12" style="margin-bottom: 18px; padding=16.5px;"></div>')
    //                                             .append($('#table5_' + (_id + 1))[0].innerHTML)
    //                                             .append('<div class="col-lg-12 col-sm-12" style="margin-bottom: 18px; padding=16.5px;"></div>')
    //                                             .append($('#table5_' + (_id + 2))[0].innerHTML)
    //                                             .append('<div class="col-lg-12 col-sm-12" style="margin-bottom: 18px; padding=16.5px;"></div>')
    //                                             .append($('#table5_' + (_id + 3))[0].innerHTML)
    //                                         // .append('<div class="col-lg-12 col-sm-12" style="margin-bottom: 18px; padding=16.5px;"></div>')
    //                                         // .append($('#table5_'+(_id+3))[0].innerHTML)
    //                                     ).then(function (canvas) {
    //                                         document.body.appendChild(canvas);
    //                                         $scope.fifth_page_table.push(canvas.toDataURL());
    //                                         $('#table5_' + (_id + 1)).add('#table5_' + (_id + 2)).add('#table5_' + (_id + 3)).delay(1000).remove();
    //                                         resolve($scope.fifth_page_table);
    //                                     });
    //                                 } else if (i < $scope._user_group_size && i === $scope._user_group_size - 3) {
    //                                     html2canvas($('#table5_' + _id)
    //                                             .append('<div class="col-lg-12 col-sm-12" style="margin-bottom: 18px; padding=16.5px;"></div>')
    //                                             .append($('#table5_' + (_id + 1))[0].innerHTML)
    //                                             .append('<div class="col-lg-12 col-sm-12" style="margin-bottom: 18px; padding=16.5px;"></div>')
    //                                             .append($('#table5_' + (_id + 2))[0].innerHTML)
    //                                         // .append('<div class="col-lg-12 col-sm-12" style="margin-bottom: 18px; padding=16.5px;"></div>')
    //                                         // .append($('#table5_'+(_id+3))[0].innerHTML)
    //                                         // .append('<div class="col-lg-12 col-sm-12" style="margin-bottom: 18px; padding=16.5px;"></div>')
    //                                         // .append($('#table5_'+(_id+3))[0].innerHTML)
    //                                     ).then(function (canvas) {
    //                                         document.body.appendChild(canvas);
    //                                         $scope.fifth_page_table.push(canvas.toDataURL());
    //                                         $('#table5_' + (_id + 1)).add('#table5_' + (_id + 2)).delay(1000).remove();
    //                                         resolve($scope.fifth_page_table);
    //                                     });
    //                                 } else if (i < $scope._user_group_size && i === $scope._user_group_size - 2) {
    //                                     html2canvas($('#table5_' + _id)
    //                                             .append('<div class="col-lg-12 col-sm-12" style="margin-bottom: 18px; padding=16.5px;"></div>')
    //                                             .append($('#table5_' + (_id + 1))[0].innerHTML)
    //                                         // .append('<div class="col-lg-12 col-sm-12" style="margin-bottom: 18px; padding=16.5px;"></div>')
    //                                         // .append($('#table5_'+(_id+2))[0].innerHTML)
    //                                         // .append('<div class="col-lg-12 col-sm-12" style="margin-bottom: 18px; padding=16.5px;"></div>')
    //                                         // .append($('#table5_'+(_id+3))[0].innerHTML)
    //                                         // .append('<div class="col-lg-12 col-sm-12" style="margin-bottom: 18px; padding=16.5px;"></div>')
    //                                         // .append($('#table5_'+(_id+3))[0].innerHTML)
    //                                     ).then(function (canvas) {
    //                                         document.body.appendChild(canvas);
    //                                         $scope.fifth_page_table.push(canvas.toDataURL());
    //                                         $('#table5_' + (_id + 1)).delay(1000).remove();
    //                                         resolve($scope.fifth_page_table);
    //                                     });
    //                                 } else {
    //                                     html2canvas($('#table5_' + _id)).then(function (canvas) {
    //                                         document.body.appendChild(canvas);
    //                                         $scope.fifth_page_table.push(canvas.toDataURL());
    //                                         // $('#table5_5').add('#table5_6').add('#table5_7').add('#table5_8').delay(1000).remove();
    //                                         resolve($scope.fifth_page_table);
    //                                     });
    //                                 }
    //                             }
    //
    //                             // call recursively
    //                             makeCanvasForTable(3);
    //                         });
    //                     });
    //                 });
    //
    //             });
    //         });
    //     });
    // };
    // var _promise_canvas_all = function() {
    //     return $q(function(resolve, reject) {
    //         html2canvas($('#header_page').delay(1000)).then(function(canvas) {
    //             $scope.header_page = canvas.toDataURL();
    //             html2canvas($('#first_page').delay(1000)).then(function(canvas) {
    //                 document.body.appendChild(canvas);
    //                 $scope.first_page = canvas.toDataURL();
    //                 html2canvas($('#second_page').delay(1000)).then(function(canvas) {
    //                     document.body.appendChild(canvas);
    //                     $scope.second_page = canvas.toDataURL();
    //                     html2canvas($('#third_page').delay(1000)).then(function(canvas) {
    //                         document.body.appendChild(canvas);
    //                         $scope.third_page = canvas.toDataURL();
    //                         html2canvas($('#fourth_page').delay(1000)).then(function (canvas) {
    //                             document.body.appendChild(canvas);
    //                             $scope.fourth_page = canvas.toDataURL();
    //
    //                             html2canvas($('#fifth_page_grp')
    //                                 .append($('#table5_1')[0].outerHTML)
    //                                 .append($('#table5_2')[0].outerHTML)
    //                                 .append($('#table5_3')[0].outerHTML)
    //                             ).then(function (canvas) {
    //                                 document.body.appendChild(canvas);
    //                                 $scope.fifth_page_grp = canvas.toDataURL();
    //                                 $('#table5_1').add('#table5_2').add('#table5_3').detach();
    //
    //                                 $scope.fifth_page_table = [];
    //
    //                                 function makeCanvasForTable(i) {
    //                                     console.log("i : ", i);
    //                                     var _id = i + 1;
    //
    //                                     console.log("id : ", _id);
    //                                     // 5개 선택
    //                                     if (i < $scope._user_group_size && i < $scope._user_group_size - 5) {
    //                                         i += 5;
    //                                         html2canvas($('#table5_' + _id)
    //                                             .append('<div class="col-lg-12 col-sm-12" style="margin-bottom: 18px; padding=16.5px;"></div>')
    //                                             .append($('#table5_' + (_id + 1))[0].innerHTML)
    //                                             .append('<div class="col-lg-12 col-sm-12" style="margin-bottom: 18px; padding=16.5px;"></div>')
    //                                             .append($('#table5_' + (_id + 2))[0].innerHTML)
    //                                             .append('<div class="col-lg-12 col-sm-12" style="margin-bottom: 18px; padding=16.5px;"></div>')
    //                                             .append($('#table5_' + (_id + 3))[0].innerHTML)
    //                                             .append('<div class="col-lg-12 col-sm-12" style="margin-bottom: 18px; padding=16.5px;"></div>')
    //                                             .append($('#table5_' + (_id + 4))[0].innerHTML)
    //                                         ).then(function (canvas) {
    //                                             document.body.appendChild(canvas);
    //                                             $scope.fifth_page_table.push(canvas.toDataURL());
    //                                             $('#table5_' + (_id + 1)).add('#table5_' + (_id + 2)).add('#table5_' + (_id + 3)).add('#table5_' + (_id + 4)).detach();
    //                                             makeCanvasForTable(i);
    //                                         });
    //                                     }
    //                                     else if (i < $scope._user_group_size && i === $scope._user_group_size - 4) {
    //                                         i += 5;
    //                                         html2canvas($('#table5_' + _id)
    //                                                 .append('<div class="col-lg-12 col-sm-12" style="margin-bottom: 18px; padding=16.5px;"></div>')
    //                                                 .append($('#table5_' + (_id + 1))[0].innerHTML)
    //                                                 .append('<div class="col-lg-12 col-sm-12" style="margin-bottom: 18px; padding=16.5px;"></div>')
    //                                                 .append($('#table5_' + (_id + 2))[0].innerHTML)
    //                                                 .append('<div class="col-lg-12 col-sm-12" style="margin-bottom: 18px; padding=16.5px;"></div>')
    //                                                 .append($('#table5_' + (_id + 3))[0].innerHTML)
    //                                             // .append('<div class="col-lg-12 col-sm-12" style="margin-bottom: 18px; padding=16.5px;"></div>')
    //                                             // .append($('#table5_'+(_id+3))[0].innerHTML)
    //                                         ).then(function (canvas) {
    //                                             document.body.appendChild(canvas);
    //                                             $scope.fifth_page_table.push(canvas.toDataURL());
    //                                             $('#table5_' + (_id + 1)).add('#table5_' + (_id + 2)).add('#table5_' + (_id + 3)).delay(1000).detach();
    //                                             resolve($scope.fifth_page_table);
    //                                         });
    //                                     } else if (i < $scope._user_group_size && i === $scope._user_group_size - 3) {
    //                                         i += 5;
    //                                         html2canvas($('#table5_' + _id)
    //                                                 .append('<div class="col-lg-12 col-sm-12" style="margin-bottom: 18px; padding=16.5px;"></div>')
    //                                                 .append($('#table5_' + (_id + 1))[0].innerHTML)
    //                                                 .append('<div class="col-lg-12 col-sm-12" style="margin-bottom: 18px; padding=16.5px;"></div>')
    //                                                 .append($('#table5_' + (_id + 2))[0].innerHTML)
    //                                             // .append('<div class="col-lg-12 col-sm-12" style="margin-bottom: 18px; padding=16.5px;"></div>')
    //                                             // .append($('#table5_'+(_id+3))[0].innerHTML)
    //                                             // .append('<div class="col-lg-12 col-sm-12" style="margin-bottom: 18px; padding=16.5px;"></div>')
    //                                             // .append($('#table5_'+(_id+3))[0].innerHTML)
    //                                         ).then(function (canvas) {
    //                                             document.body.appendChild(canvas);
    //                                             $scope.fifth_page_table.push(canvas.toDataURL());
    //                                             $('#table5_' + (_id + 1)).add('#table5_' + (_id + 2)).detach();
    //                                             resolve($scope.fifth_page_table);
    //                                         });
    //                                     } else if (i < $scope._user_group_size && i === $scope._user_group_size - 2) {
    //                                         i += 5;
    //                                         html2canvas($('#table5_' + _id)
    //                                                 .append('<div class="col-lg-12 col-sm-12" style="margin-bottom: 18px; padding=16.5px;"></div>')
    //                                                 .append($('#table5_' + (_id + 1))[0].innerHTML)
    //                                             // .append('<div class="col-lg-12 col-sm-12" style="margin-bottom: 18px; padding=16.5px;"></div>')
    //                                             // .append($('#table5_'+(_id+2))[0].innerHTML)
    //                                             // .append('<div class="col-lg-12 col-sm-12" style="margin-bottom: 18px; padding=16.5px;"></div>')
    //                                             // .append($('#table5_'+(_id+3))[0].innerHTML)
    //                                             // .append('<div class="col-lg-12 col-sm-12" style="margin-bottom: 18px; padding=16.5px;"></div>')
    //                                             // .append($('#table5_'+(_id+3))[0].innerHTML)
    //                                         ).then(function (canvas) {
    //                                             document.body.appendChild(canvas);
    //                                             $scope.fifth_page_table.push(canvas.toDataURL());
    //                                             $('#table5_' + (_id + 1)).delay(1000).detach();
    //                                             resolve($scope.fifth_page_table);
    //                                         });
    //                                     } else {
    //                                         i += 5;
    //                                         html2canvas($('#table5_' + _id)).then(function (canvas) {
    //                                             document.body.appendChild(canvas);
    //                                             $scope.fifth_page_table.push(canvas.toDataURL());
    //                                             // $('#table5_5').add('#table5_6').add('#table5_7').add('#table5_8').delay(1000).remove();
    //                                             _id = 0;
    //                                             resolve($scope.fifth_page_table);
    //                                         });
    //                                     }
    //                                 }
    //
    //                                 // call recursively
    //                                 makeCanvasForTable(3);
    //                             });
    //                         });
    //                     });
    //
    //                 });
    //             });
    //         });
    //     });
    // };
    //
    //
    // $('#elementID').bind('click', function () {
    //     console.log("I would also be triggered!");
    // });

    //
    // $scope.export = function() {
    //     /*
    //         1. html2canvas를 이용하여 해당 엘리먼트에 대해서 스크린샷 한다.
    //         2. 스크린샷이 완벽히 끝나면 pdfMake를 이용하여
    //         3. content배열에 이미지 데이터 및 width, height 등의 컨피크 셋 object(docConfig)를 만든다.
    //      */
    //
    //     notie.alert({
    //         type: 'error',
    //         stay: 'true',
    //         time: 30,
    //         text: 'pdf를 만들고 있습니다. 기다려주세요!'
    //     });
    //     var check_grp_state = function () {
    //         return $q(function (resolve, reject) {
    //             console.log("$scope.grpState");
    //             // console.log($scope.grpState);
    //             // $scope.promise_pdf.push(_promise_header());
    //             // if ($scope.grpState[0].state) {
    //             //     $scope.promise_pdf.push(_promise_first());
    //             // }
    //             // if ($scope.grpState[1].state) {
    //             //     $scope.promise_pdf.push(_promise_second());
    //             //     $scope.promise_pdf.push(_promise_third());
    //             // }
    //             // if ($scope.grpState[2].state) {
    //             //     $scope.promise_pdf.push(_promise_fourth());
    //             // }
    //             // if (!$scope.grpState[0].state && !$scope.grpState[1].state && $scope.grpState[2].state)
    //             // {
    //             //     $scope.promise_pdf.push(_promise_fifth_grp());
    //             //     for(var i =0; i<$scope._user_group_size; i++){
    //             //         $scope.promise_pdf.push(_promise_fifth_table(i+1));
    //             //     }
    //             // }
    //             resolve('check grp state!!');
    //         });
    //     };
    //
    //     $scope.getPdfConfig = function (){
    //         var deferred = $q.defer();
    //         check_grp_state().then(
    //             /*성공시*/
    //             function (values) {
    //                 console.log(values);
    //                 // console.log("모두 완료됨", result);
    //                 size.header_page.width = $('#header_page').width();
    //                 size.header_page.height = $('#header_page').height();
    //                 size.first_page.width = $('#first_page').width();
    //                 size.first_page.height = $('#first_page').height();
    //                 size.second_page.width = $('#second_page').width();
    //                 size.second_page.height = $('#second_page').height();
    //                 size.third_page.width = $('#third_page').width();
    //                 size.third_page.height = $('#third_page').height();
    //                 size.fourth_page.width = $('#fourth_page').width();
    //                 size.fourth_page.height = $('#fourth_page').height();
    //                 size.fifth_page.width = $('#fifth_page').width();
    //                 size.fifth_page.height = $('#fifth_page').height();
    //                 size.fifth_page_grp.width = $('#fifth_page_grp').width();
    //                 size.fifth_page_grp.height = 1698;
    //                 size.fifth_page_tb.width = $('#table5_1').width();
    //                 size.fifth_page_tb.height = $('#table5_1').height();
    //                 size.fifth_page_tb_group.width = $('#table5_group').width();
    //                 size.fifth_page_tb_group.height = $('#table5_group').height();
    //                 size.fifth_page_tb_set.width = 1169;
    //                 size.fifth_page_tb_set.height = 1687;
    //                 size.last_page.width = $('#last_page').width();
    //                 size.last_page.height = $('#last_page').height();
    //                 console.log(
    //                     "head_width : " + size.header_page.width + " : " + "head_height : " + size.header_page.height + " : " +
    //                     "first_width : " + size.first_page.width + " : " + "first_height : " + size.first_page.height + " : " +
    //                     "sec_width : " + size.second_page.width + " : " + "sec_height : " + size.second_page.height + " : " +
    //                     "third_width : " + size.third_page.width + " : " + "third_height : " + size.third_page.height + " : " +
    //                     "fourth_width : " + size.fourth_page.width + " : " + "fourth_height : " + size.fourth_page.height + " : " +
    //                     "fifth_width : " + size.fifth_page.width + " : " + "fifth_height : " + size.fifth_page.height + ":" +
    //                     "fifth_table width : " + size.fifth_page_tb_set.width + "fifth_table height : " + size.fifth_page_tb_set.height
    //                 );
    //                 if (duration >= 20) {
    //                     second_ratio = 3;
    //                     fourth_ratio = 3;
    //                     fifth_ratio = 3;
    //                     ratio = 3;
    //                 } else if (10 < duration && duration < 20) {
    //                     second_ratio = 3;
    //                     fourth_ratio = 3;
    //                     fifth_ratio = 3;
    //                     ratio = 2.6;
    //                 } else {
    //                     if (size.second_page.height > 1600 || size.fourth_page.height > 1600 || size.fifth_page.height > 1600) {
    //                         second_ratio = 3;
    //                         fourth_ratio = 3;
    //                         fifth_ratio = 3;
    //                         ratio = 2.6;
    //                     } else {
    //                         second_ratio = 2.6;
    //                         fourth_ratio = 2.6;
    //                         fifth_ratio = 3;
    //                         ratio = 2.6;
    //                     }
    //                 }
    //                 // 선택한 보고서 종류에 따라 함수 호출
    //                 // 3개 검사
    //                 if ($scope.grpState[0].state && $scope.grpState[1].state && $scope.grpState[2].state) {
    //                     _promise_canvas_all().then(function (result) {
    //                         // formular : (original height / original width) x new_width = new_height
    //                         // margin: [left, top, right, bottom]
    //                         // config for pdf
    //                         console.log("컨피그 설정: ", result);
    //                         var mod_doc_config = {
    //                             header_page: {
    //                                 image: $scope.header_page,
    //                                 width: Math.ceil(size.header_page.width / ratio),
    //                                 height: Math.ceil((size.header_page.height / size.header_page.width) * Math.ceil(size.header_page.width / ratio)),
    //                                 margin: [0, 0, 0, 0],
    //                                 style: 'defaultStyle'
    //                             },
    //                             first_page: {
    //                                 image: $scope.first_page,
    //                                 width: Math.ceil(size.first_page.width / ratio),
    //                                 height: Math.ceil((size.first_page.height / size.first_page.width) * Math.ceil(size.first_page.width / ratio)),
    //                                 margin: [0, 0, 0, 0],
    //                                 style: 'defaultStyle',
    //                                 pageBreak: 'after'
    //                             },
    //                             second_page: {
    //                                 image: $scope.second_page,
    //                                 width: Math.ceil(size.second_page.width / second_ratio),
    //                                 height: Math.ceil((size.second_page.height / size.second_page.width) * Math.ceil(size.second_page.width / second_ratio)),
    //                                 margin: [0, 15, 0, 0],
    //                                 style: 'defaultStyle',
    //                                 pageBreak: 'after'
    //                             },
    //                             third_page: {
    //                                 image: $scope.third_page,
    //                                 width: Math.ceil(size.third_page.width / ratio),
    //                                 height: Math.ceil((size.third_page.height / size.third_page.width) * Math.ceil(size.third_page.width / ratio)),
    //                                 margin: [0, 15, 0, 0],
    //                                 style: 'defaultStyle',
    //                                 pageBreak: 'after'
    //                             },
    //                             fourth_page: {
    //                                 image: $scope.fourth_page,
    //                                 width: Math.ceil(size.fourth_page.width / fourth_ratio),
    //                                 height: Math.ceil((size.fourth_page.height / size.fourth_page.width) * Math.ceil(size.fourth_page.width / fourth_ratio)),
    //                                 margin: [0, 15, 0, 0],
    //                                 style: 'defaultStyle',
    //                                 pageBreak: 'after'
    //                             },
    //                             fifth_page_grp: {
    //                                 image: $scope.fifth_page_grp,
    //                                 width: Math.ceil(size.fifth_page_grp.width / ratio),
    //                                 height: Math.ceil((size.fifth_page_grp.height / size.fifth_page_grp.width) * Math.ceil(size.fifth_page_grp.width / ratio)),
    //                                 margin: [0, 15, 0, 0],
    //                                 style: 'defaultStyle',
    //                                 pageBreak: 'after'
    //                             }
    //                         };
    //
    //                         var fifth_page_table = [];
    //                         if ($scope.grpState[2].state) {
    //                             _(result).each(function (img, i) {
    //                                 // console.log(img);
    //                                 // if ((i + 1) % 3 === 0) {
    //                                 fifth_page_table.push({
    //                                     image: img,
    //                                     width: Math.ceil(size.fifth_page_tb_set.width / fifth_ratio),
    //                                     height: Math.ceil((size.fifth_page_tb_set.height / size.fifth_page_tb_set.width) * Math.ceil(size.fifth_page_tb_set.width / fifth_ratio)),
    //                                     margin: [0, 15, 0, 0],
    //                                     style: 'defaultStyle',
    //                                     pageBreak: 'after'
    //                                 });
    //                             });
    //                             _.extend(mod_doc_config, {
    //                                 fifth_page_table: fifth_page_table
    //                             });
    //                             console.log(mod_doc_config);
    //                         }
    //                         // }
    //                         /*
    //                             [0] : 인터페이스 그래프 상태
    //                             [1] : 유저 그래프 상태
    //                             [2] : 유저 그룹 그래프 상태
    //
    //                          */
    //                         // 3개 검사
    //                         /*
    //                             0 header - 헤더
    //                             1 first - 인터페이스
    //                             2 second - 유저
    //                             3 third - 유저
    //                             4 fourth - 그룹
    //                             5 fifth_grp -그룹
    //                         */
    //                         if ($scope.grpState[0].state && $scope.grpState[1].state && $scope.grpState[2].state) {
    //                             $scope.docConfig = {
    //                                 footer: {
    //                                     columns: [{
    //                                         text: 'Saisei copyright',
    //                                         alignment: 'center'
    //                                     }]
    //                                 },
    //                                 content: [
    //                                     mod_doc_config.header_page,
    //                                     mod_doc_config.first_page,
    //                                     mod_doc_config.second_page,
    //                                     mod_doc_config.third_page,
    //                                     mod_doc_config.fourth_page,
    //                                     mod_doc_config.fifth_page_grp
    //                                     // mod_doc_config.fifth_page_table
    //                                 ],
    //                                 styles: {
    //                                     defaultStyle: {
    //                                         alignment: 'center'
    //                                     },
    //                                     footer: {
    //                                         alignment: 'center',
    //                                         font: 'customFont'
    //                                     }
    //                                 }
    //                             };
    //                             if ($scope.grpState[2].state) {
    //                                 _(mod_doc_config.fifth_page_table).each(function (config, i) {
    //                                     $scope.docConfig.content.push(config)
    //                                 });
    //                             }
    //                         } else {
    //                             // 2개 검사
    //                             if ($scope.grpState[0].state && $scope.grpState[1].state) {
    //                                 // delete mod_doc_config.second_page.pageBreak;
    //                                 $scope.docConfig = {
    //                                     footer: {
    //                                         columns: [{
    //                                             text: 'Saisei copyright',
    //                                             alignment: 'center'
    //                                         }]
    //                                     },
    //                                     content: [
    //                                         mod_doc_config.header_page,
    //                                         mod_doc_config.first_page,
    //                                         mod_doc_config.second_page,
    //                                         mod_doc_config.third_page
    //                                     ],
    //                                     styles: {
    //                                         defaultStyle: {
    //                                             alignment: 'center'
    //                                         },
    //                                         footer: {
    //                                             alignment: 'center',
    //                                             font: 'customFont'
    //                                         }
    //                                     }
    //                                 };
    //                             } else if ($scope.grpState[0].state && $scope.grpState[2].state) {
    //                                 delete mod_doc_config.third_page.pageBreak;
    //                                 $scope.docConfig = {
    //                                     footer: {
    //                                         columns: [{
    //                                             text: 'Saisei copyright',
    //                                             alignment: 'center'
    //                                         }]
    //                                     },
    //                                     content: [
    //                                         mod_doc_config.header_page,
    //                                         mod_doc_config.first_page,
    //                                         mod_doc_config.fourth_page,
    //                                         mod_doc_config.fifth_page_grp,
    //                                         // mod_doc_config.fifth_page_table
    //                                     ],
    //                                     styles: {
    //                                         defaultStyle: {
    //                                             alignment: 'center'
    //                                         },
    //                                         footer: {
    //                                             alignment: 'center',
    //                                             font: 'customFont'
    //                                         }
    //                                     }
    //                                 };
    //                                 _(mod_doc_config.fifth_page_table).each(function (config, i) {
    //                                     $scope.docConfig.content.push(config)
    //                                 });
    //                             } else if ($scope.grpState[1].state && $scope.grpState[2].state) {
    //                                 delete mod_doc_config.third_page.pageBreak;
    //                                 $scope.docConfig = {
    //                                     footer: {
    //                                         columns: [{
    //                                             text: 'Saisei copyright',
    //                                             alignment: 'center'
    //                                         }]
    //                                     },
    //                                     content: [
    //                                         mod_doc_config.header_page,
    //                                         mod_doc_config.second_page,
    //                                         mod_doc_config.third_page,
    //                                         mod_doc_config.fourth_page,
    //                                         mod_doc_config.fifth_page_grp
    //                                         // mod_doc_config.fifth_page_table
    //                                     ],
    //                                     styles: {
    //                                         defaultStyle: {
    //                                             alignment: 'center'
    //                                         },
    //                                         footer: {
    //                                             alignment: 'center',
    //                                             font: 'customFont'
    //                                         }
    //                                     }
    //                                 };
    //                                 if ($scope.grpState[2].state) {
    //                                     _(mod_doc_config.fifth_page_table).each(function (config, i) {
    //                                         $scope.docConfig.content.push(config)
    //                                     });
    //                                 }
    //                             } else {
    //                                 // 1개 검사
    //                                 if ($scope.grpState[0].state) {
    //                                     delete mod_doc_config.first_page.pageBreak;
    //                                     $scope.docConfig = {
    //                                         footer: {
    //                                             columns: [{
    //                                                 text: 'Saisei copyright',
    //                                                 alignment: 'center'
    //                                             }]
    //                                         },
    //                                         content: [
    //                                             mod_doc_config.header_page,
    //                                             mod_doc_config.first_page
    //                                         ],
    //                                         styles: {
    //                                             defaultStyle: {
    //                                                 alignment: 'center'
    //                                             },
    //                                             footer: {
    //                                                 alignment: 'center',
    //                                                 font: 'customFont'
    //                                             }
    //                                         }
    //                                     };
    //                                 } else if ($scope.grpState[1].state) {
    //                                     $scope.docConfig = {
    //                                         footer: {
    //                                             columns: [{
    //                                                 text: 'Saisei copyright',
    //                                                 alignment: 'center'
    //                                             }]
    //                                         },
    //                                         content: [
    //                                             mod_doc_config.header_page,
    //                                             mod_doc_config.second_page,
    //                                             mod_doc_config.third_page
    //                                         ],
    //                                         styles: {
    //                                             defaultStyle: {
    //                                                 alignment: 'center'
    //                                             },
    //                                             footer: {
    //                                                 alignment: 'center',
    //                                                 font: 'customFont'
    //                                             }
    //                                         }
    //                                     };
    //                                 } else if ($scope.grpState[2].state) {
    //                                     delete mod_doc_config.fourth_page.pageBreak;
    //                                     $scope.docConfig = {
    //                                         footer: {
    //                                             columns: [{
    //                                                 text: 'Saisei copyright',
    //                                                 alignment: 'center'
    //                                             }]
    //                                         },
    //                                         content: [
    //                                             mod_doc_config.header_page,
    //                                             mod_doc_config.fourth_page,
    //                                             mod_doc_config.fifth_page_grp
    //                                             // mod_doc_config.fifth_page_table
    //                                         ],
    //                                         styles: {
    //                                             defaultStyle: {
    //                                                 alignment: 'center'
    //                                             },
    //                                             footer: {
    //                                                 alignment: 'center',
    //                                                 font: 'customFont'
    //                                             }
    //                                         }
    //                                     };
    //                                     if ($scope.grpState[2].state) {
    //                                         _(mod_doc_config.fifth_page_table).each(function (config, i) {
    //                                             $scope.docConfig.content.push(config)
    //                                         });
    //                                     }
    //                                 } else {
    //                                     $scope.docConfig = {
    //                                         footer: {
    //                                             columns: [{
    //                                                 text: 'Saisei copyright',
    //                                                 alignment: 'center'
    //                                             }]
    //                                         },
    //                                         content: [
    //                                             mod_doc_config.header_page,
    //                                         ],
    //                                         styles: {
    //                                             defaultStyle: {
    //                                                 alignment: 'center'
    //                                             },
    //                                             footer: {
    //                                                 alignment: 'center',
    //                                                 font: 'customFont'
    //                                             }
    //                                         }
    //                                     };
    //                                 }
    //                             }
    //                         }
    //                         console.log("ratio : " + ratio);
    //                         console.log("pdfmake 컨피그: ", $scope.docConfig);
    //                         deferred.resolve($scope.docConfig);
    //                     });
    //                 } else {
    //                     // 2개 검사
    //                     if ($scope.grpState[0].state && $scope.grpState[1].state) {
    //                         _promise_canvas_int_user().then(function (result) {
    //                             // formular : (original height / original width) x new_width = new_height
    //                             if (duration >= 20) {
    //                                 var ratio = 3;
    //                             } else if (10 < duration && duration < 20) {
    //                                 var ratio = 2.6;
    //                             } else {
    //                                 if (size.second_page.height > 1600 || size.fourth_page.height > 1600 || size.fifth_page.height > 1600) {
    //                                     var second_ratio = 2.6;
    //                                     var fourth_ratio = 2.6;
    //                                     var fifth_ratio = 3;
    //                                     var ratio = 2.6;
    //                                 } else {
    //                                     var second_ratio = 2.6;
    //                                     var fourth_ratio = 2.6;
    //                                     var fifth_ratio = 3;
    //                                     var ratio = 2.6;
    //                                 }
    //                             }
    //                             // margin: [left, top, right, bottom]
    //                             // config for pdf
    //                             console.log("컨피그 설정: ", result);
    //                             var mod_doc_config = {
    //                                 header_page: {
    //                                     image: $scope.header_page,
    //                                     width: Math.ceil(size.header_page.width / ratio),
    //                                     height: Math.ceil((size.header_page.height / size.header_page.width) * Math.ceil(size.header_page.width / ratio)),
    //                                     margin: [0, 0, 0, 0],
    //                                     style: 'defaultStyle'
    //                                 },
    //                                 first_page: {
    //                                     image: $scope.first_page,
    //                                     width: Math.ceil(size.first_page.width / ratio),
    //                                     height: Math.ceil((size.first_page.height / size.first_page.width) * Math.ceil(size.first_page.width / ratio)),
    //                                     margin: [0, 0, 0, 0],
    //                                     style: 'defaultStyle',
    //                                     pageBreak: 'after'
    //                                 },
    //                                 second_page: {
    //                                     image: $scope.second_page,
    //                                     width: Math.ceil(size.second_page.width / second_ratio),
    //                                     height: Math.ceil((size.second_page.height / size.second_page.width) * Math.ceil(size.second_page.width / second_ratio)),
    //                                     margin: [0, 15, 0, 0],
    //                                     style: 'defaultStyle',
    //                                     pageBreak: 'after'
    //                                 },
    //                                 third_page: {
    //                                     image: $scope.third_page,
    //                                     width: Math.ceil(size.third_page.width / ratio),
    //                                     height: Math.ceil((size.third_page.height / size.third_page.width) * Math.ceil(size.third_page.width / ratio)),
    //                                     margin: [0, 15, 0, 0],
    //                                     style: 'defaultStyle',
    //                                     pageBreak: 'after'
    //                                 },
    //                                 fourth_page: {
    //                                     image: $scope.fourth_page,
    //                                     width: Math.ceil(size.fourth_page.width / fourth_ratio),
    //                                     height: Math.ceil((size.fourth_page.height / size.fourth_page.width) * Math.ceil(size.fourth_page.width / fourth_ratio)),
    //                                     margin: [0, 15, 0, 0],
    //                                     style: 'defaultStyle',
    //                                     pageBreak: 'after'
    //                                 },
    //                                 fifth_page_grp: {
    //                                     image: $scope.fifth_page_grp,
    //                                     width: Math.ceil(size.fifth_page_grp.width / ratio),
    //                                     height: Math.ceil((size.fifth_page_grp.height / size.fifth_page_grp.width) * Math.ceil(size.fifth_page_grp.width / ratio)),
    //                                     margin: [0, 15, 0, 0],
    //                                     style: 'defaultStyle',
    //                                     pageBreak: 'after'
    //                                 }
    //                                 // fifth_page_table: {
    //                                 //     image: result[0],
    //                                 //     width: Math.ceil(size.fifth_page_tb_set.width / fifth_ratio),
    //                                 //     height: Math.ceil((size.fifth_page_tb_set.height / size.fifth_page_tb_set.width) * Math.ceil(size.fifth_page_tb_set.width / fifth_ratio)),
    //                                 //     margin: [0, 15, 0, 0],
    //                                 //     style: 'defaultStyle'
    //                                 // }
    //                                 // last_page: {
    //                                 //      image: $scope.last_page,
    //                                 //      width: Math.ceil(size.last_page.width / ratio),
    //                                 //      height: Math.ceil((size.last_page.height / size.last_page.width) * Math.ceil(size.last_page.width / ratio)),
    //                                 //      margin: [0, 15, 0, 0]
    //                                 //  }
    //                             };
    //
    //                             /**
    //                              * Add attributes to each object of an array.
    //                              *
    //                              * @param {array} foo - Array of objects where we will add the attibutes
    //                              * @param {function} iterator
    //                              */
    //                                 // _.each(foo, function(element, index) {
    //                                 //     _.extend(element, {field1: index}, {field2: 'bar', field3: 'baz'});
    //                                 // });
    //                             var fifth_page_table = [];
    //                             // console.log("$scope.fifth_page_tables");
    //                             // console.log($scope.fifth_page_tables);
    //                             // console.log(canvas[2].tables);
    //                             // console.log(canvas);
    //                             if ($scope.grpState[2].state) {
    //                                 _(result).each(function (img, i) {
    //                                     console.log(img);
    //                                     // if ((i + 1) % 3 === 0) {
    //                                     fifth_page_table.push({
    //                                         image: img,
    //                                         width: Math.ceil(size.fifth_page_tb_set.width / fifth_ratio),
    //                                         height: Math.ceil((size.fifth_page_tb_set.height / size.fifth_page_tb_set.width) * Math.ceil(size.fifth_page_tb_set.width / fifth_ratio)),
    //                                         margin: [0, 15, 0, 0],
    //                                         style: 'defaultStyle',
    //                                         pageBreak: 'after'
    //                                     });
    //                                     // } else {
    //                                     //     fifth_page_tables.push({
    //                                     //         image: img,
    //                                     //         width: Math.ceil(size.fifth_page_tb.width / ratio),
    //                                     //         height: Math.ceil((size.fifth_page_tb.height / size.fifth_page_tb.width) * Math.ceil(size.fifth_page_tb.width / ratio)),
    //                                     //         margin: [0, 15, 0, 0],
    //                                     //         style: 'defaultStyle'
    //                                     //     });
    //                                     // }
    //                                 });
    //                                 _.extend(mod_doc_config, {
    //                                     fifth_page_table: fifth_page_table
    //                                 });
    //                                 console.log(mod_doc_config);
    //                                 // console.log(fifth_page_table);
    //                             }
    //                             // }
    //                             /*
    //                                 [0] : 인터페이스 그래프 상태
    //                                 [1] : 유저 그래프 상태
    //                                 [2] : 유저 그룹 그래프 상태
    //
    //                              */
    //                             // 3개 검사
    //                             /*
    //                                 0 header - 헤더
    //                                 1 first - 인터페이스
    //                                 2 second - 유저
    //                                 3 third - 유저
    //                                 4 fourth - 그룹
    //                                 5 fifth_grp -그룹
    //                             */
    //                             if ($scope.grpState[0].state && $scope.grpState[1].state && $scope.grpState[2].state) {
    //                                 $scope.docConfig = {
    //                                     footer: {
    //                                         columns: [{
    //                                             text: 'Saisei copyright',
    //                                             alignment: 'center'
    //                                         }]
    //                                     },
    //                                     content: [
    //                                         mod_doc_config.header_page,
    //                                         mod_doc_config.first_page,
    //                                         mod_doc_config.second_page,
    //                                         mod_doc_config.third_page,
    //                                         mod_doc_config.fourth_page,
    //                                         mod_doc_config.fifth_page_grp
    //                                         // mod_doc_config.fifth_page_table
    //                                     ],
    //                                     styles: {
    //                                         defaultStyle: {
    //                                             alignment: 'center'
    //                                         },
    //                                         footer: {
    //                                             alignment: 'center',
    //                                             font: 'customFont'
    //                                         }
    //                                     }
    //                                 };
    //                                 if ($scope.grpState[2].state) {
    //                                     _(mod_doc_config.fifth_page_table).each(function (config, i) {
    //                                         $scope.docConfig.content.push(config)
    //                                     });
    //                                 }
    //                             } else {
    //                                 // 2개 검사
    //                                 if ($scope.grpState[0].state && $scope.grpState[1].state) {
    //                                     // delete mod_doc_config.second_page.pageBreak;
    //                                     $scope.docConfig = {
    //                                         footer: {
    //                                             columns: [{
    //                                                 text: 'Saisei copyright',
    //                                                 alignment: 'center'
    //                                             }]
    //                                         },
    //                                         content: [
    //                                             mod_doc_config.header_page,
    //                                             mod_doc_config.first_page,
    //                                             mod_doc_config.second_page,
    //                                             mod_doc_config.third_page
    //                                         ],
    //                                         styles: {
    //                                             defaultStyle: {
    //                                                 alignment: 'center'
    //                                             },
    //                                             footer: {
    //                                                 alignment: 'center',
    //                                                 font: 'customFont'
    //                                             }
    //                                         }
    //                                     };
    //                                 } else if ($scope.grpState[0].state && $scope.grpState[2].state) {
    //                                     delete mod_doc_config.third_page.pageBreak;
    //                                     $scope.docConfig = {
    //                                         footer: {
    //                                             columns: [{
    //                                                 text: 'Saisei copyright',
    //                                                 alignment: 'center'
    //                                             }]
    //                                         },
    //                                         content: [
    //                                             mod_doc_config.header_page,
    //                                             mod_doc_config.first_page,
    //                                             mod_doc_config.fourth_page,
    //                                             mod_doc_config.fifth_page_grp,
    //                                             // mod_doc_config.fifth_page_table
    //                                         ],
    //                                         styles: {
    //                                             defaultStyle: {
    //                                                 alignment: 'center'
    //                                             },
    //                                             footer: {
    //                                                 alignment: 'center',
    //                                                 font: 'customFont'
    //                                             }
    //                                         }
    //                                     };
    //                                     _(mod_doc_config.fifth_page_table).each(function (config, i) {
    //                                         $scope.docConfig.content.push(config)
    //                                     });
    //                                 } else if ($scope.grpState[1].state && $scope.grpState[2].state) {
    //                                     delete mod_doc_config.third_page.pageBreak;
    //                                     $scope.docConfig = {
    //                                         footer: {
    //                                             columns: [{
    //                                                 text: 'Saisei copyright',
    //                                                 alignment: 'center'
    //                                             }]
    //                                         },
    //                                         content: [
    //                                             mod_doc_config.header_page,
    //                                             mod_doc_config.second_page,
    //                                             mod_doc_config.third_page,
    //                                             mod_doc_config.fourth_page,
    //                                             mod_doc_config.fifth_page_grp
    //                                             // mod_doc_config.fifth_page_table
    //                                         ],
    //                                         styles: {
    //                                             defaultStyle: {
    //                                                 alignment: 'center'
    //                                             },
    //                                             footer: {
    //                                                 alignment: 'center',
    //                                                 font: 'customFont'
    //                                             }
    //                                         }
    //                                     };
    //                                     if ($scope.grpState[2].state) {
    //                                         _(mod_doc_config.fifth_page_table).each(function (config, i) {
    //                                             $scope.docConfig.content.push(config)
    //                                         });
    //                                     }
    //                                 } else {
    //                                     // 1개 검사
    //                                     if ($scope.grpState[0].state) {
    //                                         delete mod_doc_config.first_page.pageBreak;
    //                                         $scope.docConfig = {
    //                                             footer: {
    //                                                 columns: [{
    //                                                     text: 'Saisei copyright',
    //                                                     alignment: 'center'
    //                                                 }]
    //                                             },
    //                                             content: [
    //                                                 mod_doc_config.header_page,
    //                                                 mod_doc_config.first_page
    //                                             ],
    //                                             styles: {
    //                                                 defaultStyle: {
    //                                                     alignment: 'center'
    //                                                 },
    //                                                 footer: {
    //                                                     alignment: 'center',
    //                                                     font: 'customFont'
    //                                                 }
    //                                             }
    //                                         };
    //                                     } else if ($scope.grpState[1].state) {
    //                                         $scope.docConfig = {
    //                                             footer: {
    //                                                 columns: [{
    //                                                     text: 'Saisei copyright',
    //                                                     alignment: 'center'
    //                                                 }]
    //                                             },
    //                                             content: [
    //                                                 mod_doc_config.header_page,
    //                                                 mod_doc_config.second_page,
    //                                                 mod_doc_config.third_page
    //                                             ],
    //                                             styles: {
    //                                                 defaultStyle: {
    //                                                     alignment: 'center'
    //                                                 },
    //                                                 footer: {
    //                                                     alignment: 'center',
    //                                                     font: 'customFont'
    //                                                 }
    //                                             }
    //                                         };
    //                                     } else if ($scope.grpState[2].state) {
    //                                         delete mod_doc_config.fourth_page.pageBreak;
    //                                         $scope.docConfig = {
    //                                             footer: {
    //                                                 columns: [{
    //                                                     text: 'Saisei copyright',
    //                                                     alignment: 'center'
    //                                                 }]
    //                                             },
    //                                             content: [
    //                                                 mod_doc_config.header_page,
    //                                                 mod_doc_config.fourth_page,
    //                                                 mod_doc_config.fifth_page_grp
    //                                                 // mod_doc_config.fifth_page_table
    //                                             ],
    //                                             styles: {
    //                                                 defaultStyle: {
    //                                                     alignment: 'center'
    //                                                 },
    //                                                 footer: {
    //                                                     alignment: 'center',
    //                                                     font: 'customFont'
    //                                                 }
    //                                             }
    //                                         };
    //                                         if ($scope.grpState[2].state) {
    //                                             _(mod_doc_config.fifth_page_table).each(function (config, i) {
    //                                                 $scope.docConfig.content.push(config)
    //                                             });
    //                                         }
    //                                     } else {
    //                                         $scope.docConfig = {
    //                                             footer: {
    //                                                 columns: [{
    //                                                     text: 'Saisei copyright',
    //                                                     alignment: 'center'
    //                                                 }]
    //                                             },
    //                                             content: [
    //                                                 mod_doc_config.header_page,
    //                                             ],
    //                                             styles: {
    //                                                 defaultStyle: {
    //                                                     alignment: 'center'
    //                                                 },
    //                                                 footer: {
    //                                                     alignment: 'center',
    //                                                     font: 'customFont'
    //                                                 }
    //                                             }
    //                                         };
    //                                     }
    //                                 }
    //                             }
    //                             console.log("ratio : " + ratio);
    //                             console.log("pdfmake 컨피그: ", $scope.docConfig);
    //                             // if($scope.grpState[2].state) {
    //                             //     _(mod_doc_config.fifth_page_tables).each(function (config, i) {
    //                             //
    //                             //         $scope.docConfig.content.push(config)
    //                             //     });
    //                             // }
    //                             deferred.resolve($scope.docConfig);
    //                         });
    //                     } else if ($scope.grpState[0].state && $scope.grpState[2].state) {
    //                         _promise_canvas_int_user_group().then(function (result) {
    //                             if (duration >= 20) {
    //                                 var ratio = 3;
    //                             } else if (10 < duration && duration < 20) {
    //                                 var ratio = 2.6;
    //                             } else {
    //                                 if (size.second_page.height > 1600 || size.fourth_page.height > 1600 || size.fifth_page.height > 1600) {
    //                                     var second_ratio = 2.6;
    //                                     var fourth_ratio = 2.6;
    //                                     var fifth_ratio = 3;
    //                                     var ratio = 2.6;
    //                                 } else {
    //                                     var second_ratio = 2.6;
    //                                     var fourth_ratio = 2.6;
    //                                     var fifth_ratio = 3;
    //                                     var ratio = 2.6;
    //                                 }
    //                             }
    //                             // margin: [left, top, right, bottom]
    //                             // config for pdf
    //                             console.log("컨피그 설정: ", result);
    //                             var mod_doc_config = {
    //                                 header_page: {
    //                                     image: $scope.header_page,
    //                                     width: Math.ceil(size.header_page.width / ratio),
    //                                     height: Math.ceil((size.header_page.height / size.header_page.width) * Math.ceil(size.header_page.width / ratio)),
    //                                     margin: [0, 0, 0, 0],
    //                                     style: 'defaultStyle'
    //                                 },
    //                                 first_page: {
    //                                     image: $scope.first_page,
    //                                     width: Math.ceil(size.first_page.width / ratio),
    //                                     height: Math.ceil((size.first_page.height / size.first_page.width) * Math.ceil(size.first_page.width / ratio)),
    //                                     margin: [0, 0, 0, 0],
    //                                     style: 'defaultStyle',
    //                                     pageBreak: 'after'
    //                                 },
    //                                 second_page: {
    //                                     image: $scope.second_page,
    //                                     width: Math.ceil(size.second_page.width / second_ratio),
    //                                     height: Math.ceil((size.second_page.height / size.second_page.width) * Math.ceil(size.second_page.width / second_ratio)),
    //                                     margin: [0, 15, 0, 0],
    //                                     style: 'defaultStyle',
    //                                     pageBreak: 'after'
    //                                 },
    //                                 third_page: {
    //                                     image: $scope.third_page,
    //                                     width: Math.ceil(size.third_page.width / ratio),
    //                                     height: Math.ceil((size.third_page.height / size.third_page.width) * Math.ceil(size.third_page.width / ratio)),
    //                                     margin: [0, 15, 0, 0],
    //                                     style: 'defaultStyle',
    //                                     pageBreak: 'after'
    //                                 },
    //                                 fourth_page: {
    //                                     image: $scope.fourth_page,
    //                                     width: Math.ceil(size.fourth_page.width / fourth_ratio),
    //                                     height: Math.ceil((size.fourth_page.height / size.fourth_page.width) * Math.ceil(size.fourth_page.width / fourth_ratio)),
    //                                     margin: [0, 15, 0, 0],
    //                                     style: 'defaultStyle',
    //                                     pageBreak: 'after'
    //                                 },
    //                                 fifth_page_grp: {
    //                                     image: $scope.fifth_page_grp,
    //                                     width: Math.ceil(size.fifth_page_grp.width / ratio),
    //                                     height: Math.ceil((size.fifth_page_grp.height / size.fifth_page_grp.width) * Math.ceil(size.fifth_page_grp.width / ratio)),
    //                                     margin: [0, 15, 0, 0],
    //                                     style: 'defaultStyle',
    //                                     pageBreak: 'after'
    //                                 }
    //                                 // fifth_page_table: {
    //                                 //     image: result[0],
    //                                 //     width: Math.ceil(size.fifth_page_tb_set.width / fifth_ratio),
    //                                 //     height: Math.ceil((size.fifth_page_tb_set.height / size.fifth_page_tb_set.width) * Math.ceil(size.fifth_page_tb_set.width / fifth_ratio)),
    //                                 //     margin: [0, 15, 0, 0],
    //                                 //     style: 'defaultStyle'
    //                                 // }
    //                                 // last_page: {
    //                                 //      image: $scope.last_page,
    //                                 //      width: Math.ceil(size.last_page.width / ratio),
    //                                 //      height: Math.ceil((size.last_page.height / size.last_page.width) * Math.ceil(size.last_page.width / ratio)),
    //                                 //      margin: [0, 15, 0, 0]
    //                                 //  }
    //                             };
    //
    //                             /**
    //                              * Add attributes to each object of an array.
    //                              *
    //                              * @param {array} foo - Array of objects where we will add the attibutes
    //                              * @param {function} iterator
    //                              */
    //                                 // _.each(foo, function(element, index) {
    //                                 //     _.extend(element, {field1: index}, {field2: 'bar', field3: 'baz'});
    //                                 // });
    //                             var fifth_page_table = [];
    //                             // console.log("$scope.fifth_page_tables");
    //                             // console.log($scope.fifth_page_tables);
    //                             // console.log(canvas[2].tables);
    //                             // console.log(canvas);
    //                             if ($scope.grpState[2].state) {
    //                                 _(result).each(function (img, i) {
    //                                     // console.log(img);
    //                                     // if ((i + 1) % 3 === 0) {
    //                                     fifth_page_table.push({
    //                                         image: img,
    //                                         width: Math.ceil(size.fifth_page_tb_set.width / fifth_ratio),
    //                                         height: Math.ceil((size.fifth_page_tb_set.height / size.fifth_page_tb_set.width) * Math.ceil(size.fifth_page_tb_set.width / fifth_ratio)),
    //                                         margin: [0, 15, 0, 0],
    //                                         style: 'defaultStyle',
    //                                         pageBreak: 'after'
    //                                     });
    //                                     // } else {
    //                                     //     fifth_page_tables.push({
    //                                     //         image: img,
    //                                     //         width: Math.ceil(size.fifth_page_tb.width / ratio),
    //                                     //         height: Math.ceil((size.fifth_page_tb.height / size.fifth_page_tb.width) * Math.ceil(size.fifth_page_tb.width / ratio)),
    //                                     //         margin: [0, 15, 0, 0],
    //                                     //         style: 'defaultStyle'
    //                                     //     });
    //                                     // }
    //                                 });
    //                                 _.extend(mod_doc_config, {
    //                                     fifth_page_table: fifth_page_table
    //                                 });
    //                                 console.log(mod_doc_config);
    //                                 // console.log(fifth_page_table);
    //                             }
    //                             // }
    //                             /*
    //                                 [0] : 인터페이스 그래프 상태
    //                                 [1] : 유저 그래프 상태
    //                                 [2] : 유저 그룹 그래프 상태
    //
    //                              */
    //                             // 3개 검사
    //                             /*
    //                                 0 header - 헤더
    //                                 1 first - 인터페이스
    //                                 2 second - 유저
    //                                 3 third - 유저
    //                                 4 fourth - 그룹
    //                                 5 fifth_grp -그룹
    //                             */
    //                             if ($scope.grpState[0].state && $scope.grpState[1].state && $scope.grpState[2].state) {
    //                                 $scope.docConfig = {
    //                                     footer: {
    //                                         columns: [{
    //                                             text: 'Saisei copyright',
    //                                             alignment: 'center'
    //                                         }]
    //                                     },
    //                                     content: [
    //                                         mod_doc_config.header_page,
    //                                         mod_doc_config.first_page,
    //                                         mod_doc_config.second_page,
    //                                         mod_doc_config.third_page,
    //                                         mod_doc_config.fourth_page,
    //                                         mod_doc_config.fifth_page_grp
    //                                         // mod_doc_config.fifth_page_table
    //                                     ],
    //                                     styles: {
    //                                         defaultStyle: {
    //                                             alignment: 'center'
    //                                         },
    //                                         footer: {
    //                                             alignment: 'center',
    //                                             font: 'customFont'
    //                                         }
    //                                     }
    //                                 };
    //                                 if ($scope.grpState[2].state) {
    //                                     _(mod_doc_config.fifth_page_table).each(function (config, i) {
    //                                         $scope.docConfig.content.push(config)
    //                                     });
    //                                 }
    //                             } else {
    //                                 // 2개 검사
    //                                 if ($scope.grpState[0].state && $scope.grpState[1].state) {
    //                                     // delete mod_doc_config.second_page.pageBreak;
    //                                     $scope.docConfig = {
    //                                         footer: {
    //                                             columns: [{
    //                                                 text: 'Saisei copyright',
    //                                                 alignment: 'center'
    //                                             }]
    //                                         },
    //                                         content: [
    //                                             mod_doc_config.header_page,
    //                                             mod_doc_config.first_page,
    //                                             mod_doc_config.second_page,
    //                                             mod_doc_config.third_page
    //                                         ],
    //                                         styles: {
    //                                             defaultStyle: {
    //                                                 alignment: 'center'
    //                                             },
    //                                             footer: {
    //                                                 alignment: 'center',
    //                                                 font: 'customFont'
    //                                             }
    //                                         }
    //                                     };
    //                                 } else if ($scope.grpState[0].state && $scope.grpState[2].state) {
    //                                     delete mod_doc_config.third_page.pageBreak;
    //                                     $scope.docConfig = {
    //                                         footer: {
    //                                             columns: [{
    //                                                 text: 'Saisei copyright',
    //                                                 alignment: 'center'
    //                                             }]
    //                                         },
    //                                         content: [
    //                                             mod_doc_config.header_page,
    //                                             mod_doc_config.first_page,
    //                                             mod_doc_config.fourth_page,
    //                                             mod_doc_config.fifth_page_grp,
    //                                             // mod_doc_config.fifth_page_table
    //                                         ],
    //                                         styles: {
    //                                             defaultStyle: {
    //                                                 alignment: 'center'
    //                                             },
    //                                             footer: {
    //                                                 alignment: 'center',
    //                                                 font: 'customFont'
    //                                             }
    //                                         }
    //                                     };
    //                                     _(mod_doc_config.fifth_page_table).each(function (config, i) {
    //                                         $scope.docConfig.content.push(config)
    //                                     });
    //                                 } else if ($scope.grpState[1].state && $scope.grpState[2].state) {
    //                                     delete mod_doc_config.third_page.pageBreak;
    //                                     $scope.docConfig = {
    //                                         footer: {
    //                                             columns: [{
    //                                                 text: 'Saisei copyright',
    //                                                 alignment: 'center'
    //                                             }]
    //                                         },
    //                                         content: [
    //                                             mod_doc_config.header_page,
    //                                             mod_doc_config.second_page,
    //                                             mod_doc_config.third_page,
    //                                             mod_doc_config.fourth_page,
    //                                             mod_doc_config.fifth_page_grp
    //                                             // mod_doc_config.fifth_page_table
    //                                         ],
    //                                         styles: {
    //                                             defaultStyle: {
    //                                                 alignment: 'center'
    //                                             },
    //                                             footer: {
    //                                                 alignment: 'center',
    //                                                 font: 'customFont'
    //                                             }
    //                                         }
    //                                     };
    //                                     if ($scope.grpState[2].state) {
    //                                         _(mod_doc_config.fifth_page_table).each(function (config, i) {
    //                                             $scope.docConfig.content.push(config)
    //                                         });
    //                                     }
    //                                 } else {
    //                                     // 1개 검사
    //                                     if ($scope.grpState[0].state) {
    //                                         delete mod_doc_config.first_page.pageBreak;
    //                                         $scope.docConfig = {
    //                                             footer: {
    //                                                 columns: [{
    //                                                     text: 'Saisei copyright',
    //                                                     alignment: 'center'
    //                                                 }]
    //                                             },
    //                                             content: [
    //                                                 mod_doc_config.header_page,
    //                                                 mod_doc_config.first_page
    //                                             ],
    //                                             styles: {
    //                                                 defaultStyle: {
    //                                                     alignment: 'center'
    //                                                 },
    //                                                 footer: {
    //                                                     alignment: 'center',
    //                                                     font: 'customFont'
    //                                                 }
    //                                             }
    //                                         };
    //                                     } else if ($scope.grpState[1].state) {
    //                                         $scope.docConfig = {
    //                                             footer: {
    //                                                 columns: [{
    //                                                     text: 'Saisei copyright',
    //                                                     alignment: 'center'
    //                                                 }]
    //                                             },
    //                                             content: [
    //                                                 mod_doc_config.header_page,
    //                                                 mod_doc_config.second_page,
    //                                                 mod_doc_config.third_page
    //                                             ],
    //                                             styles: {
    //                                                 defaultStyle: {
    //                                                     alignment: 'center'
    //                                                 },
    //                                                 footer: {
    //                                                     alignment: 'center',
    //                                                     font: 'customFont'
    //                                                 }
    //                                             }
    //                                         };
    //                                     } else if ($scope.grpState[2].state) {
    //                                         delete mod_doc_config.fourth_page.pageBreak;
    //                                         $scope.docConfig = {
    //                                             footer: {
    //                                                 columns: [{
    //                                                     text: 'Saisei copyright',
    //                                                     alignment: 'center'
    //                                                 }]
    //                                             },
    //                                             content: [
    //                                                 mod_doc_config.header_page,
    //                                                 mod_doc_config.fourth_page,
    //                                                 mod_doc_config.fifth_page_grp
    //                                                 // mod_doc_config.fifth_page_table
    //                                             ],
    //                                             styles: {
    //                                                 defaultStyle: {
    //                                                     alignment: 'center'
    //                                                 },
    //                                                 footer: {
    //                                                     alignment: 'center',
    //                                                     font: 'customFont'
    //                                                 }
    //                                             }
    //                                         };
    //                                         if ($scope.grpState[2].state) {
    //                                             _(mod_doc_config.fifth_page_table).each(function (config, i) {
    //                                                 $scope.docConfig.content.push(config)
    //                                             });
    //                                         }
    //                                     } else {
    //                                         $scope.docConfig = {
    //                                             footer: {
    //                                                 columns: [{
    //                                                     text: 'Saisei copyright',
    //                                                     alignment: 'center'
    //                                                 }]
    //                                             },
    //                                             content: [
    //                                                 mod_doc_config.header_page,
    //                                             ],
    //                                             styles: {
    //                                                 defaultStyle: {
    //                                                     alignment: 'center'
    //                                                 },
    //                                                 footer: {
    //                                                     alignment: 'center',
    //                                                     font: 'customFont'
    //                                                 }
    //                                             }
    //                                         };
    //                                     }
    //                                 }
    //                             }
    //                             console.log("ratio : " + ratio);
    //                             console.log("pdfmake 컨피그: ", $scope.docConfig);
    //                             // if($scope.grpState[2].state) {
    //                             //     _(mod_doc_config.fifth_page_tables).each(function (config, i) {
    //                             //
    //                             //         $scope.docConfig.content.push(config)
    //                             //     });
    //                             // }
    //                             deferred.resolve($scope.docConfig);
    //                         });
    //                     } else if ($scope.grpState[1].state && $scope.grpState[2].state) {
    //                         _promise_canvas_user_user_group().then(function (result) {
    //                             // formular : (original height / original width) x new_width = new_height
    //                             if (duration >= 20) {
    //                                 var ratio = 3;
    //                             } else if (10 < duration && duration < 20) {
    //                                 var ratio = 2.6;
    //                             } else {
    //                                 if (size.second_page.height > 1600 || size.fourth_page.height > 1600 || size.fifth_page.height > 1600) {
    //                                     var second_ratio = 2.6;
    //                                     var fourth_ratio = 2.6;
    //                                     var fifth_ratio = 3;
    //                                     var ratio = 2.6;
    //                                 } else {
    //                                     var second_ratio = 2.6;
    //                                     var fourth_ratio = 2.6;
    //                                     var fifth_ratio = 3;
    //                                     var ratio = 2.6;
    //                                 }
    //                             }
    //                             // margin: [left, top, right, bottom]
    //                             // config for pdf
    //                             console.log("컨피그 설정: ", result);
    //                             var mod_doc_config = {
    //                                 header_page: {
    //                                     image: $scope.header_page,
    //                                     width: Math.ceil(size.header_page.width / ratio),
    //                                     height: Math.ceil((size.header_page.height / size.header_page.width) * Math.ceil(size.header_page.width / ratio)),
    //                                     margin: [0, 0, 0, 0],
    //                                     style: 'defaultStyle'
    //                                 },
    //                                 first_page: {
    //                                     image: $scope.first_page,
    //                                     width: Math.ceil(size.first_page.width / ratio),
    //                                     height: Math.ceil((size.first_page.height / size.first_page.width) * Math.ceil(size.first_page.width / ratio)),
    //                                     margin: [0, 0, 0, 0],
    //                                     style: 'defaultStyle',
    //                                     pageBreak: 'after'
    //                                 },
    //                                 second_page: {
    //                                     image: $scope.second_page,
    //                                     width: Math.ceil(size.second_page.width / second_ratio),
    //                                     height: Math.ceil((size.second_page.height / size.second_page.width) * Math.ceil(size.second_page.width / second_ratio)),
    //                                     margin: [0, 15, 0, 0],
    //                                     style: 'defaultStyle',
    //                                     pageBreak: 'after'
    //                                 },
    //                                 third_page: {
    //                                     image: $scope.third_page,
    //                                     width: Math.ceil(size.third_page.width / ratio),
    //                                     height: Math.ceil((size.third_page.height / size.third_page.width) * Math.ceil(size.third_page.width / ratio)),
    //                                     margin: [0, 15, 0, 0],
    //                                     style: 'defaultStyle',
    //                                     pageBreak: 'after'
    //                                 },
    //                                 fourth_page: {
    //                                     image: $scope.fourth_page,
    //                                     width: Math.ceil(size.fourth_page.width / fourth_ratio),
    //                                     height: Math.ceil((size.fourth_page.height / size.fourth_page.width) * Math.ceil(size.fourth_page.width / fourth_ratio)),
    //                                     margin: [0, 15, 0, 0],
    //                                     style: 'defaultStyle',
    //                                     pageBreak: 'after'
    //                                 },
    //                                 fifth_page_grp: {
    //                                     image: $scope.fifth_page_grp,
    //                                     width: Math.ceil(size.fifth_page_grp.width / ratio),
    //                                     height: Math.ceil((size.fifth_page_grp.height / size.fifth_page_grp.width) * Math.ceil(size.fifth_page_grp.width / ratio)),
    //                                     margin: [0, 15, 0, 0],
    //                                     style: 'defaultStyle',
    //                                     pageBreak: 'after'
    //                                 }
    //                                 // fifth_page_table: {
    //                                 //     image: result[0],
    //                                 //     width: Math.ceil(size.fifth_page_tb_set.width / fifth_ratio),
    //                                 //     height: Math.ceil((size.fifth_page_tb_set.height / size.fifth_page_tb_set.width) * Math.ceil(size.fifth_page_tb_set.width / fifth_ratio)),
    //                                 //     margin: [0, 15, 0, 0],
    //                                 //     style: 'defaultStyle'
    //                                 // }
    //                                 // last_page: {
    //                                 //      image: $scope.last_page,
    //                                 //      width: Math.ceil(size.last_page.width / ratio),
    //                                 //      height: Math.ceil((size.last_page.height / size.last_page.width) * Math.ceil(size.last_page.width / ratio)),
    //                                 //      margin: [0, 15, 0, 0]
    //                                 //  }
    //                             };
    //
    //                             /**
    //                              * Add attributes to each object of an array.
    //                              *
    //                              * @param {array} foo - Array of objects where we will add the attibutes
    //                              * @param {function} iterator
    //                              */
    //                                 // _.each(foo, function(element, index) {
    //                                 //     _.extend(element, {field1: index}, {field2: 'bar', field3: 'baz'});
    //                                 // });
    //                             var fifth_page_table = [];
    //                             // console.log("$scope.fifth_page_tables");
    //                             // console.log($scope.fifth_page_tables);
    //                             // console.log(canvas[2].tables);
    //                             // console.log(canvas);
    //                             if ($scope.grpState[2].state) {
    //                                 _(result).each(function (img, i) {
    //                                     // console.log(img);
    //                                     // if ((i + 1) % 3 === 0) {
    //                                     fifth_page_table.push({
    //                                         image: img,
    //                                         width: Math.ceil(size.fifth_page_tb_set.width / fifth_ratio),
    //                                         height: Math.ceil((size.fifth_page_tb_set.height / size.fifth_page_tb_set.width) * Math.ceil(size.fifth_page_tb_set.width / fifth_ratio)),
    //                                         margin: [0, 15, 0, 0],
    //                                         style: 'defaultStyle',
    //                                         pageBreak: 'after'
    //                                     });
    //                                     // } else {
    //                                     //     fifth_page_tables.push({
    //                                     //         image: img,
    //                                     //         width: Math.ceil(size.fifth_page_tb.width / ratio),
    //                                     //         height: Math.ceil((size.fifth_page_tb.height / size.fifth_page_tb.width) * Math.ceil(size.fifth_page_tb.width / ratio)),
    //                                     //         margin: [0, 15, 0, 0],
    //                                     //         style: 'defaultStyle'
    //                                     //     });
    //                                     // }
    //                                 });
    //                                 _.extend(mod_doc_config, {
    //                                     fifth_page_table: fifth_page_table
    //                                 });
    //                                 console.log(mod_doc_config);
    //                                 // console.log(fifth_page_table);
    //                             }
    //                             // }
    //                             /*
    //                                 [0] : 인터페이스 그래프 상태
    //                                 [1] : 유저 그래프 상태
    //                                 [2] : 유저 그룹 그래프 상태
    //
    //                              */
    //                             // 3개 검사
    //                             /*
    //                                 0 header - 헤더
    //                                 1 first - 인터페이스
    //                                 2 second - 유저
    //                                 3 third - 유저
    //                                 4 fourth - 그룹
    //                                 5 fifth_grp -그룹
    //                             */
    //                             if ($scope.grpState[0].state && $scope.grpState[1].state && $scope.grpState[2].state) {
    //                                 $scope.docConfig = {
    //                                     footer: {
    //                                         columns: [{
    //                                             text: 'Saisei copyright',
    //                                             alignment: 'center'
    //                                         }]
    //                                     },
    //                                     content: [
    //                                         mod_doc_config.header_page,
    //                                         mod_doc_config.first_page,
    //                                         mod_doc_config.second_page,
    //                                         mod_doc_config.third_page,
    //                                         mod_doc_config.fourth_page,
    //                                         mod_doc_config.fifth_page_grp
    //                                         // mod_doc_config.fifth_page_table
    //                                     ],
    //                                     styles: {
    //                                         defaultStyle: {
    //                                             alignment: 'center'
    //                                         },
    //                                         footer: {
    //                                             alignment: 'center',
    //                                             font: 'customFont'
    //                                         }
    //                                     }
    //                                 };
    //                                 if ($scope.grpState[2].state) {
    //                                     _(mod_doc_config.fifth_page_table).each(function (config, i) {
    //                                         $scope.docConfig.content.push(config)
    //                                     });
    //                                 }
    //                             } else {
    //                                 // 2개 검사
    //                                 if ($scope.grpState[0].state && $scope.grpState[1].state) {
    //                                     // delete mod_doc_config.second_page.pageBreak;
    //                                     $scope.docConfig = {
    //                                         footer: {
    //                                             columns: [{
    //                                                 text: 'Saisei copyright',
    //                                                 alignment: 'center'
    //                                             }]
    //                                         },
    //                                         content: [
    //                                             mod_doc_config.header_page,
    //                                             mod_doc_config.first_page,
    //                                             mod_doc_config.second_page,
    //                                             mod_doc_config.third_page
    //                                         ],
    //                                         styles: {
    //                                             defaultStyle: {
    //                                                 alignment: 'center'
    //                                             },
    //                                             footer: {
    //                                                 alignment: 'center',
    //                                                 font: 'customFont'
    //                                             }
    //                                         }
    //                                     };
    //                                 } else if ($scope.grpState[0].state && $scope.grpState[2].state) {
    //                                     delete mod_doc_config.third_page.pageBreak;
    //                                     $scope.docConfig = {
    //                                         footer: {
    //                                             columns: [{
    //                                                 text: 'Saisei copyright',
    //                                                 alignment: 'center'
    //                                             }]
    //                                         },
    //                                         content: [
    //                                             mod_doc_config.header_page,
    //                                             mod_doc_config.first_page,
    //                                             mod_doc_config.fourth_page,
    //                                             mod_doc_config.fifth_page_grp,
    //                                             // mod_doc_config.fifth_page_table
    //                                         ],
    //                                         styles: {
    //                                             defaultStyle: {
    //                                                 alignment: 'center'
    //                                             },
    //                                             footer: {
    //                                                 alignment: 'center',
    //                                                 font: 'customFont'
    //                                             }
    //                                         }
    //                                     };
    //                                     _(mod_doc_config.fifth_page_table).each(function (config, i) {
    //                                         $scope.docConfig.content.push(config)
    //                                     });
    //                                 } else if ($scope.grpState[1].state && $scope.grpState[2].state) {
    //                                     delete mod_doc_config.third_page.pageBreak;
    //                                     $scope.docConfig = {
    //                                         footer: {
    //                                             columns: [{
    //                                                 text: 'Saisei copyright',
    //                                                 alignment: 'center'
    //                                             }]
    //                                         },
    //                                         content: [
    //                                             mod_doc_config.header_page,
    //                                             mod_doc_config.second_page,
    //                                             mod_doc_config.third_page,
    //                                             mod_doc_config.fourth_page,
    //                                             mod_doc_config.fifth_page_grp
    //                                             // mod_doc_config.fifth_page_table
    //                                         ],
    //                                         styles: {
    //                                             defaultStyle: {
    //                                                 alignment: 'center'
    //                                             },
    //                                             footer: {
    //                                                 alignment: 'center',
    //                                                 font: 'customFont'
    //                                             }
    //                                         }
    //                                     };
    //                                     if ($scope.grpState[2].state) {
    //                                         _(mod_doc_config.fifth_page_table).each(function (config, i) {
    //                                             $scope.docConfig.content.push(config)
    //                                         });
    //                                     }
    //                                 } else {
    //                                     // 1개 검사
    //                                     if ($scope.grpState[0].state) {
    //                                         delete mod_doc_config.first_page.pageBreak;
    //                                         $scope.docConfig = {
    //                                             footer: {
    //                                                 columns: [{
    //                                                     text: 'Saisei copyright',
    //                                                     alignment: 'center'
    //                                                 }]
    //                                             },
    //                                             content: [
    //                                                 mod_doc_config.header_page,
    //                                                 mod_doc_config.first_page
    //                                             ],
    //                                             styles: {
    //                                                 defaultStyle: {
    //                                                     alignment: 'center'
    //                                                 },
    //                                                 footer: {
    //                                                     alignment: 'center',
    //                                                     font: 'customFont'
    //                                                 }
    //                                             }
    //                                         };
    //                                     } else if ($scope.grpState[1].state) {
    //                                         $scope.docConfig = {
    //                                             footer: {
    //                                                 columns: [{
    //                                                     text: 'Saisei copyright',
    //                                                     alignment: 'center'
    //                                                 }]
    //                                             },
    //                                             content: [
    //                                                 mod_doc_config.header_page,
    //                                                 mod_doc_config.second_page,
    //                                                 mod_doc_config.third_page
    //                                             ],
    //                                             styles: {
    //                                                 defaultStyle: {
    //                                                     alignment: 'center'
    //                                                 },
    //                                                 footer: {
    //                                                     alignment: 'center',
    //                                                     font: 'customFont'
    //                                                 }
    //                                             }
    //                                         };
    //                                     } else if ($scope.grpState[2].state) {
    //                                         delete mod_doc_config.fourth_page.pageBreak;
    //                                         $scope.docConfig = {
    //                                             footer: {
    //                                                 columns: [{
    //                                                     text: 'Saisei copyright',
    //                                                     alignment: 'center'
    //                                                 }]
    //                                             },
    //                                             content: [
    //                                                 mod_doc_config.header_page,
    //                                                 mod_doc_config.fourth_page,
    //                                                 mod_doc_config.fifth_page_grp
    //                                                 // mod_doc_config.fifth_page_table
    //                                             ],
    //                                             styles: {
    //                                                 defaultStyle: {
    //                                                     alignment: 'center'
    //                                                 },
    //                                                 footer: {
    //                                                     alignment: 'center',
    //                                                     font: 'customFont'
    //                                                 }
    //                                             }
    //                                         };
    //                                         if ($scope.grpState[2].state) {
    //                                             _(mod_doc_config.fifth_page_table).each(function (config, i) {
    //                                                 $scope.docConfig.content.push(config)
    //                                             });
    //                                         }
    //                                     } else {
    //                                         $scope.docConfig = {
    //                                             footer: {
    //                                                 columns: [{
    //                                                     text: 'Saisei copyright',
    //                                                     alignment: 'center'
    //                                                 }]
    //                                             },
    //                                             content: [
    //                                                 mod_doc_config.header_page,
    //                                             ],
    //                                             styles: {
    //                                                 defaultStyle: {
    //                                                     alignment: 'center'
    //                                                 },
    //                                                 footer: {
    //                                                     alignment: 'center',
    //                                                     font: 'customFont'
    //                                                 }
    //                                             }
    //                                         };
    //                                     }
    //                                 }
    //                             }
    //                             console.log("ratio : " + ratio);
    //                             console.log("pdfmake 컨피그: ", $scope.docConfig);
    //                             // if($scope.grpState[2].state) {
    //                             //     _(mod_doc_config.fifth_page_tables).each(function (config, i) {
    //                             //
    //                             //         $scope.docConfig.content.push(config)
    //                             //     });
    //                             // }
    //                             deferred.resolve($scope.docConfig);
    //                         });
    //                     } else {
    //                         // 1개 검사
    //                         if ($scope.grpState[0].state) {
    //                             _promise_canvas_int().then(function (result) {
    //                                 // formular : (original height / original width) x new_width = new_height
    //                                 if (duration >= 20) {
    //                                     var ratio = 3;
    //                                 } else if (10 < duration && duration < 20) {
    //                                     var ratio = 2.6;
    //                                 } else {
    //                                     if (size.second_page.height > 1600 || size.fourth_page.height > 1600 || size.fifth_page.height > 1600) {
    //                                         var second_ratio = 2.6;
    //                                         var fourth_ratio = 2.6;
    //                                         var fifth_ratio = 3;
    //                                         var ratio = 2.6;
    //                                     } else {
    //                                         var second_ratio = 2.6;
    //                                         var fourth_ratio = 2.6;
    //                                         var fifth_ratio = 3;
    //                                         var ratio = 2.6;
    //                                     }
    //                                 }
    //                                 // margin: [left, top, right, bottom]
    //                                 // config for pdf
    //                                 console.log("컨피그 설정: ", result);
    //                                 var mod_doc_config = {
    //                                     header_page: {
    //                                         image: $scope.header_page,
    //                                         width: Math.ceil(size.header_page.width / ratio),
    //                                         height: Math.ceil((size.header_page.height / size.header_page.width) * Math.ceil(size.header_page.width / ratio)),
    //                                         margin: [0, 0, 0, 0],
    //                                         style: 'defaultStyle'
    //                                     },
    //                                     first_page: {
    //                                         image: $scope.first_page,
    //                                         width: Math.ceil(size.first_page.width / ratio),
    //                                         height: Math.ceil((size.first_page.height / size.first_page.width) * Math.ceil(size.first_page.width / ratio)),
    //                                         margin: [0, 0, 0, 0],
    //                                         style: 'defaultStyle',
    //                                         pageBreak: 'after'
    //                                     },
    //                                     second_page: {
    //                                         image: $scope.second_page,
    //                                         width: Math.ceil(size.second_page.width / second_ratio),
    //                                         height: Math.ceil((size.second_page.height / size.second_page.width) * Math.ceil(size.second_page.width / second_ratio)),
    //                                         margin: [0, 15, 0, 0],
    //                                         style: 'defaultStyle',
    //                                         pageBreak: 'after'
    //                                     },
    //                                     third_page: {
    //                                         image: $scope.third_page,
    //                                         width: Math.ceil(size.third_page.width / ratio),
    //                                         height: Math.ceil((size.third_page.height / size.third_page.width) * Math.ceil(size.third_page.width / ratio)),
    //                                         margin: [0, 15, 0, 0],
    //                                         style: 'defaultStyle',
    //                                         pageBreak: 'after'
    //                                     },
    //                                     fourth_page: {
    //                                         image: $scope.fourth_page,
    //                                         width: Math.ceil(size.fourth_page.width / fourth_ratio),
    //                                         height: Math.ceil((size.fourth_page.height / size.fourth_page.width) * Math.ceil(size.fourth_page.width / fourth_ratio)),
    //                                         margin: [0, 15, 0, 0],
    //                                         style: 'defaultStyle',
    //                                         pageBreak: 'after'
    //                                     },
    //                                     fifth_page_grp: {
    //                                         image: $scope.fifth_page_grp,
    //                                         width: Math.ceil(size.fifth_page_grp.width / ratio),
    //                                         height: Math.ceil((size.fifth_page_grp.height / size.fifth_page_grp.width) * Math.ceil(size.fifth_page_grp.width / ratio)),
    //                                         margin: [0, 15, 0, 0],
    //                                         style: 'defaultStyle',
    //                                         pageBreak: 'after'
    //                                     }
    //                                     // fifth_page_table: {
    //                                     //     image: result[0],
    //                                     //     width: Math.ceil(size.fifth_page_tb_set.width / fifth_ratio),
    //                                     //     height: Math.ceil((size.fifth_page_tb_set.height / size.fifth_page_tb_set.width) * Math.ceil(size.fifth_page_tb_set.width / fifth_ratio)),
    //                                     //     margin: [0, 15, 0, 0],
    //                                     //     style: 'defaultStyle'
    //                                     // }
    //                                     // last_page: {
    //                                     //      image: $scope.last_page,
    //                                     //      width: Math.ceil(size.last_page.width / ratio),
    //                                     //      height: Math.ceil((size.last_page.height / size.last_page.width) * Math.ceil(size.last_page.width / ratio)),
    //                                     //      margin: [0, 15, 0, 0]
    //                                     //  }
    //                                 };
    //
    //                                 /**
    //                                  * Add attributes to each object of an array.
    //                                  *
    //                                  * @param {array} foo - Array of objects where we will add the attibutes
    //                                  * @param {function} iterator
    //                                  */
    //                                     // _.each(foo, function(element, index) {
    //                                     //     _.extend(element, {field1: index}, {field2: 'bar', field3: 'baz'});
    //                                     // });
    //                                 var fifth_page_table = [];
    //                                 // console.log("$scope.fifth_page_tables");
    //                                 // console.log($scope.fifth_page_tables);
    //                                 // console.log(canvas[2].tables);
    //                                 // console.log(canvas);
    //                                 if ($scope.grpState[2].state) {
    //                                     _(result).each(function (img, i) {
    //                                         // console.log(img);
    //                                         // if ((i + 1) % 3 === 0) {
    //                                         fifth_page_table.push({
    //                                             image: img,
    //                                             width: Math.ceil(size.fifth_page_tb_set.width / fifth_ratio),
    //                                             height: Math.ceil((size.fifth_page_tb_set.height / size.fifth_page_tb_set.width) * Math.ceil(size.fifth_page_tb_set.width / fifth_ratio)),
    //                                             margin: [0, 15, 0, 0],
    //                                             style: 'defaultStyle',
    //                                             pageBreak: 'after'
    //                                         });
    //                                         // } else {
    //                                         //     fifth_page_tables.push({
    //                                         //         image: img,
    //                                         //         width: Math.ceil(size.fifth_page_tb.width / ratio),
    //                                         //         height: Math.ceil((size.fifth_page_tb.height / size.fifth_page_tb.width) * Math.ceil(size.fifth_page_tb.width / ratio)),
    //                                         //         margin: [0, 15, 0, 0],
    //                                         //         style: 'defaultStyle'
    //                                         //     });
    //                                         // }
    //                                     });
    //                                     _.extend(mod_doc_config, {
    //                                         fifth_page_table: fifth_page_table
    //                                     });
    //                                     console.log(mod_doc_config);
    //                                     // console.log(fifth_page_table);
    //                                 }
    //                                 // }
    //                                 /*
    //                                     [0] : 인터페이스 그래프 상태
    //                                     [1] : 유저 그래프 상태
    //                                     [2] : 유저 그룹 그래프 상태
    //
    //                                  */
    //                                 // 3개 검사
    //                                 /*
    //                                     0 header - 헤더
    //                                     1 first - 인터페이스
    //                                     2 second - 유저
    //                                     3 third - 유저
    //                                     4 fourth - 그룹
    //                                     5 fifth_grp -그룹
    //                                 */
    //                                 if ($scope.grpState[0].state && $scope.grpState[1].state && $scope.grpState[2].state) {
    //                                     $scope.docConfig = {
    //                                         footer: {
    //                                             columns: [{
    //                                                 text: 'Saisei copyright',
    //                                                 alignment: 'center'
    //                                             }]
    //                                         },
    //                                         content: [
    //                                             mod_doc_config.header_page,
    //                                             mod_doc_config.first_page,
    //                                             mod_doc_config.second_page,
    //                                             mod_doc_config.third_page,
    //                                             mod_doc_config.fourth_page,
    //                                             mod_doc_config.fifth_page_grp
    //                                             // mod_doc_config.fifth_page_table
    //                                         ],
    //                                         styles: {
    //                                             defaultStyle: {
    //                                                 alignment: 'center'
    //                                             },
    //                                             footer: {
    //                                                 alignment: 'center',
    //                                                 font: 'customFont'
    //                                             }
    //                                         }
    //                                     };
    //                                     if ($scope.grpState[2].state) {
    //                                         _(mod_doc_config.fifth_page_table).each(function (config, i) {
    //                                             $scope.docConfig.content.push(config)
    //                                         });
    //                                     }
    //                                 } else {
    //                                     // 2개 검사
    //                                     if ($scope.grpState[0].state && $scope.grpState[1].state) {
    //                                         // delete mod_doc_config.second_page.pageBreak;
    //                                         $scope.docConfig = {
    //                                             footer: {
    //                                                 columns: [{
    //                                                     text: 'Saisei copyright',
    //                                                     alignment: 'center'
    //                                                 }]
    //                                             },
    //                                             content: [
    //                                                 mod_doc_config.header_page,
    //                                                 mod_doc_config.first_page,
    //                                                 mod_doc_config.second_page,
    //                                                 mod_doc_config.third_page
    //                                             ],
    //                                             styles: {
    //                                                 defaultStyle: {
    //                                                     alignment: 'center'
    //                                                 },
    //                                                 footer: {
    //                                                     alignment: 'center',
    //                                                     font: 'customFont'
    //                                                 }
    //                                             }
    //                                         };
    //                                     } else if ($scope.grpState[0].state && $scope.grpState[2].state) {
    //                                         delete mod_doc_config.third_page.pageBreak;
    //                                         $scope.docConfig = {
    //                                             footer: {
    //                                                 columns: [{
    //                                                     text: 'Saisei copyright',
    //                                                     alignment: 'center'
    //                                                 }]
    //                                             },
    //                                             content: [
    //                                                 mod_doc_config.header_page,
    //                                                 mod_doc_config.first_page,
    //                                                 mod_doc_config.fourth_page,
    //                                                 mod_doc_config.fifth_page_grp,
    //                                                 // mod_doc_config.fifth_page_table
    //                                             ],
    //                                             styles: {
    //                                                 defaultStyle: {
    //                                                     alignment: 'center'
    //                                                 },
    //                                                 footer: {
    //                                                     alignment: 'center',
    //                                                     font: 'customFont'
    //                                                 }
    //                                             }
    //                                         };
    //                                         _(mod_doc_config.fifth_page_table).each(function (config, i) {
    //                                             $scope.docConfig.content.push(config)
    //                                         });
    //                                     } else if ($scope.grpState[1].state && $scope.grpState[2].state) {
    //                                         delete mod_doc_config.third_page.pageBreak;
    //                                         $scope.docConfig = {
    //                                             footer: {
    //                                                 columns: [{
    //                                                     text: 'Saisei copyright',
    //                                                     alignment: 'center'
    //                                                 }]
    //                                             },
    //                                             content: [
    //                                                 mod_doc_config.header_page,
    //                                                 mod_doc_config.second_page,
    //                                                 mod_doc_config.third_page,
    //                                                 mod_doc_config.fourth_page,
    //                                                 mod_doc_config.fifth_page_grp
    //                                                 // mod_doc_config.fifth_page_table
    //                                             ],
    //                                             styles: {
    //                                                 defaultStyle: {
    //                                                     alignment: 'center'
    //                                                 },
    //                                                 footer: {
    //                                                     alignment: 'center',
    //                                                     font: 'customFont'
    //                                                 }
    //                                             }
    //                                         };
    //                                         if ($scope.grpState[2].state) {
    //                                             _(mod_doc_config.fifth_page_table).each(function (config, i) {
    //                                                 $scope.docConfig.content.push(config)
    //                                             });
    //                                         }
    //                                     } else {
    //                                         // 1개 검사
    //                                         if ($scope.grpState[0].state) {
    //                                             delete mod_doc_config.first_page.pageBreak;
    //                                             $scope.docConfig = {
    //                                                 footer: {
    //                                                     columns: [{
    //                                                         text: 'Saisei copyright',
    //                                                         alignment: 'center'
    //                                                     }]
    //                                                 },
    //                                                 content: [
    //                                                     mod_doc_config.header_page,
    //                                                     mod_doc_config.first_page
    //                                                 ],
    //                                                 styles: {
    //                                                     defaultStyle: {
    //                                                         alignment: 'center'
    //                                                     },
    //                                                     footer: {
    //                                                         alignment: 'center',
    //                                                         font: 'customFont'
    //                                                     }
    //                                                 }
    //                                             };
    //                                         } else if ($scope.grpState[1].state) {
    //                                             $scope.docConfig = {
    //                                                 footer: {
    //                                                     columns: [{
    //                                                         text: 'Saisei copyright',
    //                                                         alignment: 'center'
    //                                                     }]
    //                                                 },
    //                                                 content: [
    //                                                     mod_doc_config.header_page,
    //                                                     mod_doc_config.second_page,
    //                                                     mod_doc_config.third_page
    //                                                 ],
    //                                                 styles: {
    //                                                     defaultStyle: {
    //                                                         alignment: 'center'
    //                                                     },
    //                                                     footer: {
    //                                                         alignment: 'center',
    //                                                         font: 'customFont'
    //                                                     }
    //                                                 }
    //                                             };
    //                                         } else if ($scope.grpState[2].state) {
    //                                             delete mod_doc_config.fourth_page.pageBreak;
    //                                             $scope.docConfig = {
    //                                                 footer: {
    //                                                     columns: [{
    //                                                         text: 'Saisei copyright',
    //                                                         alignment: 'center'
    //                                                     }]
    //                                                 },
    //                                                 content: [
    //                                                     mod_doc_config.header_page,
    //                                                     mod_doc_config.fourth_page,
    //                                                     mod_doc_config.fifth_page_grp
    //                                                     // mod_doc_config.fifth_page_table
    //                                                 ],
    //                                                 styles: {
    //                                                     defaultStyle: {
    //                                                         alignment: 'center'
    //                                                     },
    //                                                     footer: {
    //                                                         alignment: 'center',
    //                                                         font: 'customFont'
    //                                                     }
    //                                                 }
    //                                             };
    //                                             if ($scope.grpState[2].state) {
    //                                                 _(mod_doc_config.fifth_page_table).each(function (config, i) {
    //                                                     $scope.docConfig.content.push(config)
    //                                                 });
    //                                             }
    //                                         } else {
    //                                             $scope.docConfig = {
    //                                                 footer: {
    //                                                     columns: [{
    //                                                         text: 'Saisei copyright',
    //                                                         alignment: 'center'
    //                                                     }]
    //                                                 },
    //                                                 content: [
    //                                                     mod_doc_config.header_page,
    //                                                 ],
    //                                                 styles: {
    //                                                     defaultStyle: {
    //                                                         alignment: 'center'
    //                                                     },
    //                                                     footer: {
    //                                                         alignment: 'center',
    //                                                         font: 'customFont'
    //                                                     }
    //                                                 }
    //                                             };
    //                                         }
    //                                     }
    //                                 }
    //                                 console.log("ratio : " + ratio);
    //                                 console.log("pdfmake 컨피그: ", $scope.docConfig);
    //                                 // if($scope.grpState[2].state) {
    //                                 //     _(mod_doc_config.fifth_page_tables).each(function (config, i) {
    //                                 //
    //                                 //         $scope.docConfig.content.push(config)
    //                                 //     });
    //                                 // }
    //                                 deferred.resolve($scope.docConfig);
    //                             });
    //                         } else if ($scope.grpState[1].state) {
    //                             _promise_canvas_user().then(function (result) {
    //                                 // head_width : 1140 : head_height : 254.733
    //                                 // first_width : 1140 : first_height : 1709.6  // 30일의 경우
    //                                 // sec_width : 1140 : sec_height : 1632.27 // 그래프 2개 시
    //                                 // third_width : 1140 : third_height : 717.6
    //                                 // formular : (original height / original width) x new_width = new_height
    //                                 if (duration >= 20) {
    //                                     var ratio = 3;
    //                                 } else if (10 < duration && duration < 20) {
    //                                     var ratio = 2.6;
    //                                 } else {
    //                                     if (size.second_page.height > 1600 || size.fourth_page.height > 1600 || size.fifth_page.height > 1600) {
    //                                         var second_ratio = 2.6;
    //                                         var fourth_ratio = 2.6;
    //                                         var fifth_ratio = 3;
    //                                         var ratio = 2.6;
    //                                     } else {
    //                                         var second_ratio = 2.6;
    //                                         var fourth_ratio = 2.6;
    //                                         var fifth_ratio = 3;
    //                                         var ratio = 2.6;
    //                                     }
    //                                 }
    //                                 // margin: [left, top, right, bottom]
    //                                 // config for pdf
    //                                 console.log("컨피그 설정: ", result);
    //                                 var mod_doc_config = {
    //                                     header_page: {
    //                                         image: $scope.header_page,
    //                                         width: Math.ceil(size.header_page.width / ratio),
    //                                         height: Math.ceil((size.header_page.height / size.header_page.width) * Math.ceil(size.header_page.width / ratio)),
    //                                         margin: [0, 0, 0, 0],
    //                                         style: 'defaultStyle'
    //                                     },
    //                                     first_page: {
    //                                         image: $scope.first_page,
    //                                         width: Math.ceil(size.first_page.width / ratio),
    //                                         height: Math.ceil((size.first_page.height / size.first_page.width) * Math.ceil(size.first_page.width / ratio)),
    //                                         margin: [0, 0, 0, 0],
    //                                         style: 'defaultStyle',
    //                                         pageBreak: 'after'
    //                                     },
    //                                     second_page: {
    //                                         image: $scope.second_page,
    //                                         width: Math.ceil(size.second_page.width / second_ratio),
    //                                         height: Math.ceil((size.second_page.height / size.second_page.width) * Math.ceil(size.second_page.width / second_ratio)),
    //                                         margin: [0, 15, 0, 0],
    //                                         style: 'defaultStyle',
    //                                         pageBreak: 'after'
    //                                     },
    //                                     third_page: {
    //                                         image: $scope.third_page,
    //                                         width: Math.ceil(size.third_page.width / ratio),
    //                                         height: Math.ceil((size.third_page.height / size.third_page.width) * Math.ceil(size.third_page.width / ratio)),
    //                                         margin: [0, 15, 0, 0],
    //                                         style: 'defaultStyle',
    //                                         pageBreak: 'after'
    //                                     },
    //                                     fourth_page: {
    //                                         image: $scope.fourth_page,
    //                                         width: Math.ceil(size.fourth_page.width / fourth_ratio),
    //                                         height: Math.ceil((size.fourth_page.height / size.fourth_page.width) * Math.ceil(size.fourth_page.width / fourth_ratio)),
    //                                         margin: [0, 15, 0, 0],
    //                                         style: 'defaultStyle',
    //                                         pageBreak: 'after'
    //                                     },
    //                                     fifth_page_grp: {
    //                                         image: $scope.fifth_page_grp,
    //                                         width: Math.ceil(size.fifth_page_grp.width / ratio),
    //                                         height: Math.ceil((size.fifth_page_grp.height / size.fifth_page_grp.width) * Math.ceil(size.fifth_page_grp.width / ratio)),
    //                                         margin: [0, 15, 0, 0],
    //                                         style: 'defaultStyle',
    //                                         pageBreak: 'after'
    //                                     }
    //                                     // fifth_page_table: {
    //                                     //     image: result[0],
    //                                     //     width: Math.ceil(size.fifth_page_tb_set.width / fifth_ratio),
    //                                     //     height: Math.ceil((size.fifth_page_tb_set.height / size.fifth_page_tb_set.width) * Math.ceil(size.fifth_page_tb_set.width / fifth_ratio)),
    //                                     //     margin: [0, 15, 0, 0],
    //                                     //     style: 'defaultStyle'
    //                                     // }
    //                                     // last_page: {
    //                                     //      image: $scope.last_page,
    //                                     //      width: Math.ceil(size.last_page.width / ratio),
    //                                     //      height: Math.ceil((size.last_page.height / size.last_page.width) * Math.ceil(size.last_page.width / ratio)),
    //                                     //      margin: [0, 15, 0, 0]
    //                                     //  }
    //                                 };
    //
    //                                 /**
    //                                  * Add attributes to each object of an array.
    //                                  *
    //                                  * @param {array} foo - Array of objects where we will add the attibutes
    //                                  * @param {function} iterator
    //                                  */
    //                                     // _.each(foo, function(element, index) {
    //                                     //     _.extend(element, {field1: index}, {field2: 'bar', field3: 'baz'});
    //                                     // });
    //                                 var fifth_page_table = [];
    //                                 // console.log("$scope.fifth_page_tables");
    //                                 // console.log($scope.fifth_page_tables);
    //                                 // console.log(canvas[2].tables);
    //                                 // console.log(canvas);
    //                                 if ($scope.grpState[2].state) {
    //                                     _(result).each(function (img, i) {
    //                                         // console.log(img);
    //                                         // if ((i + 1) % 3 === 0) {
    //                                         fifth_page_table.push({
    //                                             image: img,
    //                                             width: Math.ceil(size.fifth_page_tb_set.width / fifth_ratio),
    //                                             height: Math.ceil((size.fifth_page_tb_set.height / size.fifth_page_tb_set.width) * Math.ceil(size.fifth_page_tb_set.width / fifth_ratio)),
    //                                             margin: [0, 15, 0, 0],
    //                                             style: 'defaultStyle',
    //                                             pageBreak: 'after'
    //                                         });
    //                                         // } else {
    //                                         //     fifth_page_tables.push({
    //                                         //         image: img,
    //                                         //         width: Math.ceil(size.fifth_page_tb.width / ratio),
    //                                         //         height: Math.ceil((size.fifth_page_tb.height / size.fifth_page_tb.width) * Math.ceil(size.fifth_page_tb.width / ratio)),
    //                                         //         margin: [0, 15, 0, 0],
    //                                         //         style: 'defaultStyle'
    //                                         //     });
    //                                         // }
    //                                     });
    //                                     _.extend(mod_doc_config, {
    //                                         fifth_page_table: fifth_page_table
    //                                     });
    //                                     console.log(mod_doc_config);
    //                                     // console.log(fifth_page_table);
    //                                 }
    //                                 // }
    //                                 /*
    //                                     [0] : 인터페이스 그래프 상태
    //                                     [1] : 유저 그래프 상태
    //                                     [2] : 유저 그룹 그래프 상태
    //
    //                                  */
    //                                 // 3개 검사
    //                                 /*
    //                                     0 header - 헤더
    //                                     1 first - 인터페이스
    //                                     2 second - 유저
    //                                     3 third - 유저
    //                                     4 fourth - 그룹
    //                                     5 fifth_grp -그룹
    //                                 */
    //                                 if ($scope.grpState[0].state && $scope.grpState[1].state && $scope.grpState[2].state) {
    //                                     $scope.docConfig = {
    //                                         footer: {
    //                                             columns: [{
    //                                                 text: 'Saisei copyright',
    //                                                 alignment: 'center'
    //                                             }]
    //                                         },
    //                                         content: [
    //                                             mod_doc_config.header_page,
    //                                             mod_doc_config.first_page,
    //                                             mod_doc_config.second_page,
    //                                             mod_doc_config.third_page,
    //                                             mod_doc_config.fourth_page,
    //                                             mod_doc_config.fifth_page_grp
    //                                             // mod_doc_config.fifth_page_table
    //                                         ],
    //                                         styles: {
    //                                             defaultStyle: {
    //                                                 alignment: 'center'
    //                                             },
    //                                             footer: {
    //                                                 alignment: 'center',
    //                                                 font: 'customFont'
    //                                             }
    //                                         }
    //                                     };
    //                                     if ($scope.grpState[2].state) {
    //                                         _(mod_doc_config.fifth_page_table).each(function (config, i) {
    //                                             $scope.docConfig.content.push(config)
    //                                         });
    //                                     }
    //                                 } else {
    //                                     // 2개 검사
    //                                     if ($scope.grpState[0].state && $scope.grpState[1].state) {
    //                                         // delete mod_doc_config.second_page.pageBreak;
    //                                         $scope.docConfig = {
    //                                             footer: {
    //                                                 columns: [{
    //                                                     text: 'Saisei copyright',
    //                                                     alignment: 'center'
    //                                                 }]
    //                                             },
    //                                             content: [
    //                                                 mod_doc_config.header_page,
    //                                                 mod_doc_config.first_page,
    //                                                 mod_doc_config.second_page,
    //                                                 mod_doc_config.third_page
    //                                             ],
    //                                             styles: {
    //                                                 defaultStyle: {
    //                                                     alignment: 'center'
    //                                                 },
    //                                                 footer: {
    //                                                     alignment: 'center',
    //                                                     font: 'customFont'
    //                                                 }
    //                                             }
    //                                         };
    //                                     } else if ($scope.grpState[0].state && $scope.grpState[2].state) {
    //                                         delete mod_doc_config.third_page.pageBreak;
    //                                         $scope.docConfig = {
    //                                             footer: {
    //                                                 columns: [{
    //                                                     text: 'Saisei copyright',
    //                                                     alignment: 'center'
    //                                                 }]
    //                                             },
    //                                             content: [
    //                                                 mod_doc_config.header_page,
    //                                                 mod_doc_config.first_page,
    //                                                 mod_doc_config.fourth_page,
    //                                                 mod_doc_config.fifth_page_grp,
    //                                                 // mod_doc_config.fifth_page_table
    //                                             ],
    //                                             styles: {
    //                                                 defaultStyle: {
    //                                                     alignment: 'center'
    //                                                 },
    //                                                 footer: {
    //                                                     alignment: 'center',
    //                                                     font: 'customFont'
    //                                                 }
    //                                             }
    //                                         };
    //                                         _(mod_doc_config.fifth_page_table).each(function (config, i) {
    //                                             $scope.docConfig.content.push(config)
    //                                         });
    //                                     } else if ($scope.grpState[1].state && $scope.grpState[2].state) {
    //                                         delete mod_doc_config.third_page.pageBreak;
    //                                         $scope.docConfig = {
    //                                             footer: {
    //                                                 columns: [{
    //                                                     text: 'Saisei copyright',
    //                                                     alignment: 'center'
    //                                                 }]
    //                                             },
    //                                             content: [
    //                                                 mod_doc_config.header_page,
    //                                                 mod_doc_config.second_page,
    //                                                 mod_doc_config.third_page,
    //                                                 mod_doc_config.fourth_page,
    //                                                 mod_doc_config.fifth_page_grp
    //                                                 // mod_doc_config.fifth_page_table
    //                                             ],
    //                                             styles: {
    //                                                 defaultStyle: {
    //                                                     alignment: 'center'
    //                                                 },
    //                                                 footer: {
    //                                                     alignment: 'center',
    //                                                     font: 'customFont'
    //                                                 }
    //                                             }
    //                                         };
    //                                         if ($scope.grpState[2].state) {
    //                                             _(mod_doc_config.fifth_page_table).each(function (config, i) {
    //                                                 $scope.docConfig.content.push(config)
    //                                             });
    //                                         }
    //                                     } else {
    //                                         // 1개 검사
    //                                         if ($scope.grpState[0].state) {
    //                                             delete mod_doc_config.first_page.pageBreak;
    //                                             $scope.docConfig = {
    //                                                 footer: {
    //                                                     columns: [{
    //                                                         text: 'Saisei copyright',
    //                                                         alignment: 'center'
    //                                                     }]
    //                                                 },
    //                                                 content: [
    //                                                     mod_doc_config.header_page,
    //                                                     mod_doc_config.first_page
    //                                                 ],
    //                                                 styles: {
    //                                                     defaultStyle: {
    //                                                         alignment: 'center'
    //                                                     },
    //                                                     footer: {
    //                                                         alignment: 'center',
    //                                                         font: 'customFont'
    //                                                     }
    //                                                 }
    //                                             };
    //                                         } else if ($scope.grpState[1].state) {
    //                                             $scope.docConfig = {
    //                                                 footer: {
    //                                                     columns: [{
    //                                                         text: 'Saisei copyright',
    //                                                         alignment: 'center'
    //                                                     }]
    //                                                 },
    //                                                 content: [
    //                                                     mod_doc_config.header_page,
    //                                                     mod_doc_config.second_page,
    //                                                     mod_doc_config.third_page
    //                                                 ],
    //                                                 styles: {
    //                                                     defaultStyle: {
    //                                                         alignment: 'center'
    //                                                     },
    //                                                     footer: {
    //                                                         alignment: 'center',
    //                                                         font: 'customFont'
    //                                                     }
    //                                                 }
    //                                             };
    //                                         } else if ($scope.grpState[2].state) {
    //                                             delete mod_doc_config.fourth_page.pageBreak;
    //                                             $scope.docConfig = {
    //                                                 footer: {
    //                                                     columns: [{
    //                                                         text: 'Saisei copyright',
    //                                                         alignment: 'center'
    //                                                     }]
    //                                                 },
    //                                                 content: [
    //                                                     mod_doc_config.header_page,
    //                                                     mod_doc_config.fourth_page,
    //                                                     mod_doc_config.fifth_page_grp
    //                                                     // mod_doc_config.fifth_page_table
    //                                                 ],
    //                                                 styles: {
    //                                                     defaultStyle: {
    //                                                         alignment: 'center'
    //                                                     },
    //                                                     footer: {
    //                                                         alignment: 'center',
    //                                                         font: 'customFont'
    //                                                     }
    //                                                 }
    //                                             };
    //                                             if ($scope.grpState[2].state) {
    //                                                 _(mod_doc_config.fifth_page_table).each(function (config, i) {
    //                                                     $scope.docConfig.content.push(config)
    //                                                 });
    //                                             }
    //                                         } else {
    //                                             $scope.docConfig = {
    //                                                 footer: {
    //                                                     columns: [{
    //                                                         text: 'Saisei copyright',
    //                                                         alignment: 'center'
    //                                                     }]
    //                                                 },
    //                                                 content: [
    //                                                     mod_doc_config.header_page,
    //                                                 ],
    //                                                 styles: {
    //                                                     defaultStyle: {
    //                                                         alignment: 'center'
    //                                                     },
    //                                                     footer: {
    //                                                         alignment: 'center',
    //                                                         font: 'customFont'
    //                                                     }
    //                                                 }
    //                                             };
    //                                         }
    //                                     }
    //                                 }
    //                                 console.log("ratio : " + ratio);
    //                                 console.log("pdfmake 컨피그: ", $scope.docConfig);
    //                                 // if($scope.grpState[2].state) {
    //                                 //     _(mod_doc_config.fifth_page_tables).each(function (config, i) {
    //                                 //
    //                                 //         $scope.docConfig.content.push(config)
    //                                 //     });
    //                                 // }
    //                                 deferred.resolve($scope.docConfig);
    //                             });
    //                         } else if ($scope.grpState[2].state) {
    //                             _promise_canvas_user_group().then(function (result) {
    //                                 // formular : (original height / original width) x new_width = new_height
    //                                 if (duration >= 20) {
    //                                     var ratio = 3;
    //                                 } else if (10 < duration && duration < 20) {
    //                                     var ratio = 2.6;
    //                                 } else {
    //                                     if (size.second_page.height > 1600 || size.fourth_page.height > 1600 || size.fifth_page.height > 1600) {
    //                                         var second_ratio = 2.6;
    //                                         var fourth_ratio = 2.6;
    //                                         var fifth_ratio = 3;
    //                                         var ratio = 2.6;
    //                                     } else {
    //                                         var second_ratio = 2.6;
    //                                         var fourth_ratio = 2.6;
    //                                         var fifth_ratio = 3;
    //                                         var ratio = 2.6;
    //                                     }
    //                                 }
    //                                 // margin: [left, top, right, bottom]
    //                                 // config for pdf
    //                                 console.log("컨피그 설정: ", result);
    //                                 var mod_doc_config = {
    //                                     header_page: {
    //                                         image: $scope.header_page,
    //                                         width: Math.ceil(size.header_page.width / ratio),
    //                                         height: Math.ceil((size.header_page.height / size.header_page.width) * Math.ceil(size.header_page.width / ratio)),
    //                                         margin: [0, 0, 0, 0],
    //                                         style: 'defaultStyle'
    //                                     },
    //                                     first_page: {
    //                                         image: $scope.first_page,
    //                                         width: Math.ceil(size.first_page.width / ratio),
    //                                         height: Math.ceil((size.first_page.height / size.first_page.width) * Math.ceil(size.first_page.width / ratio)),
    //                                         margin: [0, 0, 0, 0],
    //                                         style: 'defaultStyle',
    //                                         pageBreak: 'after'
    //                                     },
    //                                     second_page: {
    //                                         image: $scope.second_page,
    //                                         width: Math.ceil(size.second_page.width / second_ratio),
    //                                         height: Math.ceil((size.second_page.height / size.second_page.width) * Math.ceil(size.second_page.width / second_ratio)),
    //                                         margin: [0, 15, 0, 0],
    //                                         style: 'defaultStyle',
    //                                         pageBreak: 'after'
    //                                     },
    //                                     third_page: {
    //                                         image: $scope.third_page,
    //                                         width: Math.ceil(size.third_page.width / ratio),
    //                                         height: Math.ceil((size.third_page.height / size.third_page.width) * Math.ceil(size.third_page.width / ratio)),
    //                                         margin: [0, 15, 0, 0],
    //                                         style: 'defaultStyle',
    //                                         pageBreak: 'after'
    //                                     },
    //                                     fourth_page: {
    //                                         image: $scope.fourth_page,
    //                                         width: Math.ceil(size.fourth_page.width / fourth_ratio),
    //                                         height: Math.ceil((size.fourth_page.height / size.fourth_page.width) * Math.ceil(size.fourth_page.width / fourth_ratio)),
    //                                         margin: [0, 15, 0, 0],
    //                                         style: 'defaultStyle',
    //                                         pageBreak: 'after'
    //                                     },
    //                                     fifth_page_grp: {
    //                                         image: $scope.fifth_page_grp,
    //                                         width: Math.ceil(size.fifth_page_grp.width / ratio),
    //                                         height: Math.ceil((size.fifth_page_grp.height / size.fifth_page_grp.width) * Math.ceil(size.fifth_page_grp.width / ratio)),
    //                                         margin: [0, 15, 0, 0],
    //                                         style: 'defaultStyle',
    //                                         pageBreak: 'after'
    //                                     }
    //                                     // fifth_page_table: {
    //                                     //     image: result[0],
    //                                     //     width: Math.ceil(size.fifth_page_tb_set.width / fifth_ratio),
    //                                     //     height: Math.ceil((size.fifth_page_tb_set.height / size.fifth_page_tb_set.width) * Math.ceil(size.fifth_page_tb_set.width / fifth_ratio)),
    //                                     //     margin: [0, 15, 0, 0],
    //                                     //     style: 'defaultStyle'
    //                                     // }
    //                                     // last_page: {
    //                                     //      image: $scope.last_page,
    //                                     //      width: Math.ceil(size.last_page.width / ratio),
    //                                     //      height: Math.ceil((size.last_page.height / size.last_page.width) * Math.ceil(size.last_page.width / ratio)),
    //                                     //      margin: [0, 15, 0, 0]
    //                                     //  }
    //                                 };
    //
    //                                 /**
    //                                  * Add attributes to each object of an array.
    //                                  *
    //                                  * @param {array} foo - Array of objects where we will add the attibutes
    //                                  * @param {function} iterator
    //                                  */
    //                                     // _.each(foo, function(element, index) {
    //                                     //     _.extend(element, {field1: index}, {field2: 'bar', field3: 'baz'});
    //                                     // });
    //                                 var fifth_page_table = [];
    //                                 // console.log("$scope.fifth_page_tables");
    //                                 // console.log($scope.fifth_page_tables);
    //                                 // console.log(canvas[2].tables);
    //                                 // console.log(canvas);
    //                                 if ($scope.grpState[2].state) {
    //                                     _(result).each(function (img, i) {
    //                                         // console.log(img);
    //                                         // if ((i + 1) % 3 === 0) {
    //                                         fifth_page_table.push({
    //                                             image: img,
    //                                             width: Math.ceil(size.fifth_page_tb_set.width / fifth_ratio),
    //                                             height: Math.ceil((size.fifth_page_tb_set.height / size.fifth_page_tb_set.width) * Math.ceil(size.fifth_page_tb_set.width / fifth_ratio)),
    //                                             margin: [0, 15, 0, 0],
    //                                             style: 'defaultStyle',
    //                                             pageBreak: 'after'
    //                                         });
    //                                         // } else {
    //                                         //     fifth_page_tables.push({
    //                                         //         image: img,
    //                                         //         width: Math.ceil(size.fifth_page_tb.width / ratio),
    //                                         //         height: Math.ceil((size.fifth_page_tb.height / size.fifth_page_tb.width) * Math.ceil(size.fifth_page_tb.width / ratio)),
    //                                         //         margin: [0, 15, 0, 0],
    //                                         //         style: 'defaultStyle'
    //                                         //     });
    //                                         // }
    //                                     });
    //                                     _.extend(mod_doc_config, {
    //                                         fifth_page_table: fifth_page_table
    //                                     });
    //                                     console.log(mod_doc_config);
    //                                     // console.log(fifth_page_table);
    //                                 }
    //                                 // }
    //                                 /*
    //                                     [0] : 인터페이스 그래프 상태
    //                                     [1] : 유저 그래프 상태
    //                                     [2] : 유저 그룹 그래프 상태
    //
    //                                  */
    //                                 // 3개 검사
    //                                 /*
    //                                     0 header - 헤더
    //                                     1 first - 인터페이스
    //                                     2 second - 유저
    //                                     3 third - 유저
    //                                     4 fourth - 그룹
    //                                     5 fifth_grp -그룹
    //                                 */
    //                                 if ($scope.grpState[0].state && $scope.grpState[1].state && $scope.grpState[2].state) {
    //                                     $scope.docConfig = {
    //                                         footer: {
    //                                             columns: [{
    //                                                 text: 'Saisei copyright',
    //                                                 alignment: 'center'
    //                                             }]
    //                                         },
    //                                         content: [
    //                                             mod_doc_config.header_page,
    //                                             mod_doc_config.first_page,
    //                                             mod_doc_config.second_page,
    //                                             mod_doc_config.third_page,
    //                                             mod_doc_config.fourth_page,
    //                                             mod_doc_config.fifth_page_grp
    //                                             // mod_doc_config.fifth_page_table
    //                                         ],
    //                                         styles: {
    //                                             defaultStyle: {
    //                                                 alignment: 'center'
    //                                             },
    //                                             footer: {
    //                                                 alignment: 'center',
    //                                                 font: 'customFont'
    //                                             }
    //                                         }
    //                                     };
    //                                     if ($scope.grpState[2].state) {
    //                                         _(mod_doc_config.fifth_page_table).each(function (config, i) {
    //                                             $scope.docConfig.content.push(config)
    //                                         });
    //                                     }
    //                                 } else {
    //                                     // 2개 검사
    //                                     if ($scope.grpState[0].state && $scope.grpState[1].state) {
    //                                         // delete mod_doc_config.second_page.pageBreak;
    //                                         $scope.docConfig = {
    //                                             footer: {
    //                                                 columns: [{
    //                                                     text: 'Saisei copyright',
    //                                                     alignment: 'center'
    //                                                 }]
    //                                             },
    //                                             content: [
    //                                                 mod_doc_config.header_page,
    //                                                 mod_doc_config.first_page,
    //                                                 mod_doc_config.second_page,
    //                                                 mod_doc_config.third_page
    //                                             ],
    //                                             styles: {
    //                                                 defaultStyle: {
    //                                                     alignment: 'center'
    //                                                 },
    //                                                 footer: {
    //                                                     alignment: 'center',
    //                                                     font: 'customFont'
    //                                                 }
    //                                             }
    //                                         };
    //                                     } else if ($scope.grpState[0].state && $scope.grpState[2].state) {
    //                                         delete mod_doc_config.third_page.pageBreak;
    //                                         $scope.docConfig = {
    //                                             footer: {
    //                                                 columns: [{
    //                                                     text: 'Saisei copyright',
    //                                                     alignment: 'center'
    //                                                 }]
    //                                             },
    //                                             content: [
    //                                                 mod_doc_config.header_page,
    //                                                 mod_doc_config.first_page,
    //                                                 mod_doc_config.fourth_page,
    //                                                 mod_doc_config.fifth_page_grp,
    //                                                 // mod_doc_config.fifth_page_table
    //                                             ],
    //                                             styles: {
    //                                                 defaultStyle: {
    //                                                     alignment: 'center'
    //                                                 },
    //                                                 footer: {
    //                                                     alignment: 'center',
    //                                                     font: 'customFont'
    //                                                 }
    //                                             }
    //                                         };
    //                                         _(mod_doc_config.fifth_page_table).each(function (config, i) {
    //                                             $scope.docConfig.content.push(config)
    //                                         });
    //                                     } else if ($scope.grpState[1].state && $scope.grpState[2].state) {
    //                                         delete mod_doc_config.third_page.pageBreak;
    //                                         $scope.docConfig = {
    //                                             footer: {
    //                                                 columns: [{
    //                                                     text: 'Saisei copyright',
    //                                                     alignment: 'center'
    //                                                 }]
    //                                             },
    //                                             content: [
    //                                                 mod_doc_config.header_page,
    //                                                 mod_doc_config.second_page,
    //                                                 mod_doc_config.third_page,
    //                                                 mod_doc_config.fourth_page,
    //                                                 mod_doc_config.fifth_page_grp
    //                                                 // mod_doc_config.fifth_page_table
    //                                             ],
    //                                             styles: {
    //                                                 defaultStyle: {
    //                                                     alignment: 'center'
    //                                                 },
    //                                                 footer: {
    //                                                     alignment: 'center',
    //                                                     font: 'customFont'
    //                                                 }
    //                                             }
    //                                         };
    //                                         if ($scope.grpState[2].state) {
    //                                             _(mod_doc_config.fifth_page_table).each(function (config, i) {
    //                                                 $scope.docConfig.content.push(config)
    //                                             });
    //                                         }
    //                                     } else {
    //                                         // 1개 검사
    //                                         if ($scope.grpState[0].state) {
    //                                             delete mod_doc_config.first_page.pageBreak;
    //                                             $scope.docConfig = {
    //                                                 footer: {
    //                                                     columns: [{
    //                                                         text: 'Saisei copyright',
    //                                                         alignment: 'center'
    //                                                     }]
    //                                                 },
    //                                                 content: [
    //                                                     mod_doc_config.header_page,
    //                                                     mod_doc_config.first_page
    //                                                 ],
    //                                                 styles: {
    //                                                     defaultStyle: {
    //                                                         alignment: 'center'
    //                                                     },
    //                                                     footer: {
    //                                                         alignment: 'center',
    //                                                         font: 'customFont'
    //                                                     }
    //                                                 }
    //                                             };
    //                                         } else if ($scope.grpState[1].state) {
    //                                             $scope.docConfig = {
    //                                                 footer: {
    //                                                     columns: [{
    //                                                         text: 'Saisei copyright',
    //                                                         alignment: 'center'
    //                                                     }]
    //                                                 },
    //                                                 content: [
    //                                                     mod_doc_config.header_page,
    //                                                     mod_doc_config.second_page,
    //                                                     mod_doc_config.third_page
    //                                                 ],
    //                                                 styles: {
    //                                                     defaultStyle: {
    //                                                         alignment: 'center'
    //                                                     },
    //                                                     footer: {
    //                                                         alignment: 'center',
    //                                                         font: 'customFont'
    //                                                     }
    //                                                 }
    //                                             };
    //                                         } else if ($scope.grpState[2].state) {
    //                                             delete mod_doc_config.fourth_page.pageBreak;
    //                                             $scope.docConfig = {
    //                                                 footer: {
    //                                                     columns: [{
    //                                                         text: 'Saisei copyright',
    //                                                         alignment: 'center'
    //                                                     }]
    //                                                 },
    //                                                 content: [
    //                                                     mod_doc_config.header_page,
    //                                                     mod_doc_config.fourth_page,
    //                                                     mod_doc_config.fifth_page_grp
    //                                                     // mod_doc_config.fifth_page_table
    //                                                 ],
    //                                                 styles: {
    //                                                     defaultStyle: {
    //                                                         alignment: 'center'
    //                                                     },
    //                                                     footer: {
    //                                                         alignment: 'center',
    //                                                         font: 'customFont'
    //                                                     }
    //                                                 }
    //                                             };
    //                                             if ($scope.grpState[2].state) {
    //                                                 _(mod_doc_config.fifth_page_table).each(function (config, i) {
    //                                                     $scope.docConfig.content.push(config)
    //                                                 });
    //                                             }
    //                                         } else {
    //                                             $scope.docConfig = {
    //                                                 footer: {
    //                                                     columns: [{
    //                                                         text: 'Saisei copyright',
    //                                                         alignment: 'center'
    //                                                     }]
    //                                                 },
    //                                                 content: [
    //                                                     mod_doc_config.header_page,
    //                                                 ],
    //                                                 styles: {
    //                                                     defaultStyle: {
    //                                                         alignment: 'center'
    //                                                     },
    //                                                     footer: {
    //                                                         alignment: 'center',
    //                                                         font: 'customFont'
    //                                                     }
    //                                                 }
    //                                             };
    //                                         }
    //                                     }
    //                                 }
    //                                 console.log("ratio : " + ratio);
    //                                 console.log("pdfmake 컨피그: ", $scope.docConfig);
    //                                 // if($scope.grpState[2].state) {
    //                                 //     _(mod_doc_config.fifth_page_tables).each(function (config, i) {
    //                                 //
    //                                 //         $scope.docConfig.content.push(config)
    //                                 //     });
    //                                 // }
    //                                 deferred.resolve($scope.docConfig);
    //                             });
    //                         } else {
    //                             _promise_canvas_header().then(function (result) {
    //                                 // formular : (original height / original width) x new_width = new_height
    //                                 if (duration >= 20) {
    //                                     var ratio = 3;
    //                                 } else if (10 < duration && duration < 20) {
    //                                     var ratio = 2.6;
    //                                 } else {
    //                                     if (size.second_page.height > 1600 || size.fourth_page.height > 1600 || size.fifth_page.height > 1600) {
    //                                         var second_ratio = 2.6;
    //                                         var fourth_ratio = 2.6;
    //                                         var fifth_ratio = 3;
    //                                         var ratio = 2.6;
    //                                     } else {
    //                                         var second_ratio = 2.6;
    //                                         var fourth_ratio = 2.6;
    //                                         var fifth_ratio = 3;
    //                                         var ratio = 2.6;
    //                                     }
    //                                 }
    //                                 // margin: [left, top, right, bottom]
    //                                 // config for pdf
    //                                 console.log("컨피그 설정: ", result);
    //                                 var mod_doc_config = {
    //                                     header_page: {
    //                                         image: $scope.header_page,
    //                                         width: Math.ceil(size.header_page.width / ratio),
    //                                         height: Math.ceil((size.header_page.height / size.header_page.width) * Math.ceil(size.header_page.width / ratio)),
    //                                         margin: [0, 0, 0, 0],
    //                                         style: 'defaultStyle'
    //                                     },
    //                                     first_page: {
    //                                         image: $scope.first_page,
    //                                         width: Math.ceil(size.first_page.width / ratio),
    //                                         height: Math.ceil((size.first_page.height / size.first_page.width) * Math.ceil(size.first_page.width / ratio)),
    //                                         margin: [0, 0, 0, 0],
    //                                         style: 'defaultStyle',
    //                                         pageBreak: 'after'
    //                                     },
    //                                     second_page: {
    //                                         image: $scope.second_page,
    //                                         width: Math.ceil(size.second_page.width / second_ratio),
    //                                         height: Math.ceil((size.second_page.height / size.second_page.width) * Math.ceil(size.second_page.width / second_ratio)),
    //                                         margin: [0, 15, 0, 0],
    //                                         style: 'defaultStyle',
    //                                         pageBreak: 'after'
    //                                     },
    //                                     third_page: {
    //                                         image: $scope.third_page,
    //                                         width: Math.ceil(size.third_page.width / ratio),
    //                                         height: Math.ceil((size.third_page.height / size.third_page.width) * Math.ceil(size.third_page.width / ratio)),
    //                                         margin: [0, 15, 0, 0],
    //                                         style: 'defaultStyle',
    //                                         pageBreak: 'after'
    //                                     },
    //                                     fourth_page: {
    //                                         image: $scope.fourth_page,
    //                                         width: Math.ceil(size.fourth_page.width / fourth_ratio),
    //                                         height: Math.ceil((size.fourth_page.height / size.fourth_page.width) * Math.ceil(size.fourth_page.width / fourth_ratio)),
    //                                         margin: [0, 15, 0, 0],
    //                                         style: 'defaultStyle',
    //                                         pageBreak: 'after'
    //                                     },
    //                                     fifth_page_grp: {
    //                                         image: $scope.fifth_page_grp,
    //                                         width: Math.ceil(size.fifth_page_grp.width / ratio),
    //                                         height: Math.ceil((size.fifth_page_grp.height / size.fifth_page_grp.width) * Math.ceil(size.fifth_page_grp.width / ratio)),
    //                                         margin: [0, 15, 0, 0],
    //                                         style: 'defaultStyle',
    //                                         pageBreak: 'after'
    //                                     }
    //                                     // fifth_page_table: {
    //                                     //     image: result[0],
    //                                     //     width: Math.ceil(size.fifth_page_tb_set.width / fifth_ratio),
    //                                     //     height: Math.ceil((size.fifth_page_tb_set.height / size.fifth_page_tb_set.width) * Math.ceil(size.fifth_page_tb_set.width / fifth_ratio)),
    //                                     //     margin: [0, 15, 0, 0],
    //                                     //     style: 'defaultStyle'
    //                                     // }
    //                                     // last_page: {
    //                                     //      image: $scope.last_page,
    //                                     //      width: Math.ceil(size.last_page.width / ratio),
    //                                     //      height: Math.ceil((size.last_page.height / size.last_page.width) * Math.ceil(size.last_page.width / ratio)),
    //                                     //      margin: [0, 15, 0, 0]
    //                                     //  }
    //                                 };
    //
    //                                 /**
    //                                  * Add attributes to each object of an array.
    //                                  *
    //                                  * @param {array} foo - Array of objects where we will add the attibutes
    //                                  * @param {function} iterator
    //                                  */
    //                                     // _.each(foo, function(element, index) {
    //                                     //     _.extend(element, {field1: index}, {field2: 'bar', field3: 'baz'});
    //                                     // });
    //                                 var fifth_page_table = [];
    //                                 // console.log("$scope.fifth_page_tables");
    //                                 // console.log($scope.fifth_page_tables);
    //                                 // console.log(canvas[2].tables);
    //                                 // console.log(canvas);
    //                                 if ($scope.grpState[2].state) {
    //                                     _(result).each(function (img, i) {
    //                                         // console.log(img);
    //                                         // if ((i + 1) % 3 === 0) {
    //                                         fifth_page_table.push({
    //                                             image: img,
    //                                             width: Math.ceil(size.fifth_page_tb_set.width / fifth_ratio),
    //                                             height: Math.ceil((size.fifth_page_tb_set.height / size.fifth_page_tb_set.width) * Math.ceil(size.fifth_page_tb_set.width / fifth_ratio)),
    //                                             margin: [0, 15, 0, 0],
    //                                             style: 'defaultStyle',
    //                                             pageBreak: 'after'
    //                                         });
    //                                         // } else {
    //                                         //     fifth_page_tables.push({
    //                                         //         image: img,
    //                                         //         width: Math.ceil(size.fifth_page_tb.width / ratio),
    //                                         //         height: Math.ceil((size.fifth_page_tb.height / size.fifth_page_tb.width) * Math.ceil(size.fifth_page_tb.width / ratio)),
    //                                         //         margin: [0, 15, 0, 0],
    //                                         //         style: 'defaultStyle'
    //                                         //     });
    //                                         // }
    //                                     });
    //                                     _.extend(mod_doc_config, {
    //                                         fifth_page_table: fifth_page_table
    //                                     });
    //                                     console.log(mod_doc_config);
    //                                     // console.log(fifth_page_table);
    //                                 }
    //                                 // }
    //                                 /*
    //                                     [0] : 인터페이스 그래프 상태
    //                                     [1] : 유저 그래프 상태
    //                                     [2] : 유저 그룹 그래프 상태
    //
    //                                  */
    //                                 // 3개 검사
    //                                 /*
    //                                     0 header - 헤더
    //                                     1 first - 인터페이스
    //                                     2 second - 유저
    //                                     3 third - 유저
    //                                     4 fourth - 그룹
    //                                     5 fifth_grp -그룹
    //                                 */
    //                                 if ($scope.grpState[0].state && $scope.grpState[1].state && $scope.grpState[2].state) {
    //                                     $scope.docConfig = {
    //                                         footer: {
    //                                             columns: [{
    //                                                 text: 'Saisei copyright',
    //                                                 alignment: 'center'
    //                                             }]
    //                                         },
    //                                         content: [
    //                                             mod_doc_config.header_page,
    //                                             mod_doc_config.first_page,
    //                                             mod_doc_config.second_page,
    //                                             mod_doc_config.third_page,
    //                                             mod_doc_config.fourth_page,
    //                                             mod_doc_config.fifth_page_grp
    //                                             // mod_doc_config.fifth_page_table
    //                                         ],
    //                                         styles: {
    //                                             defaultStyle: {
    //                                                 alignment: 'center'
    //                                             },
    //                                             footer: {
    //                                                 alignment: 'center',
    //                                                 font: 'customFont'
    //                                             }
    //                                         }
    //                                     };
    //                                     if ($scope.grpState[2].state) {
    //                                         _(mod_doc_config.fifth_page_table).each(function (config, i) {
    //                                             $scope.docConfig.content.push(config)
    //                                         });
    //                                     }
    //                                 } else {
    //                                     // 2개 검사
    //                                     if ($scope.grpState[0].state && $scope.grpState[1].state) {
    //                                         // delete mod_doc_config.second_page.pageBreak;
    //                                         $scope.docConfig = {
    //                                             footer: {
    //                                                 columns: [{
    //                                                     text: 'Saisei copyright',
    //                                                     alignment: 'center'
    //                                                 }]
    //                                             },
    //                                             content: [
    //                                                 mod_doc_config.header_page,
    //                                                 mod_doc_config.first_page,
    //                                                 mod_doc_config.second_page,
    //                                                 mod_doc_config.third_page
    //                                             ],
    //                                             styles: {
    //                                                 defaultStyle: {
    //                                                     alignment: 'center'
    //                                                 },
    //                                                 footer: {
    //                                                     alignment: 'center',
    //                                                     font: 'customFont'
    //                                                 }
    //                                             }
    //                                         };
    //                                     } else if ($scope.grpState[0].state && $scope.grpState[2].state) {
    //                                         delete mod_doc_config.third_page.pageBreak;
    //                                         $scope.docConfig = {
    //                                             footer: {
    //                                                 columns: [{
    //                                                     text: 'Saisei copyright',
    //                                                     alignment: 'center'
    //                                                 }]
    //                                             },
    //                                             content: [
    //                                                 mod_doc_config.header_page,
    //                                                 mod_doc_config.first_page,
    //                                                 mod_doc_config.fourth_page,
    //                                                 mod_doc_config.fifth_page_grp,
    //                                                 // mod_doc_config.fifth_page_table
    //                                             ],
    //                                             styles: {
    //                                                 defaultStyle: {
    //                                                     alignment: 'center'
    //                                                 },
    //                                                 footer: {
    //                                                     alignment: 'center',
    //                                                     font: 'customFont'
    //                                                 }
    //                                             }
    //                                         };
    //                                         _(mod_doc_config.fifth_page_table).each(function (config, i) {
    //                                             $scope.docConfig.content.push(config)
    //                                         });
    //                                     } else if ($scope.grpState[1].state && $scope.grpState[2].state) {
    //                                         delete mod_doc_config.third_page.pageBreak;
    //                                         $scope.docConfig = {
    //                                             footer: {
    //                                                 columns: [{
    //                                                     text: 'Saisei copyright',
    //                                                     alignment: 'center'
    //                                                 }]
    //                                             },
    //                                             content: [
    //                                                 mod_doc_config.header_page,
    //                                                 mod_doc_config.second_page,
    //                                                 mod_doc_config.third_page,
    //                                                 mod_doc_config.fourth_page,
    //                                                 mod_doc_config.fifth_page_grp
    //                                                 // mod_doc_config.fifth_page_table
    //                                             ],
    //                                             styles: {
    //                                                 defaultStyle: {
    //                                                     alignment: 'center'
    //                                                 },
    //                                                 footer: {
    //                                                     alignment: 'center',
    //                                                     font: 'customFont'
    //                                                 }
    //                                             }
    //                                         };
    //                                         if ($scope.grpState[2].state) {
    //                                             _(mod_doc_config.fifth_page_table).each(function (config, i) {
    //                                                 $scope.docConfig.content.push(config)
    //                                             });
    //                                         }
    //                                     } else {
    //                                         // 1개 검사
    //                                         if ($scope.grpState[0].state) {
    //                                             delete mod_doc_config.first_page.pageBreak;
    //                                             $scope.docConfig = {
    //                                                 footer: {
    //                                                     columns: [{
    //                                                         text: 'Saisei copyright',
    //                                                         alignment: 'center'
    //                                                     }]
    //                                                 },
    //                                                 content: [
    //                                                     mod_doc_config.header_page,
    //                                                     mod_doc_config.first_page
    //                                                 ],
    //                                                 styles: {
    //                                                     defaultStyle: {
    //                                                         alignment: 'center'
    //                                                     },
    //                                                     footer: {
    //                                                         alignment: 'center',
    //                                                         font: 'customFont'
    //                                                     }
    //                                                 }
    //                                             };
    //                                         } else if ($scope.grpState[1].state) {
    //                                             $scope.docConfig = {
    //                                                 footer: {
    //                                                     columns: [{
    //                                                         text: 'Saisei copyright',
    //                                                         alignment: 'center'
    //                                                     }]
    //                                                 },
    //                                                 content: [
    //                                                     mod_doc_config.header_page,
    //                                                     mod_doc_config.second_page,
    //                                                     mod_doc_config.third_page
    //                                                 ],
    //                                                 styles: {
    //                                                     defaultStyle: {
    //                                                         alignment: 'center'
    //                                                     },
    //                                                     footer: {
    //                                                         alignment: 'center',
    //                                                         font: 'customFont'
    //                                                     }
    //                                                 }
    //                                             };
    //                                         } else if ($scope.grpState[2].state) {
    //                                             delete mod_doc_config.fourth_page.pageBreak;
    //                                             $scope.docConfig = {
    //                                                 footer: {
    //                                                     columns: [{
    //                                                         text: 'Saisei copyright',
    //                                                         alignment: 'center'
    //                                                     }]
    //                                                 },
    //                                                 content: [
    //                                                     mod_doc_config.header_page,
    //                                                     mod_doc_config.fourth_page,
    //                                                     mod_doc_config.fifth_page_grp
    //                                                     // mod_doc_config.fifth_page_table
    //                                                 ],
    //                                                 styles: {
    //                                                     defaultStyle: {
    //                                                         alignment: 'center'
    //                                                     },
    //                                                     footer: {
    //                                                         alignment: 'center',
    //                                                         font: 'customFont'
    //                                                     }
    //                                                 }
    //                                             };
    //                                             if ($scope.grpState[2].state) {
    //                                                 _(mod_doc_config.fifth_page_table).each(function (config, i) {
    //                                                     $scope.docConfig.content.push(config)
    //                                                 });
    //                                             }
    //                                         } else {
    //                                             $scope.docConfig = {
    //                                                 footer: {
    //                                                     columns: [{
    //                                                         text: 'Saisei copyright',
    //                                                         alignment: 'center'
    //                                                     }]
    //                                                 },
    //                                                 content: [
    //                                                     mod_doc_config.header_page,
    //                                                 ],
    //                                                 styles: {
    //                                                     defaultStyle: {
    //                                                         alignment: 'center'
    //                                                     },
    //                                                     footer: {
    //                                                         alignment: 'center',
    //                                                         font: 'customFont'
    //                                                     }
    //                                                 }
    //                                             };
    //                                         }
    //                                     }
    //                                 }
    //                                 console.log("ratio : " + ratio);
    //                                 console.log("pdfmake 컨피그: ", $scope.docConfig);
    //                                 // if($scope.grpState[2].state) {
    //                                 //     _(mod_doc_config.fifth_page_tables).each(function (config, i) {
    //                                 //
    //                                 //         $scope.docConfig.content.push(config)
    //                                 //     });
    //                                 // }
    //                                 deferred.resolve($scope.docConfig);
    //                             });
    //                         }
    //                     }
    //                 }
    //
    //             },
    //             /*실패시*/
    //             function (values) {
    //                 console.log(values);
    //                 notie.alert({
    //                     type: 'error',
    //                     text: '데이터가 존재하지 않아 pdf를 다운로드 할 수 없습니다.'
    //                 });
    //             }
    //         );
    //         return deferred.promise;
    //     };
    //     $scope.getPdfConfig().then(function(config){
    //         console.log("컨피그: ", config);
    //         var report_filename = "saisei_report(" + $scope.from + "~" + $scope.until + ").pdf";
    //         pdfMake.createPdf(config).download(report_filename, function () {
    //             notie.alert({
    //                 type: 'error',
    //                 text: 'pdf 다운로드가 완료 되었습니다!!'
    //             });
    //         });
    //     });
    // };
});