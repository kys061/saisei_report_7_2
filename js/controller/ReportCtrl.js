reportApp.controller('ReportCtrl', function ReportCtrl(
    $rootScope, $scope, $log, ReportData, SharedData, UserAppData, $location, $route, $window, cfpLoadingBar,
    $q, $timeout, ReportInterfaceTotalRate, ReportUserData, ReportMetaData, ReportIntName) {

    $scope.$on('$routeChangeStart', function(scope, next, current) {
        SharedData.setCurrentState(true);
        console.log("change back");
        $location.path('/');
        $window.location.href = '/saisei_report/';
    });

    // 메타 데이터 요청 + 인터페이스 데이터 요청(수신, 송신) + 유저 데이터 요청 + ?(3) + 10명의 유저에 대한 각 앱 사용량 요청
    var req_count = 1+2+1+3+10;
    $scope.complete_count = 0;
    $scope.complete_check_count = req_count; // 나중에 계산 수식 필요~!!
    $rootScope.$on('cfpLoadingBar:loaded', function() {
        $scope.complete_count += 1;
        console.log("complete_count : " + $scope.complete_count);
    });

    $rootScope.$on('cfpLoadingBar:completed', function() {
        if ($scope.complete_count === $scope.complete_check_count) {
            notie.alert({
                type: 'info',
                stay: 'true',
                time: 30,
                text: 'SAISEI 트래픽 보고서가 완성 되었습니다!!!'
            });
        }
    });

    var from = SharedData.getFrom();
    var until = SharedData.getUntil();
    var select2model = SharedData.getSelect2model();
    var report_type = SharedData.getReportType();
    /*
     *  그래프 상태 체크
     *  [0] : 인터페이스 그래프
     *  [1] : 유저 리포트 및 유저-앱 연관 그래프
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
    //get div size init
    var size = {};
    size.header_page = {};
    size.first_page = {};
    size.second_page = {};
    size.third_page = {};
    size.last_page = {};
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

    $scope.promise_pdf = [];
    var _promise_header = function() {
        return $q(function(resolve, reject) {
            html2canvas(document.getElementById('header_page'), {
                onrendered: function(canvas) {
                    // document.body.appendChild(canvas);
                    $scope.header_page = canvas.toDataURL();
                    resolve($scope.header_page);
                }
                // width: 1200
            });
        });
    };
    var _promise_first = function() {
        return $q(function(resolve, reject) {
            html2canvas(document.getElementById('first_page'), {
                onrendered: function(canvas) {
                    // document.body.appendChild(canvas);
                    $scope.first_page = canvas.toDataURL();
                    resolve($scope.first_page);
                },
                async: false
                // width: 1200
            });
        });
    };
    var _promise_second = function() {
        return $q(function(resolve, reject) {
            html2canvas(document.getElementById('second_page'), {
                onrendered: function(canvas) {
                    // document.body.appendChild(canvas);
                    $scope.second_page = canvas.toDataURL();
                    resolve($scope.second_page);
                },
                async: false
            });
        });
    };
    var _promise_third = function() {
        return $q(function(resolve, reject) {
            html2canvas(document.getElementById('third_page'), {
                onrendered: function(canvas) {
                    $scope.third_page = canvas.toDataURL();
                    resolve($scope.third_page);
                },
                async: false
            });
        });
    };

    $scope.export = function() {
        var check_grp_state = function() {
            return $q(function(resolve, reject){
                $scope.promise_pdf.push(_promise_header());
                if ($scope.grpState[0].state) {
                    $scope.promise_pdf.push(_promise_first());
                }
                if ($scope.grpState[1].state) {
                    $scope.promise_pdf.push(_promise_second());
                    $scope.promise_pdf.push(_promise_third());
                }
                resolve('check grp state!!');
            });
        };
        check_grp_state().then(
            /*성공시*/
            function (values) {
                console.log(values);
                $q.all($scope.promise_pdf).then(function(values) {
                    console.log("모두 완료됨", values);
                    size.header_page.width = $('#header_page').width();
                    size.header_page.height = $('#header_page').height();
                    size.first_page.width = $('#first_page').width();
                    size.first_page.height = $('#first_page').height();
                    size.second_page.width = $('#second_page').width();
                    size.second_page.height = $('#second_page').height();
                    size.third_page.width = $('#third_page').width();
                    size.third_page.height = $('#third_page').height();
                    size.last_page.width = $('#last_page').width();
                    size.last_page.height = $('#last_page').height();
                    pdfMake.fonts = {
                        customFont: {
                            normal: '/fonts/glyphicons-halflings-regular.ttf',
                            bold: '/fonts/glyphicons-halflings-regular.ttf',
                            italics: '/fonts/glyphicons-halflings-regular.ttf',
                            bolditalics: '/fonts/glyphicons-halflings-regular.ttf'
                        },
                        Roboto: {
                            normal: 'Roboto-Regular.ttf',
                            bold: 'Roboto-Medium.ttf',
                            italics: 'Roboto-Italic.ttf',
                            bolditalics: 'Roboto-MediumItalic.ttf'
                        }
                    };

                    console.log(
                        "head_width : " + size.header_page.width + " : " +
                        "head_height : " + size.header_page.height + " : " +
                        "first_width : " + size.first_page.width + " : " +
                        "first_height : " + size.first_page.height + " : " +
                        "sec_width : " + size.second_page.width + " : " +
                        "sec_height : " + size.second_page.height + " : " +
                        "third_width : " + size.third_page.width + " : " +
                        "third_height : " + size.third_page.height
                    );
                    // head_width : 1140 : head_height : 254.733
                    // first_width : 1140 : first_height : 1709.6  // 30일의 경우
                    // sec_width : 1140 : sec_height : 1632.27 // 그래프 2개 시
                    // third_width : 1140 : third_height : 717.6
                    // formular : (original height / original width) x new_width = new_height
                    if (duration >= 20) {
                        var ratio = 3;
                    } else if (10 < duration && duration < 20) {
                        var ratio = 2.6;
                    } else {
                        if (size.second_page.height > 1600){
                            var second_ratio = 2.5;
                            var ratio = 2.2;
                        } else {
                            var second_ratio = 2.5;
                            var ratio = 2.2;
                        }

                    }
                    // margin: [left, top, right, bottom]
                    var mod_doc_config = {
                        header_page: {
                            image: $scope.header_page,
                            width: Math.ceil(size.header_page.width / ratio),
                            height: Math.ceil((size.header_page.height / size.header_page.width) * Math.ceil(size.header_page.width / ratio)),
                            margin: [0, 0, 0, 0],
                            style: 'defaultStyle'
                        },
                       first_page: {
                           image: $scope.first_page,
                           width: Math.ceil(size.first_page.width / ratio),
                           height: Math.ceil((size.first_page.height / size.first_page.width) * Math.ceil(size.first_page.width / ratio)),
                           margin: [0, 0, 0, 0],
                           style: 'defaultStyle',
                           pageBreak: 'after'
                        },
                        second_page: {
                            image: $scope.second_page,
                            width: Math.ceil(size.second_page.width / second_ratio),
                            height: Math.ceil((size.second_page.height / size.second_page.width) * Math.ceil(size.second_page.width / second_ratio)),
                            margin: [0, 15, 0, 0],
                            style: 'defaultStyle',
                            pageBreak: 'after'
                        },
                        third_page: {
                            image: $scope.third_page,
                            width: Math.ceil(size.third_page.width / ratio),
                            height: Math.ceil((size.third_page.height / size.third_page.width) * Math.ceil(size.third_page.width / ratio)),
                            margin: [0, 15, 0, 0],
                            style: 'defaultStyle'
                        }
                       // last_page: {
                       //      image: $scope.last_page,
                       //      width: Math.ceil(size.last_page.width / ratio),
                       //      height: Math.ceil((size.last_page.height / size.last_page.width) * Math.ceil(size.last_page.width / ratio)),
                       //      margin: [0, 15, 0, 0]
                       //  }
                };
                    if($scope.grpState[0].state && $scope.grpState[1].state) {
                        $scope.docConfig = {
                            footer: {
                                columns: [{
                                    text: 'Saisei copyright',
                                    alignment: 'center'
                                }]
                            },
                            content: [
                                mod_doc_config.header_page,
                                mod_doc_config.first_page,
                                mod_doc_config.second_page,
                                mod_doc_config.third_page
                            ],
                            styles: {
                                defaultStyle: {
                                    alignment: 'center'
                                },
                                footer: {
                                    alignment: 'center',
                                    font: 'customFont'
                                }
                            }
                        };
                    } else{
                        if($scope.grpState[0].state){
                            delete mod_doc_config.first_page.pageBreak;
                            $scope.docConfig = {
                                footer: {
                                    columns: [{
                                        text: 'Saisei copyright',
                                        alignment: 'center'
                                    }]
                                },
                                content: [
                                    mod_doc_config.header_page,
                                    mod_doc_config.first_page,
                                ],
                                styles: {
                                    defaultStyle: {
                                        alignment: 'center'
                                    },
                                    footer: {
                                        alignment: 'center',
                                        font: 'customFont'
                                    }
                                }
                            };
                        } else if($scope.grpState[1].state){
                            $scope.docConfig = {
                                footer: {
                                    columns: [{
                                        text: 'Saisei copyright',
                                        alignment: 'center'
                                    }]
                                },
                                content: [
                                    mod_doc_config.header_page,
                                    mod_doc_config.second_page,
                                    mod_doc_config.third_page
                                ],
                                styles: {
                                    defaultStyle: {
                                        alignment: 'center'
                                    },
                                    footer: {
                                        alignment: 'center',
                                        font: 'customFont'
                                    }
                                }
                            };
                        }else{
                            $scope.docConfig = {
                                footer: {
                                    columns: [{
                                        text: 'Saisei copyright',
                                        alignment: 'center'
                                    }]
                                },
                                content: [
                                    mod_doc_config.header_page,
                                ],
                                styles: {
                                    defaultStyle: {
                                        alignment: 'center'
                                    },
                                    footer: {
                                        alignment: 'center',
                                        font: 'customFont'
                                    }
                                }
                            };
                        }

                    }
                    console.log("ratio : " + ratio);
                    console.log($scope.docConfig);
                    var report_filename = "saisei_report("+$scope.from+"~"+$scope.until+").pdf" ;
                    pdfMake.createPdf($scope.docConfig).download(report_filename, function() {
                        notie.alert({
                            type: 'error',
                            text: 'pdf 다운로드가 완료 되었습니다!!'
                        });
                    });
                });
            },
            /*실패시*/
            function (values) {
                console.log(values);
                notie.alert({
                    type: 'error',
                    text: '데이터가 존재하지 않아 pdf를 다운로드 할 수 없습니다.'
                });
            }
        );
    };

    // 메타데이터 가져오기 정의
    var getMetaData = function() {
        return $q(function(resolve, reject){
            // 메타데이터
            var metaLink = new ReportMetaData();
            metaLink.q_metaLinkData().then(
                function(val){
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
                                int_ext_name: val.int_ext_name
                            });
                        },
                        // failure
                        function (val) {
                            console.log(val);
                            reject( Error("failure!!") );
                        }

                    );
                    //resolve('get meata data!');
                    // get interface of external : http://10.161.147.55:5000/rest/stm/configurations/running/interfaces/?token=1&order=%3Eactual_direction&with=actual_direction=external,class%3C=ethernet_interface&start=0&limit=10&select=name,type,actual_direction,state,description
                },
                function(val){
                    console.log(val);
                    reject( Error("failure!!") );
                }
            );

        });
    };
    // 메타데이터 가져오기
    getMetaData().then(
        // success
        function(val){
            var hostname = val.hostname;
            var int_name = val.int_ext_name[0];
            // 그래프
            // 인터페이스
            var intGrpDataset = new ReportInterfaceTotalRate();
            intGrpDataset.q_intData(hostname, int_name, from, until, duration, $scope.grpState[0].state).then(
                function(val){
                    $scope.data = val.data;
                    $scope.labels = val.labels;
                    $scope.series = val.series;
                    $scope.colors = val.colors;
                    $scope.options = val.options;
                    $scope.datasetOverride = val.datasetOverride;
                    $scope.int_data = val.int_data;
                    $scope.int_name = val.int_name;
                },
                function(val){
                    console.log(val);
                }
            );
            // 유저 트래픽 그래프
            var userGrpDataset = new ReportUserData();
            userGrpDataset.q_userData(hostname, from, until, duration, $scope.grpState[1].state).then(
                function(val){
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
                },
                function(val){
                    console.log(val);
                }
            );
            // 유저 raw 플로우 정보
            // var userGrpDataset2 = new ReportUserData();
            // userGrpDataset2.q_userFlowData(hostname, from, until, duration, $scope.grpState[1].state).then(
            //     function(val){
            //         console.log(val);
            //     },
            //     function(val){
            //         console.log(val);
            //     }
            // );
        },
        // failure
        function(val){
            console.log(val);
        }
    );
});