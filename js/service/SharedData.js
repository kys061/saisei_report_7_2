reportApp.service('SharedData', function() {
    var sharedData = {};
    sharedData.currentDurationState = true;
    sharedData.currentBtnState = false;
    sharedData.currentState = true;
    sharedData.from;
    sharedData.until;
    sharedData.select2model;
    sharedData.report_type;
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
        }
    };
});