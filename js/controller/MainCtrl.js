reportApp.controller('MainCtrl', function MainCtrl($scope, $log, $route, $templateCache, $location, $window, $q, _,
                                                   SharedData, ReportMain, ReportMainMetaData) {
    var from;
    var until;
    var work_from;
    var work_until;
    var today = new $window.Sugar.Date(new Date());

    var complete_count;

    // util
    function searchWord( word, input ) {
        var regex = new RegExp( '\\b' + word + '\\b' );
        return (regex.exec( input ) || [''])[0];
    }

    $scope.is_metadata = true;

    $scope.report_def = {1: 'int_report', 2: 'user_report', 3:'user_group_report'};
    $scope.period_def = {1: 'day', 2: 'week', 3: 'month'};
    $scope.select2model = [];
    $scope.select2data = [
        {
            id: 1,
            label: "인터페이스 트래픽"
        },
        {
            id: 2,
            label: "사용자 트래픽"
        },
        {
            id: 3,
            label: "사용자 그룹 트래픽"
        }
        // {
        //     id: 3,
        //     label: "사용자-어플리케이션 트래픽"
        // }
    ];
    $scope.select2settings = {};
    // $scope.$on('', function(){
    //
    // });

    $scope.period_model = [];
    $scope.period_data = [
        {
            id: 1,
            label: "일간 리포트"
        },
        {
            id: 2,
            label: "주간 리포트"
        },
        {
            id: 3,
            label: "월간 리포트"
        }
    ];
    $scope.period_settings = {
        selectionLimit: 1,
        events: {
            onItemSelect: function (item) {
                console.log('selected: '+item);
            },
            onItemDeselect: function (item){
                console.log('Deselected: '+item);
            }
        }
    };
    $scope.period_event = {
        onItemSelect: function(item) {
            notie.alert({
                type: 'info',
                text: '기간 별 리포트를 선택했을 경우에는 커스텀 달력 선택을 할 수 없습니다.!!!'
            })
        },
        onItemDeselect: function (item){
            notie.alert({
                type: 'info',
                text: '기간 별 리포트를 선택하지 않을 경우에는 커스텀 달력 선택을 할 수 있습니다.!!!'
            })
        }
    };
    $scope.work_model = [];
    $scope.work_data = [
        {
            id: 1,
            label: "업무시간(09~18)"
        }
    ];
    $scope.work_settings = {
        selectionLimit: 1
    };


    $scope.selectByGroupData = [ { id: 1, label: "David", gender: 'M' }, { id: 2, label: "Jhon", gender: 'M' }, { id: 3, label: "Lisa", gender: 'F' }, { id: 4, label: "Nicole", gender: 'F' }, { id: 5, label: "Danny", gender: 'M' }, {	id: 6, label: "Unknown", gender: 'O' } ];
    $scope.selectByGroupSettings = { selectByGroups: ['F', 'M'],
        groupByTextProvider: function(groupValue) { switch (groupValue) { case 'M': return 'Male'; case 'F': return 'Female'; case 'O': return 'Other'; } },
        groupBy: 'gender', };

    // $scope.currentState = SharedData.getCurrentState();
    $scope.currentState = true;
    $scope.currentDurationState = SharedData.currentDurationState;
    $scope.$watch('date_from', function(val) {
        from = val;
        // if (val){
        //     notie.alert({
        //         type: 'info',
        //         text: '커스텀 달력을 선택했을 경우에는 기간별 리포트를 선택을 할 수 없습니다.!!!'
        //     })
        // }
        console.log(val);
        var work_day = searchWord('[0-9]+-[0-9]+-[0-9]+ ', val);
        work_from = work_day+'09:00:00';
        console.log(work_day+'09:00:00');
        console.log(val);
        var selected_from = new $window.Sugar.Date(val);
        // var cus_from = new $window.Sugar.Date(work_from);
        if (selected_from.isBefore(work_from) && selected_from.isBefore(today)){
            SharedData.setWorkFrom(work_from);
            console.log(SharedData.getWorkFrom());
        }
        // var test = new $window.Sugar.Date('2018-12-13 12:40:00');
        console.log(today);
        console.log(selected_from.isBefore(work_from));
        // $scope.from = new Date(val);
    });
    $scope.$watch('date_until', function(val) {
        until = val;
        // if (val){
        //     notie.alert({
        //         type: 'info',
        //         text: '커스텀 달력을 선택했을 경우에는 기간별 리포트를 선택을 할 수 없습니다.!!!'
        //     })
        // }
        console.log(val);
        // $scope.until = new Date(val);
    });
    $scope.$watch('period_model', function(val){
        console.log(val)
    });
    $scope.$watch('select2model', function(val){
        console.log(val);
    });
    console.log($);
    // $('.has-clear .col-lg-7 input[type="text"]').on('input propertychange', function() {
    //     var $this = $(this);
    //     var visible = Boolean($this.val());
    //     console.log("제이쿼리");
    //     $this.siblings('.form-control-clear').toggleClass('hidden', !visible);
    // }).trigger('propertychange');
    //
    // $('.form-control-clear').click(function() {
    //     $(this).siblings('input[type="text"]').val('')
    //         .trigger('propertychange').focus();
    // });

    // 메타데이터 가져오기 정의
    var getMetaData = function() {
        return $q(function(resolve, reject){
            // 메타데이터
            var metaLink = new ReportMainMetaData();
            metaLink.q_metaLinkData().then(
                function(val){
                    $scope.hostname = val.hostname;
                    resolve({
                        hostname: $scope.hostname
                    });
                },
                function(val){
                    $scope.is_metadata = false;
                    reject( Error("failure!!") );
                }
            )
        });
    };

    getMetaData().then(
        function(val){
            console.log(val);
            var hostname = val.hostname;
            ReportMain.getUserGroupSize(hostname).then(
                function (size) {
                    console.log("group_size", size.data.size);
                    $scope.group_size = size.data.size;
                    ReportMain.getUserSize(hostname).then(
                        function (size) {
                            console.log("users_size", size.data.size);
                            $scope.users_size = size.data.size
                        },
                        function(val){
                            notie.alert({
                                type: 'error',
                                text: '사용자 그룹 정보를 가지고 올 수 없습니다!!!'
                            });
                        }
                    );
                },
                function(val){
                    notie.alert({
                        type: 'error',
                        text: '사용자 그룹 정보를 가지고 올 수 없습니다!!!'
                    })
                }
            );
        },
        function(val){
            console.log(val);
        }
    );

    var checkReportType = function(){
        // 리포트를 한개 이상 선택 한 경우
        if($scope.select2model.length > 0) {
            console.log($scope.group_size);
            var count_group = 0;
            var count_users = 0;
            var is_worktime = false;
            // 업무시간 트래픽 사용여부 체크
            if($scope.work_model.length > 0){
                is_worktime = true;
                SharedData.setIsWorktime(is_worktime);

            }
            // 리포트 타입 체크
            _($scope.select2model).each(function(elem, index){
                if (elem.id === 3){
                    count_group += 1;
                }
                if (elem.id === 2){
                    count_users += 1;
                }
            });
            // 그룹/사용자가 1개 이상 존재 하는 경우
            if ($scope.group_size > 0 && $scope.users_size > 0) {
                console.log('count_group', count_group);
                // 1. 메타 데이터 요청(1) + 인터페이스 정보 요청(1): (2)
                // 2. 인터페이스 데이터 요청(수신, 송신): (세그먼트*2)
                // 3. 유저 데이터 요청(1. active flow 요청 : 1, 2. rate 요청 : 1, 3. 유저별 앱 요청: 10): (12)
                // 4. 그룹 사이즈 요청: 1, 그룹 히스토리 raw active flow 요청: 1, 그룹 이름을 알기 위한 rate요청: 1,
                //    - 그룹 사이즈 만큼의 그룹별 요청: size,
                //    아래 2가지는 그룹별 요청을 했을때 리턴되는 사이즈 만큼 크기
                //    예를 들어 어떤 그룹에서는 유저가 한명도 없었다면, 해당 그룹에 대한 요청은 0이됨.
                //    - 각 그룹별 top5 데이터 요청: size*5,
                //    - 각 그룹별 top5 raw 히스토리 act flow 데이터 요청(max값 계산용): size*5
                complete_count=2+4+12+3+$scope.group_size;
                $scope.currentState = false;
                $scope.currentDurationState = false;
                SharedData.setFrom(from);
                SharedData.setUntil(until);
                SharedData.setSelect2model($scope.select2model);
                SharedData.setReportType($scope.report_type);
                console.log($scope.report_type);
                $location.path('/report');
            }
            // 사용자 가 존재 하지 않는 경우
            else if ($scope.group_size > 0 && $scope.users_size <= 0){
                if (count_users > 0) {
                    notie.alert({
                        type: 'error',
                        text: '사이세이 내에 사용자가 존재 하지 않습니다. 사용자 트래픽은 해제해 주십시요!!!'
                    })
                } else{
                    $scope.currentState = false;
                    $scope.currentDurationState = false;
                    SharedData.setFrom(from);
                    SharedData.setUntil(until);
                    SharedData.setSelect2model($scope.select2model);
                    SharedData.setReportType($scope.report_type);
                    console.log($scope.report_type);
                    $location.path('/report');
                }
            }
            // 그룹이 존재 하지 않는 경우
            else if ($scope.group_size <= 0 && $scope.users_size > 0){
                if (count_group > 0) {
                    notie.alert({
                        type: 'error',
                        text: '사이세이 내에 사용자 그룹이 존재 하지 않습니다. 사용자 그룹은 해제해 주십시요!!!'
                    })
                } else{
                    $scope.currentState = false;
                    $scope.currentDurationState = false;
                    SharedData.setFrom(from);
                    SharedData.setUntil(until);
                    SharedData.setSelect2model($scope.select2model);
                    SharedData.setReportType($scope.report_type);
                    console.log($scope.report_type);
                    $location.path('/report');
                }
            }
            // 사용자와 그룹 둘 다 존재 하지 않는 경우
            else {
                console.log('count_group', count_group);
                if (count_group > 0) {
                    notie.alert({
                        type: 'error',
                        text: '사이세이 내에 사용자 그룹이 존재 하지 않습니다. 사용자 그룹 트래픽은 해제해 주십시요!!!'
                    })
                }
                else if(count_users > 0){
                    notie.alert({
                        type: 'error',
                        text: '사이세이 내에 사용자가 존재 하지 않습니다. 사용자 트래픽은 해제해 주십시요!!!'
                    })
                }
                else{
                    $scope.currentState = false;
                    $scope.currentDurationState = false;
                    SharedData.setFrom(from);
                    SharedData.setUntil(until);
                    SharedData.setSelect2model($scope.select2model);
                    SharedData.setReportType($scope.report_type);
                    console.log($scope.report_type);
                    $location.path('/report');
                }
            }
        }
        // 리포트를 선택하지 않앗을 경우
        else{
            notie.alert({
                type: 'error',
                text: '최소 하나의 리포트를 선택해주세요!'
            })
        }
    };

    $scope.sendDate = function() {
        var duration = $window.Sugar.Date.range(from, until).every('days').length;
        console.log(duration);
        console.log($scope.select2model);

        $scope.report_type = [];
        for (var i = 0; i < $scope.select2model.length; i++) {
            $scope.report_type.push({name : $scope.report_def[$scope.select2model[i]['id']], status: true});
        }

        var _until = new $window.Sugar.Date(until);
        var _from = new $window.Sugar.Date(from);
        console.log("from : until -> " + _from.raw + ':' + _until.raw);
        console.log("is_meta: " + $scope.is_metadata);
        if ($scope.is_metadata){
            if ($scope.period_model.length > 0 ) {
                if (from !== undefined || until !== undefined) {
                    notie.alert({
                        type: 'error',
                        text: '기간 별 리포트를 선택했을 경우에는 달력 선택을 할 수 없습니다.!!!'
                    })
                } else {
                    checkReportType()
                }
            } else {
                if (from === undefined || until === undefined) {
                    notie.alert({
                        type: 'error',
                        text: '리포트 기간을 넣어주세요!!!'
                    })
                } else if (duration > 31) {
                    notie.alert({
                        type: 'error',
                        text: '리포트 기간은 최대 한달까지 가능합니다!!'
                    })
                } else if (_until.isFuture().raw) {
                    notie.alert({
                        type: 'error',
                        text: '리포트 종료 시점은 현재보다 미래로 설정할 수 없습니다!!'
                    })
                } else if (_from.isFuture().raw) {
                    notie.alert({
                        type: 'error',
                        text: '리포트 시작 시점은 현재보다 미래로 설정할 수 없습니다!!'
                    });
                } else {
                    checkReportType()
                }
            }
        } else {
            notie.alert({
                type: 'error',
                text: '메타데이터를 받아오지 못해서 리포트를 생성 할 수 없습니다.'
            });
        }


        // var currentPageTemplate = $route.current.templateUrl;
        // $templateCache.remove(currentPageTemplate);
        // $route.reload();
    };
});

/*
모델이 선택 되면

1. 해당 배열을 돌면서 선택한 리포트가 무엇인지 알아낸다->넘버로 처리
2. 1번은 인터페이스 리포트 2. 유저리포트 3. 유저앱리포트 순으로 정하여
생성해야할 리포트 넘버만 배열로 만들어 reportctrl로 해당 배열을 공유한다.

3. 코드 수정없이 하나의 로직으로 각 넘버별에 맞는 리포트를 출력하려면?
	1. 사전 정의된 객체 테이터 필요, {1: 'int_report', 2: 'user_report', 3: 'user_app_report'}
	2. 넘어온 생성해야할 넘버링된 리포트 배열(a=[1,2])의 갯수만큼 배열을 돌면서 해당 리포트를 데이터를 가져오고, pdf를 찍어야 하며, csv데이터를 만들어야 한다.
	3. 해당 리포트 데이터를 가져오는 것은 동적인 xhr 통신을 할 수있도록 코드를 준비해야한다.
	4. 뷰쪽에서는 html 페이지에서 해당 리포트에 대한 엘리먼트들만 컨트롤러와 통신 할 수 있도록 ng-hide 또는 데이터 바인딩이 안되도록 해야 한다.
 */