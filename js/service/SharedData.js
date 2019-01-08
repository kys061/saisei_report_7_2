reportApp.service('SharedData', function() {
    var sharedData = {};
    sharedData.currentDurationState = true;
    sharedData.currentBtnState = false;
    sharedData.currentState = true;
    sharedData.from;
    sharedData.until;
    sharedData.select2model;
    sharedData.report_type;
    sharedData.group_size = 0;
    sharedData.is_worktime = false;
    sharedData.work_from;
    sharedData.work_until;
    sharedData.period_type;

    sharedData.errorCode = {
        user: {
            E01: 'ERROR - 유저 데이터를 가져오지 못했습니다.',
            E02: 'ERROR - 유저 ActiveFlows데이터를 가져오지 못했습니다.',
            E03: 'ERROR - 유저 사이즈를 가져오지 못했습니다.',
            E04: 'ERROR - 유저 패킷 제어양 데이터를 가져오지 못했습니다.',
            E05: 'ERROR - 유저-앱 연관 데이터를 가져오지 못했습니다.',
            W01: 'WARN - 유저 데이터가 존재하지 않습니다.',
            W02: 'WARN - 유저 ActiveFlows데이터가 존재하지 않습니다.',
            W03: 'WARN - 유저 사이즈가 존재하지 않습니다.',
            W04: 'WARN - 유저 패킷 제어양 데이터가 존재하지 않습니다.',
            W05: 'WARN - 유저-앱 연관 데이터가 존재하지 않습니다.'
        },
        interface:{
            E01: 'ERROR - 인터페이스 이름을 가져오지 못했습니다.',
            E02: 'ERROR - 인터페이스 송신 데이터를 가져오지 못했습니다.',
            E03: 'ERROR - 인터페이스 수신 데이터를 가져오지 못했습니다.',
            W01: 'WARN - 인터페이스 이름을 가져오지 못했습니다.',
            W02: 'WARN - 인터페이스 송신 데이터가 존재하지 않습니다.',
            W03: 'WARN - 인터페이스 수신 데이터가 존재하지 않습니다.'
        },
        user_group: {
            E01: 'ERROR - 유저그룹 데이터를 가져오지 못했습니다.',
            E02: 'ERROR - 유저그룹 ActiveFlows 데이터를 가져오지 못했습니다.',
            E03: 'ERROR - 유저 그룹 사이즈를 가져오지 못했습니다.',
            E04: 'ERROR - 그룹 내에 유저의 ActiveFlows 데이터를 가져오지 못했습니다.',
            E05: 'ERROR - 그룹 내에 유저-앱 연관 데이터를 가져오지 못했습니다.',
            W01: 'WARN - 유저그룹 데이터가 존재하지 않습니다.',
            W02: 'WARN - 유저그룹 ActiveFlows 데이터가 존재하지 않습니다.',
            W03: 'WARN - 유저 그룹 사이즈가 존재하지 않습니다.',
            W04: 'WARN - 그룹 내에 유저의 ActiveFlows 데이터가 존재하지 않습니다.',
            W05: 'WARN - 그룹 내에 유저-앱 연관 데이터가 존재하지 않습니다.'
        },
        metadata:{
            E01:  'ERROR - 메타데이터를 받아오지 못해서 리포트를 생성 할 수 없습니다.',
            W01:  'WARN - 메타 데이터가 존재하지 않기때문에 리포트를 생성 할 수 없습니다.'
        },
        main: {
            E01: 'ERROR - 사용자 그룹 정보를 가지고 올 수 없습니다!!!',
            E02: 'ERROR - 사이세이 내에 사용자가 존재 하지 않습니다. 사용자 트래픽은 해제해 주십시요!!!',
            E03: 'ERROR - 사이세이 내에 사용자 그룹이 존재 하지 않습니다. 사용자 그룹은 해제해 주십시요!!!',
            E04: 'ERROR - 최소 하나의 리포트를 선택해주세요!!!',
            W01: 'WARN - 커스텀 달력을 선택했을 경우에는 사전정의된 기간을 선택을 할 수 없습니다.!!!',
            W02: 'WARN - 사전 정의된 기간을 선택했을 경우에는 커스텀 달력 선택을 할 수 없습니다.!!!'
        }
    };

    return {
        setCurrentState: function(arg) {
            sharedData.currentState = arg;
        },
        getCurrentState: function() {
            return sharedData.currentState;
        },
        getSharedData: function() {
            return sharedData;
        },
        setFrom: function(from) {
            sharedData.from = from;
        },
        setUntil: function(until) {
            sharedData.until = until;
        },
        getFrom: function() {
            return sharedData.from;
        },
        getUntil: function() {
            return sharedData.until;
        },
        setSelect2model: function(data) {
            sharedData.select2model = data;
        },
        getSelect2model: function() {
            return sharedData.select2model;
        },
        setReportType: function(data) {
            sharedData.report_type = data;
        },
        getReportType: function() {
            return sharedData.report_type;
        },
        setGroupSize: function(size) {
            sharedData.group_size = size;
        },
        getGroupSize: function() {
            return sharedData.group_size;
        },
        getErrorCode: function(){
            return sharedData.errorCode;
        },
        setIsWorktime: function(isworktime) {
            sharedData.is_worktime = isworktime;
        },
        getIsWorktime: function() {
            return sharedData.is_worktime;
        },
        setWorkFrom: function(work_from) {
            sharedData.work_from = work_from;
        },
        setWorkUntil: function(work_until) {
            sharedData.work_until = work_until;
        },
        getWorkFrom: function() {
            return sharedData.work_from;
        },
        getWorkUntil: function() {
            return sharedData.work_until;
        },
        setPeriodType: function(period_type) {
            sharedData.period_type = period_type;
        },
        getPeriodType: function() {
            return sharedData.period_type;
        }
    };
});