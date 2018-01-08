reportApp.service('ReportInterfaceData', function($window, $q, ReportData) {
    var InterfaceRate = function() {
        var self = this;
        this.q_intData = function(hostname, int_ext_name, int_int_name, from, until, duration, isset) {
            var deferred = $q.defer();
            var from = from;
            var until = until;
            var duration = duration;
            var complete_count = 0;
            if (isset) {
                ReportData.getIntRcvData(hostname, int_ext_name).then(function (data) {
                    complete_count += 1;
                    /**********************************/
                    /* RCV DATA OF INTERFACE          */
                    /**********************************/
                    /*
                     * 인터페이스 수신 데이터 변수
                     */
                    var label = [];
                    // var raw_label = [];
                    var data_rcv_rate = [];
                    // var raw_data_rcv_rate = [];
                    // init date vars
                    var int_date = [];
                    var int_cmp_date = [];
                    // init rcv data vars
                    var int_rcv_avg = [];
                    var int_rcv_max_data = [];
                    var int_rcv_duration_max_data = [];
                    var int_rcv_duration_max_date = [];
                    var rcv_tot = [];
                    var rcv_len = [];
                    /*
                     * 인터페이스 송신 데이터 변수
                     */
                    var data_trs_rate = [];
                    // var raw_data_trs_rate = [];
                    // init trs data vars
                    var int_trs_avg = [];
                    var int_trs_max_data = [];
                    var int_trs_duration_max_data = [];
                    var int_trs_duration_max_date = [];
                    var trs_tot = [];
                    var trs_len = [];
                    // setting interface data for table
                    var int_data = [];
                    //
                    var _history_length_rcv_rate = data['data']['collection'][0]['_history_length_receive_rate'];
                    var _history_rcv = data['data']['collection'][0]['_history_receive_rate'];
                    var int_name = data['data']['collection'][0]['name'];

                    // set date with from
                    var from_date = new $window.Sugar.Date(from);
                    var _from_date = new $window.Sugar.Date(from);

                    // add date
                    int_date.push(from_date.format("%F"));
                    int_cmp_date.push(_from_date.format("%m-%d"));


                    /**********************************/
                    /* make date array for compare date
                    /**********************************/
                    for (var j = 0; j < duration - 1; j++) {
                        int_date.push(from_date.addDays(1).format("%F").raw);
                        int_cmp_date.push(_from_date.addDays(1).format("%m-%d"));
                    }
                    /* make array
                       1. label : date,
                       2. data_rcv_rate : interface rcv,
                    */
                    for (var i = 0; i < _history_length_rcv_rate; i++) {
                        if (i % 20 === 0) {
                            var t = new Date(_history_rcv[i][0]);
                            label.push(t.toLocaleString());
                            data_rcv_rate.push((_history_rcv[i][1] * 0.001).toFixed(3));
                            // data_rcv_rate.push(Math.round(_history_rcv[i][1] * 0.001));
                        }
                        // raw_label.push(_history_rcv[i][0]);
                        // raw_data_rcv_rate.push(_history_rcv[i][1]);
                    }
                    /*
                       1. rcv_tot : total for interface rcv,
                       2. rcv_len : length for interface rcv,
                    */
                    for (var j = 0; j < duration; j++) {
                        rcv_tot.push(0);
                        rcv_len.push(0);
                        // int_rcv_max.push(0);
                        int_rcv_duration_max_data.push([]);
                        int_rcv_duration_max_date.push([]);
                    }
                    for (var j = 0; j < duration; j++) {
                        for (var i = 0; i < _history_length_rcv_rate; i++) {
                            if (int_cmp_date[j].raw === moment(_history_rcv[i][0]).format('MM-DD')) {
                                rcv_tot[j] += _history_rcv[i][1]*0.001;
                                rcv_len[j] += 1;
                                int_rcv_duration_max_data[j].push(_history_rcv[i][1]*0.001);
                                int_rcv_duration_max_date[j].push(_history_rcv[i][0]);
                            }
                        }
                    }
                    /* make average
                       1. int_rcv_avg : average for interface rcv
                    */
                    for (var j = 0; j < duration; j++) {
                        int_rcv_avg.push(rcv_tot[j] / rcv_len[j]);
                        console.log("RCV");
                        console.log(j, rcv_tot[j],rcv_len[j])
                    }
                    /* make max
                       1. int_rcv_max : max for interface rcv
                    */
                    for (var j = 0; j < duration; j++) {
                        int_rcv_max_data.push({
                            rcv_max_rate: Math.max.apply(null, int_rcv_duration_max_data[j]),
                            rcv_max_date: int_rcv_duration_max_date[j][int_rcv_duration_max_data[j].indexOf(Math.max.apply(null, int_rcv_duration_max_data[j]))]
                        });
                        // int_rcv_max_data.push(Math.max.apply(null, int_rcv_duration_max_data[j]));
                        console.log("RCV MAX");
                    }

                    // for interface graph
                    var labels = label;
                    var series = ['수신(단위:Mbit/s)', '송신(단위:Mbit/s)'];
                    var colors = ['#ff6384', '#45b7cd', '#ffe200'];
                    var datasetOverride = [{
                        yAxisID: 'y-axis-1'
                    }, {
                        yAxisID: 'y-axis-2'
                    }];
                    ReportData.getIntRcvData(hostname, int_int_name).then(function (data) {
                        complete_count += 1;
                        /**********************************/
                        /* TRS DATA OF INTERFACE          */
                        /**********************************/
                        // var _history_length_trs_rate = data['data']['collection'][0]['_history_length_transmit_rate'];
                        // var _history_trs = data['data']['collection'][0]['_history_transmit_rate'];
                        var _history_length_trs_rate = data['data']['collection'][0]['_history_length_receive_rate'];
                        var _history_trs = data['data']['collection'][0]['_history_receive_rate'];
                        /* make trs rate
                           1. data_trs_rate : total rate for trs interface
                        */
                        for (var i = 0; i < _history_length_trs_rate; i++) {
                            if (i % 20 === 0) {
                                data_trs_rate.push((_history_trs[i][1] * 0.001).toFixed(3));
                            }
                            // raw_data_trs_rate.push(_history_trs[i][1]);
                        }
                        /*
                           1. trs_tot : total for interface trs,
                           2. trs_len : length for interface trs,
                        */
                        for (var j = 0; j < duration; j++) {
                            trs_tot.push(0);
                            trs_len.push(0);
                            int_trs_duration_max_data.push([]);
                            int_trs_duration_max_date.push([]);
                        }
                        for (var j = 0; j < duration; j++) {
                            for (var i = 0; i < _history_length_trs_rate; i++) {
                                if (int_cmp_date[j].raw === moment(_history_trs[i][0]).format('MM-DD')) {
                                    trs_tot[j] += _history_trs[i][1]*0.001;
                                    trs_len[j] += 1;
                                    int_trs_duration_max_data[j].push(_history_trs[i][1]*0.001);
                                    int_trs_duration_max_date[j].push(_history_trs[i][0]);
                                    console.log(int_cmp_date[j].raw);

                                }
                            }
                        }
                        /* make average
                           1. int_trs_avg : average for interface rcv
                        */
                        for (var j = 0; j < duration; j++) {
                            int_trs_avg.push(trs_tot[j] / trs_len[j]);
                            console.log("TRS");
                            console.log(j, trs_tot[j],trs_len[j])
                        }
                        /* make max
                            1. int_rcv_max : max for interface rcv
                        */
                        for (var j = 0; j < duration; j++) {
                            console.log("trs_max_date_index", int_trs_duration_max_data[j].indexOf(Math.max.apply(null, int_trs_duration_max_data[j])), Math.max.apply(null, int_trs_duration_max_data[j]));
                            int_trs_max_data.push({
                                trs_max_rate: Math.max.apply(null, int_trs_duration_max_data[j]),
                                trs_max_date: int_trs_duration_max_date[j][int_trs_duration_max_data[j].indexOf(Math.max.apply(null, int_trs_duration_max_data[j]))]
                            });
                            console.log("TRS MAX");
                        }
                        /* make all data for interface to use table
                           1. int_data : date, rcv, trs
                        */
                        for (var k = 0; k < int_date.length; k++) {
                            console.log(int_rcv_avg[k]);
                            int_data.push({
                                date: int_date[k],
                                rcv_avg: (!isNaN(int_rcv_avg[k])) ? int_rcv_avg[k].toFixed(3):0,
                                trs_avg: (!isNaN(int_trs_avg[k])) ? int_trs_avg[k].toFixed(3):0,
                                rcv_max: (!isNaN(int_rcv_max_data[k].rcv_max_rate)) ? int_rcv_max_data[k].rcv_max_rate.toFixed(3):0,
                                rcv_max_date: (!isNaN(int_rcv_max_data[k].rcv_max_date  && int_rcv_max_data[k].rcv_max_rate !== 0 )) ? (new Date(int_rcv_max_data[k].rcv_max_date)).toLocaleString():'none',
                                trs_max: (!isNaN(int_trs_max_data[k].trs_max_rate)) ? int_trs_max_data[k].trs_max_rate.toFixed(3):0,
                                trs_max_date: (!isNaN(int_trs_max_data[k].trs_max_date) && int_trs_max_data[k].trs_max_rate !== 0 ) ? (new Date(int_trs_max_data[k].trs_max_date)).toLocaleString():'none'
                            });
                        }
                        console.log('int_data');
                        console.log(int_data);
                        // interface rate for graph
                        var intGrpData = [
                            data_rcv_rate,
                            data_trs_rate
                        ];
                        console.log(data_rcv_rate, data_trs_rate);
                        // get max for y-axis
                        var int_rcv_max = Math.max.apply(null, data_rcv_rate);
                        var int_trs_max = Math.max.apply(null, data_trs_rate);
                        var int_max = Math.max.apply(null, [int_rcv_max, int_trs_max]);

                        console.log(int_max);

                        var option_max = Math.round(int_max);
                        // set options for grp
                        var options = {
                            scales: {
                                yAxes: [{
                                    id: 'y-axis-1',
                                    type: 'linear',
                                    display: true,
                                    position: 'left',
                                    scaleLabel: {
                                        display: true,
                                        fontSize: 14,
                                        labelString: '수신(Mbit/s)',
                                        fontStyle: "bold"
                                    },
                                    ticks: {
                                        // max: Math.ceil(int_max * 0.001) * 1000,
                                        max: option_max,
                                        min: 0,
                                        beginAtZero: true,
                                        fontSize: 12,
                                        fontStyle: "bold"
                                    }
                                },
                                    {
                                        id: 'y-axis-2',
                                        type: 'linear',
                                        display: true,
                                        position: 'right',
                                        scaleLabel: {
                                            display: true,
                                            fontSize: 14,
                                            labelString: '송신(Mbit/s)',
                                            fontStyle: "bold"
                                        },
                                        ticks: {
                                            // max: Math.ceil(int_max * 0.001) * 1000,
                                            max: option_max,
                                            min: 0,
                                            beginAtZero: true,
                                            fontSize: 12,
                                            fontStyle: "bold"
                                        }
                                    }
                                ],
                                xAxes: [{
                                    ticks: {
                                        fontSize: 12,
                                        fontStyle: "bold"
                                    },
                                    scaleLabel: {
                                        display: true,
                                        fontSize: 14,
                                        labelString: '시간',
                                        fontStyle: "bold"
                                    }
                                }]
                            }
                        };
                        deferred.resolve({
                            data: intGrpData,
                            labels: labels,
                            series: series,
                            colors: colors,
                            options: options,
                            datasetOverride: datasetOverride,
                            int_data: int_data,
                            int_name: int_name,
                            complete_count: complete_count
                        });
                    });
                });
            }
            return deferred.promise;
        };
        // this.q_intDataWithSpan = function(hostname, int_name, from, until, duration, isset) {
        //     var deferred = $q.defer();
        //     var from = from;
        //     var until = until;
        //     var duration = duration;
        //     var complete_count = 0;
        //     if (isset) {
        //         ReportData.getIntRcvData(hostname, int_name).then(function (data) {
        //             complete_count += 1;
        //             /**********************************/
        //             /* RCV DATA OF INTERFACE          */
        //             /**********************************/
        //             /*
        //              * 인터페이스 수신 데이터 변수
        //              */
        //             var label = [];
        //             // var raw_label = [];
        //             var data_rcv_rate = [];
        //             // var raw_data_rcv_rate = [];
        //             // init date vars
        //             var int_date = [];
        //             var int_cmp_date = [];
        //             // init rcv data vars
        //             var int_rcv_avg = [];
        //             var int_rcv_max_data = [];
        //             var int_rcv_duration_max_data = [];
        //             var int_rcv_duration_max_date = [];
        //             var rcv_tot = [];
        //             var rcv_len = [];
        //             /*
        //              * 인터페이스 송신 데이터 변수
        //              */
        //             var data_trs_rate = [];
        //             // var raw_data_trs_rate = [];
        //             // init trs data vars
        //             var int_trs_avg = [];
        //             var int_trs_max_data = [];
        //             var int_trs_duration_max_data = [];
        //             var int_trs_duration_max_date = [];
        //             var trs_tot = [];
        //             var trs_len = [];
        //             // setting interface data for table
        //             var int_data = [];
        //             //
        //             var _history_length_rcv_rate = data['data']['collection'][0]['_history_length_receive_rate'];
        //             var _history_rcv = data['data']['collection'][0]['_history_receive_rate'];
        //             var int_name = data['data']['collection'][0]['name'];
        //
        //             // set date with from
        //             var from_date = new $window.Sugar.Date(from);
        //             var _from_date = new $window.Sugar.Date(from);
        //
        //             // add date
        //             int_date.push(from_date.format("%F"));
        //             int_cmp_date.push(_from_date.format("%m-%d"));
        //
        //
        //             /**********************************/
        //             /* make date array for compare date
        //             /**********************************/
        //             for (var j = 0; j < duration - 1; j++) {
        //                 int_date.push(from_date.addDays(1).format("%F").raw);
        //                 int_cmp_date.push(_from_date.addDays(1).format("%m-%d"));
        //             }
        //             /* make array
        //                1. label : date,
        //                2. data_rcv_rate : interface rcv,
        //             */
        //             for (var i = 0; i < _history_length_rcv_rate; i++) {
        //                 if (i % 20 === 0) {
        //                     var t = new Date(_history_rcv[i][0]);
        //                     label.push(t.toLocaleString());
        //                     data_rcv_rate.push((_history_rcv[i][1] * 0.001).toFixed(3));
        //                     // data_rcv_rate.push(Math.round(_history_rcv[i][1] * 0.001));
        //                 }
        //                 // raw_label.push(_history_rcv[i][0]);
        //                 // raw_data_rcv_rate.push(_history_rcv[i][1]);
        //             }
        //             /*
        //                1. rcv_tot : total for interface rcv,
        //                2. rcv_len : length for interface rcv,
        //             */
        //             for (var j = 0; j < duration; j++) {
        //                 rcv_tot.push(0);
        //                 rcv_len.push(0);
        //                 // int_rcv_max.push(0);
        //                 int_rcv_duration_max_data.push([]);
        //                 int_rcv_duration_max_date.push([]);
        //             }
        //             for (var j = 0; j < duration; j++) {
        //                 for (var i = 0; i < _history_length_rcv_rate; i++) {
        //                     if (int_cmp_date[j].raw === moment(_history_rcv[i][0]).format('MM-DD')) {
        //                         rcv_tot[j] += _history_rcv[i][1]*0.001;
        //                         rcv_len[j] += 1;
        //                         int_rcv_duration_max_data[j].push(_history_rcv[i][1]*0.001);
        //                         int_rcv_duration_max_date[j].push(_history_rcv[i][0]);
        //                     }
        //                 }
        //             }
        //             /* make average
        //                1. int_rcv_avg : average for interface rcv
        //             */
        //             for (var j = 0; j < duration; j++) {
        //                 int_rcv_avg.push(rcv_tot[j] / rcv_len[j]);
        //                 console.log("RCV");
        //                 console.log(j, rcv_tot[j],rcv_len[j])
        //             }
        //             /* make max
        //                1. int_rcv_max : max for interface rcv
        //             */
        //             for (var j = 0; j < duration; j++) {
        //                 int_rcv_max_data.push({
        //                     rcv_max_rate: Math.max.apply(null, int_rcv_duration_max_data[j]),
        //                     rcv_max_date: int_rcv_duration_max_date[j][int_rcv_duration_max_data[j].indexOf(Math.max.apply(null, int_rcv_duration_max_data[j]))]
        //                 });
        //                 // int_rcv_max_data.push(Math.max.apply(null, int_rcv_duration_max_data[j]));
        //                 console.log("RCV MAX");
        //             }
        //
        //             // for interface graph
        //             var labels = label;
        //             var series = ['수신(단위:Mbit/s)', '송신(단위:Mbit/s)'];
        //             var colors = ['#ff6384', '#45b7cd', '#ffe200'];
        //             var datasetOverride = [{
        //                 yAxisID: 'y-axis-1'
        //             }, {
        //                 yAxisID: 'y-axis-2'
        //             }];
        //             ReportData.getIntTrsData(hostname, int_name).then(function (data) {
        //                 complete_count += 1;
        //                 /**********************************/
        //                 /* TRS DATA OF INTERFACE          */
        //                 /**********************************/
        //                 var _history_length_trs_rate = data['data']['collection'][0]['_history_length_transmit_rate'];
        //                 var _history_trs = data['data']['collection'][0]['_history_transmit_rate'];
        //                 /* make trs rate
        //                    1. data_trs_rate : total rate for trs interface
        //                 */
        //                 for (var i = 0; i < _history_length_trs_rate; i++) {
        //                     if (i % 20 === 0) {
        //                         data_trs_rate.push((_history_trs[i][1] * 0.001).toFixed(3));
        //                     }
        //                     // raw_data_trs_rate.push(_history_trs[i][1]);
        //                 }
        //                 /*
        //                    1. trs_tot : total for interface trs,
        //                    2. trs_len : length for interface trs,
        //                 */
        //                 for (var j = 0; j < duration; j++) {
        //                     trs_tot.push(0);
        //                     trs_len.push(0);
        //                     int_trs_duration_max_data.push([]);
        //                     int_trs_duration_max_date.push([]);
        //                 }
        //                 for (var j = 0; j < duration; j++) {
        //                     for (var i = 0; i < _history_length_trs_rate; i++) {
        //                         if (int_cmp_date[j].raw === moment(_history_trs[i][0]).format('MM-DD')) {
        //                             trs_tot[j] += _history_trs[i][1]*0.001;
        //                             trs_len[j] += 1;
        //                             int_trs_duration_max_data[j].push(_history_trs[i][1]*0.001);
        //                             int_trs_duration_max_date[j].push(_history_trs[i][0]);
        //                             console.log(int_cmp_date[j].raw);
        //
        //                         }
        //                     }
        //                 }
        //                 /* make average
        //                    1. int_trs_avg : average for interface rcv
        //                 */
        //                 for (var j = 0; j < duration; j++) {
        //                     int_trs_avg.push(trs_tot[j] / trs_len[j]);
        //                     console.log("TRS");
        //                     console.log(j, trs_tot[j],trs_len[j])
        //                 }
        //                 /* make max
        //                     1. int_rcv_max : max for interface rcv
        //                 */
        //                 for (var j = 0; j < duration; j++) {
        //                     console.log("trs_max_date_index", int_trs_duration_max_data[j].indexOf(Math.max.apply(null, int_trs_duration_max_data[j])), Math.max.apply(null, int_trs_duration_max_data[j]));
        //                     int_trs_max_data.push({
        //                         trs_max_rate: Math.max.apply(null, int_trs_duration_max_data[j]),
        //                         trs_max_date: int_trs_duration_max_date[j][int_trs_duration_max_data[j].indexOf(Math.max.apply(null, int_trs_duration_max_data[j]))]
        //                     });
        //                     console.log("TRS MAX");
        //                 }
        //                 /* make all data for interface to use table
        //                    1. int_data : date, rcv, trs
        //                 */
        //                 for (var k = 0; k < int_date.length; k++) {
        //                     console.log(int_rcv_avg[k]);
        //                     int_data.push({
        //                         date: int_date[k],
        //                         rcv_avg: (!isNaN(int_rcv_avg[k])) ? int_rcv_avg[k].toFixed(3):0,
        //                         trs_avg: (!isNaN(int_trs_avg[k])) ? int_trs_avg[k].toFixed(3):0,
        //                         rcv_max: (!isNaN(int_rcv_max_data[k].rcv_max_rate)) ? int_rcv_max_data[k].rcv_max_rate.toFixed(3):0,
        //                         rcv_max_date: (!isNaN(int_rcv_max_data[k].rcv_max_date  && int_rcv_max_data[k].rcv_max_rate !== 0 )) ? (new Date(int_rcv_max_data[k].rcv_max_date)).toLocaleString():'none',
        //                         trs_max: (!isNaN(int_trs_max_data[k].trs_max_rate)) ? int_trs_max_data[k].trs_max_rate.toFixed(3):0,
        //                         trs_max_date: (!isNaN(int_trs_max_data[k].trs_max_date) && int_trs_max_data[k].trs_max_rate !== 0 ) ? (new Date(int_trs_max_data[k].trs_max_date)).toLocaleString():'none'
        //                     });
        //                 }
        //                 console.log('int_data');
        //                 console.log(int_data);
        //                 // interface rate for graph
        //                 var intGrpData = [
        //                     data_rcv_rate,
        //                     data_trs_rate
        //                 ];
        //                 console.log(data_rcv_rate, data_trs_rate);
        //                 // get max for y-axis
        //                 var int_rcv_max = Math.max.apply(null, data_rcv_rate);
        //                 var int_trs_max = Math.max.apply(null, data_trs_rate);
        //                 var int_max = Math.max.apply(null, [int_rcv_max, int_trs_max]);
        //
        //                 console.log(int_max);
        //
        //                 var option_max = Math.round(int_max);
        //                 // set options for grp
        //                 var options = {
        //                     scales: {
        //                         yAxes: [{
        //                             id: 'y-axis-1',
        //                             type: 'linear',
        //                             display: true,
        //                             position: 'left',
        //                             scaleLabel: {
        //                                 display: true,
        //                                 fontSize: 14,
        //                                 labelString: '수신(Mbit/s)',
        //                                 fontStyle: "bold"
        //                             },
        //                             ticks: {
        //                                 // max: Math.ceil(int_max * 0.001) * 1000,
        //                                 max: option_max,
        //                                 min: 0,
        //                                 beginAtZero: true,
        //                                 fontSize: 12,
        //                                 fontStyle: "bold"
        //                             }
        //                         },
        //                             {
        //                                 id: 'y-axis-2',
        //                                 type: 'linear',
        //                                 display: true,
        //                                 position: 'right',
        //                                 scaleLabel: {
        //                                     display: true,
        //                                     fontSize: 14,
        //                                     labelString: '송신(Mbit/s)',
        //                                     fontStyle: "bold"
        //                                 },
        //                                 ticks: {
        //                                     // max: Math.ceil(int_max * 0.001) * 1000,
        //                                     max: option_max,
        //                                     min: 0,
        //                                     beginAtZero: true,
        //                                     fontSize: 12,
        //                                     fontStyle: "bold"
        //                                 }
        //                             }
        //                         ],
        //                         xAxes: [{
        //                             ticks: {
        //                                 fontSize: 12,
        //                                 fontStyle: "bold"
        //                             },
        //                             scaleLabel: {
        //                                 display: true,
        //                                 fontSize: 14,
        //                                 labelString: '시간',
        //                                 fontStyle: "bold"
        //                             }
        //                         }]
        //                     }
        //                 };
        //                 deferred.resolve({
        //                     data: intGrpData,
        //                     labels: labels,
        //                     series: series,
        //                     colors: colors,
        //                     options: options,
        //                     datasetOverride: datasetOverride,
        //                     int_data: int_data,
        //                     int_name: int_name,
        //                     complete_count: complete_count
        //                 });
        //             });
        //         });
        //     }
        //     return deferred.promise;
        // };
    };
    return InterfaceRate;
});