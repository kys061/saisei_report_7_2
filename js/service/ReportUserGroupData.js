reportApp.service('ReportUserGroupData', function($window, $q, _, ReportData, UserInGroupData, SharedData) {
    var UserGroupData = function() {
        var self = this;
        // this.q_userAppData = function(){
        //     var deferred = $q.defer();
        //
        // };
        this.q_userGroupData = function(hostname, from, until, duration, isset) {
            var deferred = $q.defer();
            var from = from;
            var until = until;
            var duration = duration;
            var complete_count = 0;
            if (isset) {
                ReportData.getUserGroupSize(hostname).then(function (size) {
                    complete_count += 1;
                    console.log(size.group_size);
                    // SharedData.setGroupSize(size.group_size);
                    ReportData.getUserGroupActiveFlows(hostname, size.group_size).then(function(group_flow_data){
                        complete_count += 1;
                        var _history_user_group_active_flows_data = group_flow_data['data']['collection'];
                        var user_group_act_flow_max_data = [];

                        _.each(_history_user_group_active_flows_data, function(collection) {

                            user_group_act_flow_max_data.push(_.max(collection['_history_active_flows'], function(history_active_flows){
                                return history_active_flows[1];
                            }));
                        });
                        // data : users_act_flow_max_data
                        // elem : element
                        // index : index of element
                        _.each(user_group_act_flow_max_data, function(elem, index, data){
                            var t = new Date(elem[0]);
                            elem.push(t.toLocaleString());
                        });

                        ReportData.getUserGroupData(hostname, size.group_size).then(function (data) {
                            complete_count += 1;
                            // console.log(data);
                            // for users data
                            var _user_group_label = [];
                            var _user_group_from = [];
                            var _user_group_until = [];
                            var _user_group_series = ['다운로드 사용량(Mbit/s)', '업로드 사용량(Mbit/s)'];
                            var _user_group_flow_disc_series = ['플로우 사용량(/s)', '제어량(/s)'];
                            var _user_group_total = [];
                            var _user_group_download = [];
                            var _user_group_upload = [];
                            var _user_group_active_flows = [];
                            var _user_group_packet_disc = [];
                            var _user_group_packet_disc_rate = [];
                            var _user_group_tb_data = [];
                            var _user_group_data = [];
                            var _user_group_flow_disc_data = [];
                            var _user_group_colors = ['#ff6384', '#45b7cd', '#ffe200'];
                            /*
                                1. user group name(label)
                                2. user group from
                                3. user group until
                                4. user group total
                                5. user group download
                                6. user group upload
                                7. user group active flow
                                8. user group packet discard rate
                                9. user group tb_data
                                10. user group graph_data
                                11. user group graph option
                             */
                            var _user_groups = data['data']['collection'];
                            var _user_group_size = data['data']['size'];
                            _(_user_groups).each(function(elem, index){
                                // console.log(elem);
                                // console.log(elem.name);
                                _user_group_label.push(elem.name);
                                var user_group_from = new Date(elem.from);
                                user_group_from.setHours(user_group_from.getHours() + 9);
                                _user_group_from.push(user_group_from.toLocaleString());
                                var user_group_until = new Date(elem.until);
                                user_group_until.setHours(user_group_until.getHours() + 9);
                                _user_group_until.push(user_group_until.toLocaleString());
                                _user_group_total.push((elem.total_rate * 0.001).toFixed(3));
                                _user_group_download.push((elem.dest_rate * 0.001).toFixed(3));
                                _user_group_upload.push((elem.source_rate * 0.001).toFixed(3));
                                _user_group_active_flows.push(elem.active_flows);
                                _user_group_packet_disc_rate.push(elem.packet_discard_rate);
                                _user_group_packet_disc.push(elem.packets_discarded);
                                _user_group_tb_data.push({
                                    name: elem.name,
                                    from: user_group_from.toLocaleString(),
                                    until: user_group_until.toLocaleString(),
                                    total: (elem.total_rate * 0.001).toFixed(3),
                                    down: (elem.dest_rate * 0.001).toFixed(3),
                                    up: (elem.source_rate * 0.001).toFixed(3),
                                    flows: elem.active_flows,
                                    // max_flows: users_act_flow_max_data,
                                    disc_rate: elem.packet_discard_rate,
                                    pack_disc: elem.packets_discarded
                                });
                            });
                            // _user_group_data.push(_user_group_total);
                            _user_group_data.push(_user_group_download);
                            _user_group_data.push(_user_group_upload);
                            console.log("user_group_act_flow_max_data", user_group_act_flow_max_data);
                            _.each(_user_group_tb_data, function(e, i){
                                _.each(user_group_act_flow_max_data, function(elem, index){
                                    if (index === i) {
                                        _.extend(e, {max_flows: elem[1]}, {max_flows_time: elem[2]});
                                    }
                                });
                            });
                            var _user_group_option = {
                                scales: {
                                    yAxes: [{
                                        ticks: {
                                            fontSize: 12,
                                            fontStyle: "bold"
                                        },
                                        scaleLabel: {
                                            display: true,
                                            fontSize: 14,
                                            labelString: '사용자 그룹',
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
                                            labelString: '트래픽 사용량(Mbit/s)',
                                            fontStyle: "bold"
                                        }
                                    }]
                                }
                            };

                            // http://10.161.147.55:5000/rest/stm/configurations/running/user_groups/net_10.10.0.0_16/users/
                            // ?token=1&order=%3Ename&start=0&limit=10&select=name%2Ctotal_rate%2Cactive_flows&operation=auto
                            // &from=21%3A00%3A00_20171201&until=08%3A00%3A00_20171202
                            // http://10.161.147.55:5000/rest/stm/configurations/running/user_groups/net_106.249.20.0_22/users/
                            // ?token=1&order=%3Etotal_rate&start=0&limit=10&select=name%2Csource_rate%2Cdest_rate%2Ctotal_rate%2Cactive_flows%2Cpacket_discard_rate%2Cpackets_discarded%2Cdescription
                            // &operation=auto&from=15%3A00%3A00_20171201&until=08%3A00%3A00_20171202
                            // for table
                            var _user_in_group_tb = [];
                            var _group_name_tb = [];
                            // for graph
                            var _user_in_group_tr_top1=[], _user_in_group_tr_top2=[], _user_in_group_tr_top3=[],
                                _user_in_group_tr_top4=[], _user_in_group_tr_top5=[];
                            var _user_in_group_top1_dataset=[], _user_in_group_top2_dataset=[],_user_in_group_top3_dataset=[],
                                _user_in_group_top4_dataset=[],_user_in_group_top5_dataset=[];
                            var _user_in_group_label = [];
                            var user_names_inGroup = [];
                            var _user_inGroup_tr_top1 = [];
                            var user_inGroup_tb_count=0;
                            var _user_in_group_tb_count=0;
                            _(_user_group_label).each(function(elem, index) {
                                complete_count += 1;
                                /*
                                    1. top1_user_app1_from, top1_user_app1_until
                                    2. top1_user_app2_from, top1_user_app2_until
                                    3. top1_user_app3_from, top1_user_app3_until
                                    4. _users_app : user_app all data for table
                                    5. _users_app_top1, _users_app_top2, _users_app_top3 : app total rate data for graph
                                    6. _users_appName_top1, _users_appName_top2, _users_appName_top3 : app name for graph
                                    7. _users_app_label : user name and app name for graph
                                    8. _users_app_option : options for graph
                                */
                                _group_name_tb.push(elem);
                                // elem: group_name
                                // ReportData.getUserActiveFlows(hostname, elem).then(function(user_in_group_flow_data){
                                //     var _history_user_group_active_flows_data = group_flow_data['data']['collection'];
                                //     var user_group_act_flow_max_data = [];
                                //
                                //     _.each(_history_user_group_active_flows_data, function(collection) {
                                //
                                //         user_group_act_flow_max_data.push(_.max(collection['_history_active_flows'], function(history_active_flows){
                                //             return history_active_flows[1];
                                //         }));
                                //     });
                                //     // data : users_act_flow_max_data
                                //     // elem : element
                                //     // index : index of element
                                //     _.each(user_group_act_flow_max_data, function(elem, index, data){
                                //         var t = new Date(elem[0]);
                                //         elem.push(t.toLocaleString());
                                //     });
                                // });
                                // elem: group_name
                                // 1. 그룹내에 유저 데이터를 가져온다(그룹 사이즈 만큼의 각 그룹 전체 데이터(total, down, up 등등))
                                UserInGroupData.getUserInGroupData(hostname, elem).then(function(data) {
                                    //parsing here
                                    // console.log("그룹내 유저 데이터 시작");
                                    // console.log(data['data']['collection']);
                                    // console.log(data);
                                    // for table
                                    var top1_user_from, top2_user_from, top3_user_from, top4_user_from, top5_user_from;
                                    var top1_user_until, top2_user_until, top3_user_until, top4_user_until, top5_user_until;
                                    var top1_user_name, top2_user_name, top3_user_name,top4_user_name,top5_user_name;
                                    var top1_user_total,top2_user_total,top3_user_total,top4_user_total,top5_user_total;
                                    var top1_user_down,top2_user_down,top3_user_down,top4_user_down,top5_user_down;
                                    var top1_user_up,top2_user_up,top3_user_up,top4_user_up,top5_user_up;
                                    var top1_user_active_flow,top2_user_active_flow,top3_user_active_flow,top4_user_active_flow,top5_user_active_flow;
                                    var top1_user_packet_disc_rate,top2_user_packet_disc_rate,top3_user_packet_disc_rate,top4_user_packet_disc_rate,top5_user_packet_disc_rate;
                                    var top1_user_packet_disc,top2_user_packet_disc,top3_user_packet_disc,top4_user_packet_disc,top5_user_packet_disc;
                                    var top1_user_max_flow_data, top2_user_max_flow_data, top3_user_max_flow_data, top4_user_max_flow_data, top5_user_max_flow_data;
                                    var top1_user_max_flow, top2_user_max_flow, top3_user_max_flow, top4_user_max_flow, top5_user_max_flow;
                                    var top1_user_max_flow_time,top2_user_max_flow_time,top3_user_max_flow_time,top4_user_max_flow_time,top5_user_max_flow_time;
                                    // for user app
                                    var top1_user_app1_name, top1_user_app2_name, top1_user_app3_name;
                                    var top1_user_app1_total, top1_user_app2_total, top1_user_app3_total;
                                    var top2_user_app1_name, top2_user_app2_name, top2_user_app3_name;
                                    var top2_user_app1_total, top2_user_app2_total, top2_user_app3_total;
                                    var top3_user_app1_name, top3_user_app2_name, top3_user_app3_name;
                                    var top3_user_app1_total, top3_user_app2_total, top3_user_app3_total;
                                    var top4_user_app1_name, top4_user_app2_name, top4_user_app3_name;
                                    var top4_user_app1_total, top4_user_app2_total, top4_user_app3_total;
                                    var top5_user_app1_name, top5_user_app2_name, top5_user_app3_name;
                                    var top5_user_app1_total, top5_user_app2_total, top5_user_app3_total;
                                    // 테이블에 들어갈 탑 유저 데이터 준비를 위한 배열
                                    var top_user_data = [];
                                    var top_user_app = [];
                                    var resolve_cnt = 0;
                                    var makeTableData = function(){
                                        return $q(function(resolve, reject){
                                            if (data['data']['collection'].length !== 0){
                                                _(data['data']['collection']).each(function(e, i){
                                                    complete_count += 2;
                                                    if(i===0) {
                                                        complete_count += 2;
                                                        // 1. elem(그룹이름)에 존재하는 각각 유저의 히스토리 active flows의 데이터를 가져온다.
                                                        // 2. elem(그룹이름)에 존재하는 각각 유저의 top5 app의 데이터를 가져온다.
                                                        UserInGroupData.getUserInGroupActiveFlows(hostname, e['name']).then(function(user_in_group_flow_data){
                                                            UserInGroupData.getUserInGroupAppData(hostname, e['name']).then(function(user_in_group_app_data){
                                                                // top 1 데이터
                                                                // name, total, down, up, act flow, pkt disc rate, max flow, max flow time
                                                                // top1 app, top2 app, top3 app
                                                                try {
                                                                    top1_user_from = new Date(e['from']);
                                                                    top1_user_from.setHours(top1_user_from.getHours() + 9);
                                                                    top1_user_from = top1_user_from.toLocaleString();
                                                                    top1_user_until = new Date(e['until']);
                                                                    top1_user_until.setHours(top1_user_until.getHours() + 9);
                                                                    top1_user_until = top1_user_until.toLocaleString();
                                                                } catch(exception) {top1_user_from = 'None'; top1_user_until='None'}
                                                                try { top1_user_name = e['name'];} catch(exception) { top1_user_name = 'None' }
                                                                try { top1_user_total = (e['total_rate'] * 0.001).toFixed(3);} catch(exception) { top1_user_total = 0 }
                                                                try { top1_user_down = (e['dest_rate'] * 0.001).toFixed(3);} catch(exception) { top1_user_down = 0 }
                                                                try { top1_user_up = (e['source_rate'] * 0.001).toFixed(3);} catch(exception) { top1_user_up = 0 }
                                                                try { top1_user_active_flow = e['active_flows']; } catch(exception) { top1_user_active_flow = 0 }
                                                                try { top1_user_packet_disc_rate = e['packet_discard_rate']; } catch(exception) { top1_user_packet_disc_rate = 0 }
                                                                try { top1_user_packet_disc = e['packets_discarded']; } catch(exception) { top1_user_packet_disc = 0 }
                                                                try {
                                                                    // console.log(user_in_group_flow_data);
                                                                    var _history_user_in_group_active_flows_data = user_in_group_flow_data['data']['collection'][0]['_history_active_flows'];
                                                                    top1_user_max_flow_data=_.max(_history_user_in_group_active_flows_data,
                                                                        function (history_user_in_grp_active_flows) {
                                                                            return history_user_in_grp_active_flows[1];
                                                                        });
                                                                    top1_user_max_flow = top1_user_max_flow_data[1];
                                                                    top1_user_max_flow_time = (new Date(top1_user_max_flow_data[0])).toLocaleString();
                                                                } catch(exception) {
                                                                    top1_user_max_flow = 0; top1_user_max_flow_time = "none";
                                                                }
                                                                try {
                                                                    var top1_user_app1_from = new Date(user_in_group_app_data['data']['collection'][0]['from']);
                                                                    top1_user_app1_from.setHours(top1_user_app1_from.getHours() + 9);
                                                                    var top1_user_app1_until = new Date(user_in_group_app_data['data']['collection'][0]['until']);
                                                                    top1_user_app1_until.setHours(top1_user_app1_until.getHours() + 9);
                                                                } catch(exception){
                                                                    var top1_user_app1_from = "None";
                                                                    var top1_user_app1_until = "None";
                                                                }
                                                                try {
                                                                    var top1_user_app2_from = new Date(user_in_group_app_data['data']['collection'][1]['from']);
                                                                    top1_user_app2_from.setHours(top1_user_app2_from.getHours() + 9);
                                                                    var top1_user_app2_until = new Date(user_in_group_app_data['data']['collection'][1]['until']);
                                                                    top1_user_app2_until.setHours(top1_user_app2_until.getHours() + 9);
                                                                } catch(exception){
                                                                    var top1_user_app2_from = "None";
                                                                    var top1_user_app2_until = "None";
                                                                }
                                                                try {
                                                                    var top1_user_app3_from = new Date(user_in_group_app_data['data']['collection'][2]['from']);
                                                                    top1_user_app3_from.setHours(top1_user_app3_from.getHours() + 9);
                                                                    var top1_user_app3_until = new Date(user_in_group_app_data['data']['collection'][2]['until']);
                                                                    top1_user_app3_until.setHours(top1_user_app3_until.getHours() + 9);
                                                                } catch(exception){
                                                                    var top1_user_app3_from = "None";
                                                                    var top1_user_app3_until = "None";
                                                                }
                                                                try { top1_user_app1_name = user_in_group_app_data['data']['collection'][0]['name'];} catch(exception) { top1_user_app1_name = 'None' }
                                                                try { top1_user_app1_total = (user_in_group_app_data['data']['collection'][0]['total_rate'] * 0.001).toFixed(3);} catch(exception) { top1_user_app1_total = 0 }
                                                                try { top1_user_app2_name = user_in_group_app_data['data']['collection'][1]['name'];} catch(exception) { top1_user_app2_name = 'None' }
                                                                try { top1_user_app2_total = (user_in_group_app_data['data']['collection'][1]['total_rate'] * 0.001).toFixed(3);} catch(exception) { top1_user_app2_total = 0 }
                                                                try { top1_user_app3_name = user_in_group_app_data['data']['collection'][2]['name'];} catch(exception) { top1_user_app3_name = 'None' }
                                                                try { top1_user_app3_total = (user_in_group_app_data['data']['collection'][2]['total_rate'] * 0.001).toFixed(3);} catch(exception) { top1_user_app3_total = 0 }
                                                                // 테이블에 들어갈 탑 유저 데이터 준비
                                                                top_user_data.push({
                                                                    "top_user_name": (data['data']['collection'].length !== 0) ? top1_user_name:"None",
                                                                    "top_user_total": (data['data']['collection'].length !== 0) ? top1_user_total:0,
                                                                    "top_user_down": (data['data']['collection'].length !== 0) ? top1_user_down:0,
                                                                    "top_user_up": (data['data']['collection'].length !== 0) ? top1_user_up:0,
                                                                    "top_user_active_flow": (data['data']['collection'].length !== 0) ? top1_user_active_flow:0,
                                                                    "top_user_packet_disc_rate": (data['data']['collection'].length !== 0) ? top1_user_packet_disc_rate:0,
                                                                    "top_user_packet_disc": (data['data']['collection'].length !== 0) ? top1_user_packet_disc:0,
                                                                    "top_user_max_flow" : (data['data']['collection'].length !== 0) ? top1_user_max_flow:0,
                                                                    "top_user_max_flow_time" : (data['data']['collection'].length !== 0) ? top1_user_max_flow_time:0,
                                                                    // "top1_user_name": (data['data']['collection'].length !== 0) ? data['data']['collection'][0]['name']:"None",
                                                                    // "top1_user_total": (data['data']['collection'].length !== 0) ? (data['data']['collection'][0]['total_rate'] * 0.001).toFixed(3):0,
                                                                    "top_user_from": (data['data']['collection'].length !== 0) ? top1_user_from:"None",
                                                                    "top_user_until": (data['data']['collection'].length !== 0) ? top1_user_until:"None",
                                                                    "top_user_app1_name": top1_user_app1_name,
                                                                    "top_user_app1_total": top1_user_app1_total,
                                                                    "top_user_app1_from": top1_user_app1_from.toLocaleString(),
                                                                    "top_user_app1_until": top1_user_app1_until.toLocaleString(),
                                                                    "top_user_app2_name": top1_user_app2_name,
                                                                    "top_user_app2_total": top1_user_app2_total,
                                                                    "top_user_app2_from": top1_user_app2_from.toLocaleString(),
                                                                    "top_user_app2_until": top1_user_app2_until.toLocaleString(),
                                                                    "top_user_app3_name": top1_user_app3_name,
                                                                    "top_user_app3_total": top1_user_app3_total,
                                                                    "top_user_app3_from": top1_user_app3_from.toLocaleString(),
                                                                    "top_user_app3_until": top1_user_app3_until.toLocaleString()
                                                                });
                                                                resolve("sucess make table data!");
                                                                resolve_cnt += 1;
                                                            });
                                                        });
                                                    }
                                                    if(i===1) {
                                                        complete_count += 2;
                                                        UserInGroupData.getUserInGroupActiveFlows(hostname, e['name']).then(function(user_in_group_flow_data){
                                                            UserInGroupData.getUserInGroupAppData(hostname, e['name']).then(function(user_in_group_app_data){
                                                                try {
                                                                    top2_user_from = new Date(e['from']);
                                                                    top2_user_from.setHours(top2_user_from.getHours() + 9);
                                                                    top2_user_from = top2_user_from.toLocaleString();
                                                                    top2_user_until = new Date(e['until']);
                                                                    top2_user_until.setHours(top2_user_until.getHours() + 9);
                                                                    top2_user_until = top2_user_until.toLocaleString();

                                                                } catch(exception) {top2_user_from = 'None'; top2_user_until='None'}
                                                                try { top2_user_name = e['name'];} catch(exception) { top2_user_name = 'None' }
                                                                try { top2_user_total = (e['total_rate'] * 0.001).toFixed(3);} catch(exception) { top2_user_total = 0 }
                                                                try { top2_user_down = (e['dest_rate'] * 0.001).toFixed(3);} catch(exception) { top2_user_total = 0 }
                                                                try { top2_user_up = (e['source_rate'] * 0.001).toFixed(3);} catch(exception) { top2_user_total = 0 }
                                                                try { top2_user_active_flow = e['active_flows']; } catch(exception) { top2_user_total = 0 }
                                                                try { top2_user_packet_disc_rate = e['packet_discard_rate']; } catch(exception) { top2_user_total = 0 }
                                                                try { top2_user_packet_disc = e['packets_discarded']; } catch(exception) { top2_user_packet_disc = 0 }
                                                                try {
                                                                    // console.log(user_in_group_flow_data);
                                                                    var _history_user_in_group_active_flows_data = user_in_group_flow_data['data']['collection'][0]['_history_active_flows'];
                                                                    top2_user_max_flow_data=_.max(_history_user_in_group_active_flows_data,
                                                                        function (history_user_in_grp_active_flows) {
                                                                            return history_user_in_grp_active_flows[1];
                                                                        });
                                                                    top2_user_max_flow = top2_user_max_flow_data[1];
                                                                    top2_user_max_flow_time = (new Date(top2_user_max_flow_data[0])).toLocaleString();

                                                                } catch(exception) {
                                                                    top2_user_max_flow = 0; top2_user_max_flow_time = "none";
                                                                }
                                                                try {
                                                                    var top2_user_app1_from = new Date(user_in_group_app_data['data']['collection'][0]['from']);
                                                                    top2_user_app1_from.setHours(top2_user_app1_from.getHours() + 9);
                                                                    var top2_user_app1_until = new Date(user_in_group_app_data['data']['collection'][0]['until']);
                                                                    top2_user_app1_until.setHours(top2_user_app1_until.getHours() + 9);
                                                                } catch(exception){
                                                                    var top2_user_app1_from = "None";
                                                                    var top2_user_app1_until = "None";
                                                                }
                                                                try {
                                                                    var top2_user_app2_from = new Date(user_in_group_app_data['data']['collection'][1]['from']);
                                                                    top2_user_app2_from.setHours(top2_user_app2_from.getHours() + 9);
                                                                    var top2_user_app2_until = new Date(user_in_group_app_data['data']['collection'][1]['until']);
                                                                    top2_user_app2_until.setHours(top2_user_app2_until.getHours() + 9);
                                                                } catch(exception){
                                                                    var top2_user_app2_from = "None";
                                                                    var top2_user_app2_until = "None";
                                                                }
                                                                try {
                                                                    var top2_user_app3_from = new Date(user_in_group_app_data['data']['collection'][2]['from']);
                                                                    top2_user_app3_from.setHours(top2_user_app3_from.getHours() + 9);
                                                                    var top2_user_app3_until = new Date(user_in_group_app_data['data']['collection'][2]['until']);
                                                                    top2_user_app3_until.setHours(top2_user_app3_until.getHours() + 9);
                                                                } catch(exception){
                                                                    var top2_user_app3_from = "None";
                                                                    var top2_user_app3_until = "None";
                                                                }
                                                                try { top2_user_app1_name = user_in_group_app_data['data']['collection'][0]['name'];} catch(exception) { top2_user_app1_name = 'None' }
                                                                try { top2_user_app1_total = (user_in_group_app_data['data']['collection'][0]['total_rate'] * 0.001).toFixed(3);} catch(exception) { top2_user_app1_total = 0}
                                                                try { top2_user_app2_name = user_in_group_app_data['data']['collection'][1]['name'];} catch(exception) { top2_user_app2_name = 'None' }
                                                                try { top2_user_app2_total = (user_in_group_app_data['data']['collection'][1]['total_rate'] * 0.001).toFixed(3);} catch(exception) { top2_user_app2_total = 0}
                                                                try { top2_user_app3_name = user_in_group_app_data['data']['collection'][2]['name'];} catch(exception) { top2_user_app3_name = 'None' }
                                                                try { top2_user_app3_total = (user_in_group_app_data['data']['collection'][2]['total_rate'] * 0.001).toFixed(3);} catch(exception) { top2_user_app3_total = 0 }
                                                                // 테이블에 들어갈 탑 유저 데이터 준비
                                                                top_user_data.push({
                                                                    "top_user_name": (data['data']['collection'].length !== 0) ? top2_user_name:"None",
                                                                    "top_user_total": (data['data']['collection'].length !== 0) ? top2_user_total:0,
                                                                    "top_user_down": (data['data']['collection'].length !== 0) ? top2_user_down:0,
                                                                    "top_user_up": (data['data']['collection'].length !== 0) ? top2_user_up:0,
                                                                    "top_user_active_flow": (data['data']['collection'].length !== 0) ? top2_user_active_flow:0,
                                                                    "top_user_packet_disc_rate": (data['data']['collection'].length !== 0) ? top2_user_packet_disc_rate:0,
                                                                    "top_user_packet_disc": (data['data']['collection'].length !== 0) ? top2_user_packet_disc:0,
                                                                    "top_user_max_flow" : (data['data']['collection'].length !== 0) ? top2_user_max_flow:0,
                                                                    "top_user_max_flow_time" : (data['data']['collection'].length !== 0) ? top2_user_max_flow_time:0,
                                                                    // "top2_user_name": (data['data']['collection'].length !== 0) ? data['data']['collection'][1]['name']:"None",
                                                                    // "top2_user_total": (data['data']['collection'].length !== 0) ? (data['data']['collection'][1]['total_rate'] * 0.001).toFixed(3):0,
                                                                    "top_user_from": (data['data']['collection'].length !== 0) ? top2_user_from:"None",
                                                                    "top_user_until": (data['data']['collection'].length !== 0) ? top2_user_until:"None",
                                                                    "top_user_app1_name": top2_user_app1_name,
                                                                    "top_user_app1_total": top2_user_app1_total,
                                                                    "top_user_app1_from": top2_user_app1_from.toLocaleString(),
                                                                    "top_user_app1_until": top2_user_app1_until.toLocaleString(),
                                                                    "top_user_app2_name": top2_user_app2_name,
                                                                    "top_user_app2_total": top2_user_app2_total,
                                                                    "top_user_app2_from": top2_user_app2_from.toLocaleString(),
                                                                    "top_user_app2_until": top2_user_app2_until.toLocaleString(),
                                                                    "top_user_app3_name": top2_user_app3_name,
                                                                    "top_user_app3_total": top2_user_app3_total,
                                                                    "top_user_app3_from": top2_user_app3_from.toLocaleString(),
                                                                    "top_user_app3_until": top2_user_app3_until.toLocaleString()
                                                                });
                                                                resolve_cnt += 1;
                                                            });
                                                        });
                                                    }
                                                    if(i===2) {
                                                        complete_count += 2;
                                                        UserInGroupData.getUserInGroupActiveFlows(hostname, e['name']).then(function(user_in_group_flow_data){
                                                            UserInGroupData.getUserInGroupAppData(hostname, e['name']).then(function(user_in_group_app_data) {
                                                                try {
                                                                    top3_user_from = new Date(e['from']);
                                                                    top3_user_from.setHours(top3_user_from.getHours() + 9);
                                                                    top3_user_from = top3_user_from.toLocaleString();

                                                                    top3_user_until = new Date(e['until']);
                                                                    top3_user_until.setHours(top3_user_until.getHours() + 9);
                                                                    top3_user_until = top3_user_until.toLocaleString();

                                                                } catch(exception) {top3_user_from = 'None'; top3_user_until='None'}

                                                                try { top3_user_name = e['name'];} catch(exception) { top3_user_name = 'None'; }
                                                                try { top3_user_total = (e['total_rate'] * 0.001).toFixed(3);} catch(exception) { top3_user_total = 0; }
                                                                try { top3_user_down = (e['dest_rate'] * 0.001).toFixed(3);} catch(exception) { top3_user_total = 0 }
                                                                try { top3_user_up = (e['source_rate'] * 0.001).toFixed(3);} catch(exception) { top3_user_total = 0 }
                                                                try { top3_user_active_flow = e['active_flows']; } catch(exception) { top3_user_total = 0 }
                                                                try { top3_user_packet_disc_rate = e['packet_discard_rate']; } catch(exception) { top3_user_total = 0 }
                                                                try { top3_user_packet_disc = e['packets_discarded']; } catch(exception) { top3_user_packet_disc = 0 }
                                                                try {
                                                                    // console.log(user_in_group_flow_data);
                                                                    var _history_user_in_group_active_flows_data = user_in_group_flow_data['data']['collection'][0]['_history_active_flows'];
                                                                    top3_user_max_flow_data=_.max(_history_user_in_group_active_flows_data,
                                                                        function (history_user_in_grp_active_flows) {
                                                                            return history_user_in_grp_active_flows[1];
                                                                        });
                                                                    top3_user_max_flow = top3_user_max_flow_data[1];
                                                                    top3_user_max_flow_time = (new Date(top3_user_max_flow_data[0])).toLocaleString();
                                                                } catch(exception) {
                                                                    top3_user_max_flow = 0; top3_user_max_flow_time = "none";
                                                                }
                                                                try {
                                                                    var top3_user_app1_from = new Date(user_in_group_app_data['data']['collection'][0]['from']);
                                                                    top3_user_app1_from.setHours(top3_user_app1_from.getHours() + 9);
                                                                    var top3_user_app1_until = new Date(user_in_group_app_data['data']['collection'][0]['until']);
                                                                    top3_user_app1_until.setHours(top3_user_app1_until.getHours() + 9);
                                                                } catch(exception){
                                                                    var top3_user_app1_from = "None";
                                                                    var top3_user_app1_until = "None";
                                                                }
                                                                try {
                                                                    var top3_user_app2_from = new Date(user_in_group_app_data['data']['collection'][1]['from']);
                                                                    top3_user_app2_from.setHours(top3_user_app2_from.getHours() + 9);
                                                                    var top3_user_app2_until = new Date(user_in_group_app_data['data']['collection'][1]['until']);
                                                                    top3_user_app2_until.setHours(top3_user_app2_until.getHours() + 9);
                                                                } catch(exception){
                                                                    var top3_user_app2_from = "None";
                                                                    var top3_user_app2_until = "None";
                                                                }
                                                                try {
                                                                    var top3_user_app3_from = new Date(user_in_group_app_data['data']['collection'][2]['from']);
                                                                    top3_user_app3_from.setHours(top3_user_app3_from.getHours() + 9);
                                                                    var top3_user_app3_until = new Date(user_in_group_app_data['data']['collection'][2]['until']);
                                                                    top3_user_app3_until.setHours(top3_user_app3_until.getHours() + 9);
                                                                } catch(exception){
                                                                    var top3_user_app3_from = "None";
                                                                    var top3_user_app3_until = "None";
                                                                }
                                                                try { top3_user_app1_name = user_in_group_app_data['data']['collection'][0]['name'];} catch(exception) { top3_user_app1_name = 'None' }
                                                                try { top3_user_app1_total = (user_in_group_app_data['data']['collection'][0]['total_rate'] * 0.001).toFixed(3);} catch(exception) { top3_user_app1_total = 0 }
                                                                try { top3_user_app2_name = user_in_group_app_data['data']['collection'][1]['name'];} catch(exception) { top3_user_app2_name = 'None' }
                                                                try { top3_user_app2_total = (user_in_group_app_data['data']['collection'][1]['total_rate'] * 0.001).toFixed(3);} catch(exception) { top3_user_app2_total = 0 }
                                                                try { top3_user_app3_name = user_in_group_app_data['data']['collection'][2]['name'];} catch(exception) { top3_user_app3_name = 'None' }
                                                                try { top3_user_app3_total = (user_in_group_app_data['data']['collection'][2]['total_rate'] * 0.001).toFixed(3);} catch(exception) { top3_user_app3_total = 0 }
                                                                // 테이블에 들어갈 탑 유저 데이터 준비
                                                                top_user_data.push({
                                                                    "top_user_name": (data['data']['collection'].length !== 0) ? top3_user_name:"None",
                                                                    "top_user_total": (data['data']['collection'].length !== 0) ? top3_user_total:0,
                                                                    "top_user_down": (data['data']['collection'].length !== 0) ? top3_user_down:0,
                                                                    "top_user_up": (data['data']['collection'].length !== 0) ? top3_user_up:0,
                                                                    "top_user_active_flow": (data['data']['collection'].length !== 0) ? top3_user_active_flow:0,
                                                                    "top_user_packet_disc_rate": (data['data']['collection'].length !== 0) ? top3_user_packet_disc_rate:0,
                                                                    "top_user_packet_disc": (data['data']['collection'].length !== 0) ? top3_user_packet_disc:0,
                                                                    "top_user_max_flow" : (data['data']['collection'].length !== 0) ? top3_user_max_flow:0,
                                                                    "top_user_max_flow_time" : (data['data']['collection'].length !== 0) ? top3_user_max_flow_time:0,
                                                                    // "top3_user_name": (data['data']['collection'].length !== 0) ? data['data']['collection'][2]['name']:"None",
                                                                    // "top3_user_total": (data['data']['collection'].length !== 0) ? (data['data']['collection'][2]['total_rate'] * 0.001).toFixed(3):0,
                                                                    "top_user_from": (data['data']['collection'].length !== 0) ? top3_user_from:"None",
                                                                    "top_user_until": (data['data']['collection'].length !== 0) ? top3_user_until:"None",
                                                                    "top_user_app1_name": top3_user_app1_name,
                                                                    "top_user_app1_total": top3_user_app1_total,
                                                                    "top_user_app1_from": top3_user_app1_from.toLocaleString(),
                                                                    "top_user_app1_until": top3_user_app1_until.toLocaleString(),
                                                                    "top_user_app2_name": top3_user_app2_name,
                                                                    "top_user_app2_total": top3_user_app2_total,
                                                                    "top_user_app2_from": top3_user_app2_from.toLocaleString(),
                                                                    "top_user_app2_until": top3_user_app2_until.toLocaleString(),
                                                                    "top_user_app3_name": top3_user_app3_name,
                                                                    "top_user_app3_total": top3_user_app3_total,
                                                                    "top_user_app3_from": top3_user_app3_from.toLocaleString(),
                                                                    "top_user_app3_until": top3_user_app3_until.toLocaleString()
                                                                });
                                                                resolve_cnt += 1;
                                                            });
                                                        });
                                                    }
                                                    if(i===3) {
                                                        complete_count += 2;
                                                        UserInGroupData.getUserInGroupActiveFlows(hostname, e['name']).then(function(user_in_group_flow_data){
                                                            UserInGroupData.getUserInGroupAppData(hostname, e['name']).then(function(user_in_group_app_data) {
                                                                try {
                                                                    top4_user_from = new Date(e['from']);
                                                                    top4_user_from.setHours(top4_user_from.getHours() + 9);
                                                                    top4_user_from = top4_user_from.toLocaleString();

                                                                    top4_user_until = new Date(e['until']);
                                                                    top4_user_until.setHours(top4_user_until.getHours() + 9);
                                                                    top4_user_until = top4_user_until.toLocaleString();

                                                                } catch(exception) {top4_user_from = 'None'; top4_user_until='None'}

                                                                try { top4_user_name = e['name'];} catch(exception) { top4_user_name = 'None'; }
                                                                try { top4_user_total = (e['total_rate'] * 0.001).toFixed(3);} catch(exception) { top4_user_total = 0; }
                                                                try { top4_user_down = (e['dest_rate'] * 0.001).toFixed(3);} catch(exception) { top4_user_down = 0 }
                                                                try { top4_user_up = (e['source_rate'] * 0.001).toFixed(3);} catch(exception) { top4_user_up = 0 }
                                                                try { top4_user_active_flow = e['active_flows']; } catch(exception) { top4_user_active_flow = 0 }
                                                                try { top4_user_packet_disc_rate = e['packet_discard_rate']; } catch(exception) { top4_user_packet_disc_rate = 0 }
                                                                try { top4_user_packet_disc = e['packets_discarded']; } catch(exception) { top4_user_packet_disc = 0 }
                                                                try {
                                                                    // console.log(user_in_group_flow_data);
                                                                    var _history_user_in_group_active_flows_data = user_in_group_flow_data['data']['collection'][0]['_history_active_flows'];
                                                                    top4_user_max_flow_data=_.max(_history_user_in_group_active_flows_data,
                                                                        function (history_user_in_grp_active_flows) {
                                                                            return history_user_in_grp_active_flows[1];
                                                                        });
                                                                    top4_user_max_flow = top4_user_max_flow_data[1];
                                                                    top4_user_max_flow_time = (new Date(top4_user_max_flow_data[0])).toLocaleString();
                                                                } catch(exception) {
                                                                    top4_user_max_flow = 0; top4_user_max_flow_time = "none";
                                                                }
                                                                try {
                                                                    var top4_user_app1_from = new Date(user_in_group_app_data['data']['collection'][0]['from']);
                                                                    top4_user_app1_from.setHours(top4_user_app1_from.getHours() + 9);
                                                                    var top4_user_app1_until = new Date(user_in_group_app_data['data']['collection'][0]['until']);
                                                                    top4_user_app1_until.setHours(top4_user_app1_until.getHours() + 9);
                                                                } catch(exception){
                                                                    var top4_user_app1_from = "None";
                                                                    var top4_user_app1_until = "None";
                                                                }
                                                                try {
                                                                    var top4_user_app2_from = new Date(user_in_group_app_data['data']['collection'][1]['from']);
                                                                    top4_user_app2_from.setHours(top4_user_app2_from.getHours() + 9);
                                                                    var top4_user_app2_until = new Date(user_in_group_app_data['data']['collection'][1]['until']);
                                                                    top4_user_app2_until.setHours(top4_user_app2_until.getHours() + 9);
                                                                } catch(exception){
                                                                    var top4_user_app2_from = "None";
                                                                    var top4_user_app2_until = "None";
                                                                }
                                                                try {
                                                                    var top4_user_app3_from = new Date(user_in_group_app_data['data']['collection'][2]['from']);
                                                                    top4_user_app3_from.setHours(top4_user_app3_from.getHours() + 9);
                                                                    var top4_user_app3_until = new Date(user_in_group_app_data['data']['collection'][2]['until']);
                                                                    top4_user_app3_until.setHours(top4_user_app3_until.getHours() + 9);
                                                                } catch(exception){
                                                                    var top4_user_app3_from = "None";
                                                                    var top4_user_app3_until = "None";
                                                                }
                                                                try { top4_user_app1_name = user_in_group_app_data['data']['collection'][0]['name'];} catch(exception) { top4_user_app1_name = 'None' }
                                                                try { top4_user_app1_total = (user_in_group_app_data['data']['collection'][0]['total_rate'] * 0.001).toFixed(3);} catch(exception) { top4_user_app1_total = 0 }
                                                                try { top4_user_app2_name = user_in_group_app_data['data']['collection'][1]['name'];} catch(exception) { top4_user_app2_name = 'None' }
                                                                try { top4_user_app2_total = (user_in_group_app_data['data']['collection'][1]['total_rate'] * 0.001).toFixed(3);} catch(exception) { top4_user_app2_total = 0 }
                                                                try { top4_user_app3_name = user_in_group_app_data['data']['collection'][2]['name'];} catch(exception) { top4_user_app3_name = 'None' }
                                                                try { top4_user_app3_total = (user_in_group_app_data['data']['collection'][2]['total_rate'] * 0.001).toFixed(3);} catch(exception) { top4_user_app3_total = 0 }


                                                                // 테이블에 들어갈 탑 유저 데이터 준비
                                                                top_user_data.push({
                                                                    "top_user_name": (data['data']['collection'].length !== 0) ? top4_user_name:"None",
                                                                    "top_user_total": (data['data']['collection'].length !== 0) ? top4_user_total:0,
                                                                    "top_user_down": (data['data']['collection'].length !== 0) ? top4_user_down:0,
                                                                    "top_user_up": (data['data']['collection'].length !== 0) ? top4_user_up:0,
                                                                    "top_user_active_flow": (data['data']['collection'].length !== 0) ? top4_user_active_flow:0,
                                                                    "top_user_packet_disc_rate": (data['data']['collection'].length !== 0) ? top4_user_packet_disc_rate:0,
                                                                    "top_user_packet_disc": (data['data']['collection'].length !== 0) ? top4_user_packet_disc:0,
                                                                    "top_user_max_flow" : (data['data']['collection'].length !== 0) ? top4_user_max_flow:0,
                                                                    "top_user_max_flow_time" : (data['data']['collection'].length !== 0) ? top4_user_max_flow_time:0,
                                                                    // "top4_user_name": (data['data']['collection'].length !== 0) ? data['data']['collection'][3]['name']:"None",
                                                                    // "top4_user_total": (data['data']['collection'].length !== 0) ? (data['data']['collection'][3]['total_rate'] * 0.001).toFixed(3):0,
                                                                    "top_user_from": (data['data']['collection'].length !== 0) ? top4_user_from:"None",
                                                                    "top_user_until": (data['data']['collection'].length !== 0) ? top4_user_until:"None",
                                                                    "top_user_app1_name": top4_user_app1_name,
                                                                    "top_user_app1_total": top4_user_app1_total,
                                                                    "top_user_app1_from": top4_user_app1_from.toLocaleString(),
                                                                    "top_user_app1_until": top4_user_app1_until.toLocaleString(),
                                                                    "top_user_app2_name": top4_user_app2_name,
                                                                    "top_user_app2_total": top4_user_app2_total,
                                                                    "top_user_app2_from": top4_user_app2_from.toLocaleString(),
                                                                    "top_user_app2_until": top4_user_app2_until.toLocaleString(),
                                                                    "top_user_app3_name": top4_user_app3_name,
                                                                    "top_user_app3_total": top4_user_app3_total,
                                                                    "top_user_app3_from": top4_user_app3_from.toLocaleString(),
                                                                    "top_user_app3_until": top4_user_app3_until.toLocaleString()
                                                                });
                                                                resolve_cnt += 1;
                                                            });
                                                        });
                                                    }
                                                    if(i===4) {
                                                        complete_count += 2;
                                                        UserInGroupData.getUserInGroupActiveFlows(hostname, e['name']).then(function(user_in_group_flow_data){
                                                            UserInGroupData.getUserInGroupAppData(hostname, e['name']).then(function(user_in_group_app_data) {
                                                                try {
                                                                    var top5_user_app1_from = new Date(user_in_group_app_data['data']['collection'][0]['from']);
                                                                    top5_user_app1_from.setHours(top5_user_app1_from.getHours() + 9);
                                                                    var top5_user_app1_until = new Date(user_in_group_app_data['data']['collection'][0]['until']);
                                                                    top5_user_app1_until.setHours(top5_user_app1_until.getHours() + 9);
                                                                } catch(exception){
                                                                    var top5_user_app1_from = "None";
                                                                    var top5_user_app1_until = "None";
                                                                }
                                                                try {
                                                                    var top5_user_app2_from = new Date(user_in_group_app_data['data']['collection'][1]['from']);
                                                                    top5_user_app2_from.setHours(top5_user_app2_from.getHours() + 9);
                                                                    var top5_user_app2_until = new Date(user_in_group_app_data['data']['collection'][1]['until']);
                                                                    top5_user_app2_until.setHours(top5_user_app2_until.getHours() + 9);
                                                                } catch(exception){
                                                                    var top5_user_app2_from = "None";
                                                                    var top5_user_app2_until = "None";
                                                                }
                                                                try {
                                                                    var top5_user_app3_from = new Date(user_in_group_app_data['data']['collection'][2]['from']);
                                                                    top5_user_app3_from.setHours(top5_user_app3_from.getHours() + 9);
                                                                    var top5_user_app3_until = new Date(user_in_group_app_data['data']['collection'][2]['until']);
                                                                    top5_user_app3_until.setHours(top5_user_app3_until.getHours() + 9);
                                                                } catch(exception){
                                                                    var top5_user_app3_from = "None";
                                                                    var top5_user_app3_until = "None";
                                                                }
                                                                try { top5_user_app1_name = user_in_group_app_data['data']['collection'][0]['name'];} catch(exception) { top5_user_app1_name = 'None' }
                                                                try { top5_user_app1_total = (user_in_group_app_data['data']['collection'][0]['total_rate'] * 0.001).toFixed(3);} catch(exception) { top5_user_app1_total = 0 }
                                                                try { top5_user_app2_name = user_in_group_app_data['data']['collection'][1]['name'];} catch(exception) { top5_user_app2_name = 'None' }
                                                                try { top5_user_app2_total = (user_in_group_app_data['data']['collection'][1]['total_rate'] * 0.001).toFixed(3);} catch(exception) { top5_user_app2_total = 0 }
                                                                try { top5_user_app3_name = user_in_group_app_data['data']['collection'][2]['name'];} catch(exception) { top5_user_app3_name = 'None' }
                                                                try { top5_user_app3_total = (user_in_group_app_data['data']['collection'][2]['total_rate'] * 0.001).toFixed(3);} catch(exception) { top5_user_app3_total = 0 }

                                                                try {
                                                                    top5_user_from = new Date(e['from']);
                                                                    top5_user_from.setHours(top5_user_from.getHours() + 9);
                                                                    top5_user_from = top5_user_from.toLocaleString();

                                                                    top5_user_until = new Date(e['until']);
                                                                    top5_user_until.setHours(top5_user_until.getHours() + 9);
                                                                    top5_user_until = top5_user_until.toLocaleString();

                                                                } catch(exception) {top5_user_from = 'None'; top5_user_until='None'}

                                                                try { top5_user_name = e['name'];} catch(exception) { top5_user_name = 'None'; }
                                                                try { top5_user_total = (e['total_rate'] * 0.001).toFixed(3);} catch(exception) { top5_user_total = 0; }
                                                                try { top5_user_down = (e['dest_rate'] * 0.001).toFixed(3);} catch(exception) { top5_user_down = 0 }
                                                                try { top5_user_up = (e['source_rate'] * 0.001).toFixed(3);} catch(exception) { top5_user_up = 0 }
                                                                try { top5_user_active_flow = e['active_flows']; } catch(exception) { top5_user_active_flow = 0 }
                                                                try { top5_user_packet_disc_rate = e['packet_discard_rate']; } catch(exception) { top5_user_packet_disc_rate = 0 }
                                                                try { top5_user_packet_disc = e['packets_discarded']; } catch(exception) { top5_user_packet_disc = 0 }
                                                                try {
                                                                    // console.log(user_in_group_flow_data);
                                                                    var _history_user_in_group_active_flows_data = user_in_group_flow_data['data']['collection'][0]['_history_active_flows'];
                                                                    top5_user_max_flow_data=_.max(_history_user_in_group_active_flows_data,
                                                                        function (history_user_in_grp_active_flows) {
                                                                            return history_user_in_grp_active_flows[1];
                                                                        });
                                                                    top5_user_max_flow = top5_user_max_flow_data[1];
                                                                    top5_user_max_flow_time = (new Date(top5_user_max_flow_data[0])).toLocaleString();
                                                                } catch(exception) {
                                                                    top5_user_max_flow = 0; top5_user_max_flow_time = "none";
                                                                }
                                                                // 테이블에 들어갈 탑 유저 데이터 준비
                                                                top_user_data.push({
                                                                    "top_user_name": (data['data']['collection'].length !== 0) ? top5_user_name:"None",
                                                                    "top_user_total": (data['data']['collection'].length !== 0) ? top5_user_total:0,
                                                                    "top_user_down": (data['data']['collection'].length !== 0) ? top5_user_down:0,
                                                                    "top_user_up": (data['data']['collection'].length !== 0) ? top5_user_up:0,
                                                                    "top_user_active_flow": (data['data']['collection'].length !== 0) ? top5_user_active_flow:0,
                                                                    "top_user_packet_disc_rate": (data['data']['collection'].length !== 0) ? top5_user_packet_disc_rate:0,
                                                                    "top_user_packet_disc": (data['data']['collection'].length !== 0) ? top5_user_packet_disc:0,
                                                                    "top_user_max_flow" : (data['data']['collection'].length !== 0) ? top5_user_max_flow:0,
                                                                    "top_user_max_flow_time" : (data['data']['collection'].length !== 0) ? top5_user_max_flow_time:0,
                                                                    // "top5_user_name": (data['data']['collection'].length !== 0) ? data['data']['collection'][4]['name']:"None",
                                                                    // "top5_user_total": (data['data']['collection'].length !== 0) ? (data['data']['collection'][4]['total_rate'] * 0.001).toFixed(3):0,
                                                                    "top_user_from": (data['data']['collection'].length !== 0) ? top5_user_from:"None",
                                                                    "top_user_until": (data['data']['collection'].length !== 0) ? top5_user_until:"None",
                                                                    "top_user_app1_name": top5_user_app1_name,
                                                                    "top_user_app1_total": top5_user_app1_total,
                                                                    "top_user_app1_from": top5_user_app1_from.toLocaleString(),
                                                                    "top_user_app1_until": top5_user_app1_until.toLocaleString(),
                                                                    "top_user_app2_name": top5_user_app2_name,
                                                                    "top_user_app2_total": top5_user_app2_total,
                                                                    "top_user_app2_from": top5_user_app2_from.toLocaleString(),
                                                                    "top_user_app2_until": top5_user_app2_until.toLocaleString(),
                                                                    "top_user_app3_name": top5_user_app3_name,
                                                                    "top_user_app3_total": top5_user_app3_total,
                                                                    "top_user_app3_from": top5_user_app3_from.toLocaleString(),
                                                                    "top_user_app3_until": top5_user_app3_until.toLocaleString()
                                                                });
                                                                resolve_cnt += 1;
                                                            });
                                                        });
                                                    }
                                                    // else {
                                                    //     // 그룹 내 사용자 데이터 테이블 정렬
                                                    //     // if (data['data']['collection'].length !== 0)
                                                    //     _.sortBy(top_user_data, function(data){
                                                    //         console.log('sorted data: ', data);
                                                    //         return data['top_user_total'];
                                                    //     });
                                                    //     // top_user_data.sort(function (a, b) { return b['top_user_total'] - a['top_user_total']; });
                                                    //     // console.log(' _user_in_group_tb.top_user_data: ', top_user_data);
                                                    // }
                                                });
                                                // 그룹내 콜렉션의 사이즈가 없을때,(데이터가 존재하지 않을때)
                                            } else{
                                                // 테이블에 들어갈 탑 유저 데이터 준비 top1
                                                top_user_data.push({
                                                    "top_user_name": (data['data']['collection'].length !== 0) ? top1_user_name:"None",
                                                    "top_user_total": (data['data']['collection'].length !== 0) ? top1_user_total:0,
                                                    "top_user_down": (data['data']['collection'].length !== 0) ? top1_user_down:0,
                                                    "top_user_up": (data['data']['collection'].length !== 0) ? top1_user_up:0,
                                                    "top_user_active_flow": (data['data']['collection'].length !== 0) ? top1_user_active_flow:0,
                                                    "top_user_packet_disc_rate": (data['data']['collection'].length !== 0) ? top1_user_packet_disc_rate:0,
                                                    "top_user_packet_disc": (data['data']['collection'].length !== 0) ? top1_user_packet_disc:0,
                                                    "top_user_max_flow" : (data['data']['collection'].length !== 0) ? top1_user_max_flow:0,
                                                    "top_user_max_flow_time" : (data['data']['collection'].length !== 0) ? top1_user_max_flow_time:0,
                                                    // "top1_user_name": (data['data']['collection'].length !== 0) ? data['data']['collection'][0]['name']:"None",
                                                    // "top1_user_total": (data['data']['collection'].length !== 0) ? (data['data']['collection'][0]['total_rate'] * 0.001).toFixed(3):0,
                                                    "top_user_from": (data['data']['collection'].length !== 0) ? top1_user_from:"None",
                                                    "top_user_until": (data['data']['collection'].length !== 0) ? top1_user_until:"None",
                                                    "top_user_app1_name": "None",
                                                    "top_user_app1_total": 0,
                                                    "top_user_app1_from": "None",
                                                    "top_user_app1_until": "None",
                                                    "top_user_app2_name": "None",
                                                    "top_user_app2_total": 0,
                                                    "top_user_app2_from": "None",
                                                    "top_user_app2_until": "None",
                                                    "top_user_app3_name": "None",
                                                    "top_user_app3_total": 0,
                                                    "top_user_app3_from": "None",
                                                    "top_user_app3_until": "None"
                                                });
                                                // 테이블에 들어갈 탑 유저 데이터 준비 top2
                                                top_user_data.push({
                                                    "top_user_name": (data['data']['collection'].length !== 0) ? top2_user_name:"None",
                                                    "top_user_total": (data['data']['collection'].length !== 0) ? top2_user_total:0,
                                                    "top_user_down": (data['data']['collection'].length !== 0) ? top2_user_down:0,
                                                    "top_user_up": (data['data']['collection'].length !== 0) ? top2_user_up:0,
                                                    "top_user_active_flow": (data['data']['collection'].length !== 0) ? top2_user_active_flow:0,
                                                    "top_user_packet_disc_rate": (data['data']['collection'].length !== 0) ? top2_user_packet_disc_rate:0,
                                                    "top_user_packet_disc": (data['data']['collection'].length !== 0) ? top2_user_packet_disc:0,
                                                    "top_user_max_flow" : (data['data']['collection'].length !== 0) ? top2_user_max_flow:0,
                                                    "top_user_max_flow_time" : (data['data']['collection'].length !== 0) ? top2_user_max_flow_time:0,
                                                    // "top2_user_name": (data['data']['collection'].length !== 0) ? data['data']['collection'][1]['name']:"None",
                                                    // "top2_user_total": (data['data']['collection'].length !== 0) ? (data['data']['collection'][1]['total_rate'] * 0.001).toFixed(3):0,
                                                    "top_user_from": (data['data']['collection'].length !== 0) ? top2_user_from:"None",
                                                    "top_user_until": (data['data']['collection'].length !== 0) ? top2_user_until:"None",
                                                    "top_user_app1_name": "None",
                                                    "top_user_app1_total": 0,
                                                    "top_user_app1_from": "None",
                                                    "top_user_app1_until": "None",
                                                    "top_user_app2_name": "None",
                                                    "top_user_app2_total": 0,
                                                    "top_user_app2_from": "None",
                                                    "top_user_app2_until": "None",
                                                    "top_user_app3_name": "None",
                                                    "top_user_app3_total": 0,
                                                    "top_user_app3_from": "None",
                                                    "top_user_app3_until": "None"
                                                });
                                                // 테이블에 들어갈 탑 유저 데이터 준비 top3
                                                top_user_data.push({
                                                    "top_user_name": (data['data']['collection'].length !== 0) ? top3_user_name:"None",
                                                    "top_user_total": (data['data']['collection'].length !== 0) ? top3_user_total:0,
                                                    "top_user_down": (data['data']['collection'].length !== 0) ? top3_user_down:0,
                                                    "top_user_up": (data['data']['collection'].length !== 0) ? top3_user_up:0,
                                                    "top_user_active_flow": (data['data']['collection'].length !== 0) ? top3_user_active_flow:0,
                                                    "top_user_packet_disc_rate": (data['data']['collection'].length !== 0) ? top3_user_packet_disc_rate:0,
                                                    "top_user_packet_disc": (data['data']['collection'].length !== 0) ? top3_user_packet_disc:0,
                                                    "top_user_max_flow" : (data['data']['collection'].length !== 0) ? top3_user_max_flow:0,
                                                    "top_user_max_flow_time" : (data['data']['collection'].length !== 0) ? top3_user_max_flow_time:0,
                                                    // "top3_user_name": (data['data']['collection'].length !== 0) ? data['data']['collection'][2]['name']:"None",
                                                    // "top3_user_total": (data['data']['collection'].length !== 0) ? (data['data']['collection'][2]['total_rate'] * 0.001).toFixed(3):0,
                                                    "top_user_from": (data['data']['collection'].length !== 0) ? top3_user_from:"None",
                                                    "top_user_until": (data['data']['collection'].length !== 0) ? top3_user_until:"None",
                                                    "top_user_app1_name": "None",
                                                    "top_user_app1_total": 0,
                                                    "top_user_app1_from": "None",
                                                    "top_user_app1_until": "None",
                                                    "top_user_app2_name": "None",
                                                    "top_user_app2_total": 0,
                                                    "top_user_app2_from": "None",
                                                    "top_user_app2_until": "None",
                                                    "top_user_app3_name": "None",
                                                    "top_user_app3_total": 0,
                                                    "top_user_app3_from": "None",
                                                    "top_user_app3_until": "None"
                                                });
                                                // 테이블에 들어갈 탑 유저 데이터 준비 top4
                                                top_user_data.push({
                                                    "top_user_name": (data['data']['collection'].length !== 0) ? top4_user_name:"None",
                                                    "top_user_total": (data['data']['collection'].length !== 0) ? top4_user_total:0,
                                                    "top_user_down": (data['data']['collection'].length !== 0) ? top4_user_down:0,
                                                    "top_user_up": (data['data']['collection'].length !== 0) ? top4_user_up:0,
                                                    "top_user_active_flow": (data['data']['collection'].length !== 0) ? top4_user_active_flow:0,
                                                    "top_user_packet_disc_rate": (data['data']['collection'].length !== 0) ? top4_user_packet_disc_rate:0,
                                                    "top_user_packet_disc": (data['data']['collection'].length !== 0) ? top4_user_packet_disc:0,
                                                    "top_user_max_flow" : (data['data']['collection'].length !== 0) ? top4_user_max_flow:0,
                                                    "top_user_max_flow_time" : (data['data']['collection'].length !== 0) ? top4_user_max_flow_time:0,
                                                    // "top4_user_name": (data['data']['collection'].length !== 0) ? data['data']['collection'][3]['name']:"None",
                                                    // "top4_user_total": (data['data']['collection'].length !== 0) ? (data['data']['collection'][3]['total_rate'] * 0.001).toFixed(3):0,
                                                    "top_user_from": (data['data']['collection'].length !== 0) ? top4_user_from:"None",
                                                    "top_user_until": (data['data']['collection'].length !== 0) ? top4_user_until:"None",
                                                    "top_user_app1_name": "None",
                                                    "top_user_app1_total": 0,
                                                    "top_user_app1_from": "None",
                                                    "top_user_app1_until": "None",
                                                    "top_user_app2_name": "None",
                                                    "top_user_app2_total": 0,
                                                    "top_user_app2_from": "None",
                                                    "top_user_app2_until": "None",
                                                    "top_user_app3_name": "None",
                                                    "top_user_app3_total": 0,
                                                    "top_user_app3_from": "None",
                                                    "top_user_app3_until": "None"
                                                });
                                                // 테이블에 들어갈 탑 유저 데이터 준비 top5
                                                top_user_data.push({
                                                    "top_user_name": (data['data']['collection'].length !== 0) ? top5_user_name:"None",
                                                    "top_user_total": (data['data']['collection'].length !== 0) ? top5_user_total:0,
                                                    "top_user_down": (data['data']['collection'].length !== 0) ? top5_user_down:0,
                                                    "top_user_up": (data['data']['collection'].length !== 0) ? top5_user_up:0,
                                                    "top_user_active_flow": (data['data']['collection'].length !== 0) ? top5_user_active_flow:0,
                                                    "top_user_packet_disc_rate": (data['data']['collection'].length !== 0) ? top5_user_packet_disc_rate:0,
                                                    "top_user_packet_disc": (data['data']['collection'].length !== 0) ? top5_user_packet_disc:0,
                                                    "top_user_max_flow" : (data['data']['collection'].length !== 0) ? top5_user_max_flow:0,
                                                    "top_user_max_flow_time" : (data['data']['collection'].length !== 0) ? top5_user_max_flow_time:0,
                                                    // "top5_user_name": (data['data']['collection'].length !== 0) ? data['data']['collection'][4]['name']:"None",
                                                    // "top5_user_total": (data['data']['collection'].length !== 0) ? (data['data']['collection'][4]['total_rate'] * 0.001).toFixed(3):0,
                                                    "top_user_from": (data['data']['collection'].length !== 0) ? top5_user_from:"None",
                                                    "top_user_until": (data['data']['collection'].length !== 0) ? top5_user_until:"None",
                                                    "top_user_app1_name": "None",
                                                    "top_user_app1_total": 0,
                                                    "top_user_app1_from": "None",
                                                    "top_user_app1_until": "None",
                                                    "top_user_app2_name": "None",
                                                    "top_user_app2_total": 0,
                                                    "top_user_app2_from": "None",
                                                    "top_user_app2_until": "None",
                                                    "top_user_app3_name": "None",
                                                    "top_user_app3_total": 0,
                                                    "top_user_app3_from": "None",
                                                    "top_user_app3_until": "None"
                                                });
                                            }
                                            // 테이블 테이터 최종
                                            _user_in_group_tb.push({
                                                "user_group_name": elem,
                                                "user_group_tr": (elem === _user_group_tb_data[index].name) ? _user_group_tb_data[index].total:"none",
                                                "top_user_data": top_user_data
                                            });
                                            // resolve(_user_in_group_tb);
                                            // if(data['data']['collection'].length === resolve_cnt){
                                            //     resolve("sucess make table data!")
                                            // }
                                        });
                                    };
                                    makeTableData().then(function(res){
                                        if (data['data']['collection'].length !== 0) {
                                            for (var i = 0; i<_user_in_group_tb.length; i++) {
                                                _user_in_group_tb[i]['top_user_data'].sort(function (a, b) {
                                                    console.log('top_user_data: ', a, b);
                                                    return b['top_user_total'] - a['top_user_total']
                                                });
                                            }

                                            _user_in_group_tb.sort(function (a, b) {
                                                return b['user_group_tr'] - a['user_group_tr'];
                                            });
                                        }
                                        console.log('_user_in_group_tb', _user_in_group_tb);

                                        // 그래프 데이터 준비
                                        if (data['data']['collection'].length !== 0) {
                                            try {_user_in_group_tr_top1.push((data['data']['collection'][0]['total_rate'] * 0.001).toFixed(3));
                                            } catch(exception) {_user_in_group_tr_top1.push(0);}
                                            try {_user_in_group_tr_top2.push((data['data']['collection'][1]['total_rate'] * 0.001).toFixed(3));
                                            } catch(exception) {_user_in_group_tr_top2.push(0);}
                                            try {_user_in_group_tr_top3.push((data['data']['collection'][2]['total_rate'] * 0.001).toFixed(3));
                                            } catch(exception) {_user_in_group_tr_top3.push(0);}
                                            try {_user_in_group_tr_top4.push((data['data']['collection'][3]['total_rate'] * 0.001).toFixed(3));
                                            } catch(exception) {_user_in_group_tr_top4.push(0);}
                                            try {_user_in_group_tr_top5.push((data['data']['collection'][4]['total_rate'] * 0.001).toFixed(3));
                                            } catch(exception) {_user_in_group_tr_top5.push(0);}
                                        }else{
                                            _user_in_group_tr_top1.push(0);
                                            _user_in_group_tr_top2.push(0);
                                            _user_in_group_tr_top3.push(0);
                                            _user_in_group_tr_top4.push(0);
                                            _user_in_group_tr_top5.push(0);
                                        }
                                        // 그래프 라벨 준비
                                        _user_in_group_label.push("["+elem+"]"
                                            + " - ( " +
                                            "1. " + top1_user_name + " , " +
                                            "2. " + top2_user_name + " , " +
                                            "3. " + top3_user_name + " , " +
                                            "4. " + top4_user_name + " , " +
                                            "5. " + top5_user_name +
                                            " )"
                                        );
                                    });

                                    // 그룹 데이터 테이블 정렬
                                    // var sortTopUserData = function() {
                                    //     return $q(function(resolve, reject){
                                    //         var resolve_cnt = 0;
                                    //
                                    //         resolve("success!!");
                                    //         // for (var i = 0; i<_user_in_group_tb.length; i++){
                                    //         //     _user_in_group_tb[i]['top_user_data'].sort(function(a,b){
                                    //         //         console.log('top_user_data: ', a, b);
                                    //         //         return b['top_user_total'] - a['top_user_total']
                                    //         //     });
                                    //         //     resolve_cnt += 1;
                                    //         // }
                                    //         // if(resolve_cnt === 5){resolve("success!!");}
                                    //     });
                                    // };
                                    // sortTopUserData().then(function(response){
                                    //
                                    // });

                                        // _.sortBy(_user_in_group_tb['top_user_data'], function (data) {
                                        //     console.log('sorted data: ', data);
                                        //
                                        //     return data['top_user_down'];
                                        // });

                                    // console.log("그룹내 유저 데이터 끝");
                                });

                            });
                            // for (var i = 0; i < _user_group_label.length; i++) {
                            //     /*
                            //         1. top1_user_app1_from, top1_user_app1_until
                            //         2. top1_user_app2_from, top1_user_app2_until
                            //         3. top1_user_app3_from, top1_user_app3_until
                            //         4. _users_app : user_app all data for table
                            //         5. _users_app_top1, _users_app_top2, _users_app_top3 : app total rate data for graph
                            //         6. _users_appName_top1, _users_appName_top2, _users_appName_top3 : app name for graph
                            //         7. _users_app_label : user name and app name for graph
                            //         8. _users_app_option : options for graph
                            //     */
                            //     UserInGroupData.getUserInGroupData(hostname, _user_group_label[i]).then(function(data) {
                            //         //parsing here
                            //         console.log("그룹내 유저 데이터 시작");
                            //         console.log(data['data']['collection']);
                            //         var top1_user_from = new Date(data['data']['collection'][0]['from']);
                            //         top1_user_from.setHours(top1_user_from.getHours() + 9);
                            //         var top1_user_until = new Date(data['data']['collection'][0]['until']);
                            //         top1_user_until.setHours(top1_user_until.getHours() + 9);
                            //         var top2_user_from = new Date(data['data']['collection'][1]['from']);
                            //         top2_user_from.setHours(top2_user_from.getHours() + 9);
                            //         var top2_user_until = new Date(data['data']['collection'][1]['until']);
                            //         top2_user_until.setHours(top2_user_until.getHours() + 9);
                            //         var top3_user_from = new Date(data['data']['collection'][2]['from']);
                            //         top3_user_from.setHours(top3_user_from.getHours() + 9);
                            //         var top3_user_until = new Date(data['data']['collection'][2]['until']);
                            //         top3_user_until.setHours(top3_user_until.getHours() + 9);
                            //
                            //         _user_group_in_user_tb.push({
                            //             "user_group_name": data['data']['collection'][0].link.href.split('/')[6],
                            //             "top1_user_name": data['data']['collection'][0]['name'],
                            //             "top1_user_total": (data['data']['collection'][0]['total_rate'] * 0.001).toFixed(3),
                            //             "top1_user_from": top1_user_from.toLocaleString(),
                            //             "top1_user_until": top1_user_until.toLocaleString(),
                            //             "top2_user_name": data['data']['collection'][1]['name'],
                            //             "top2_user_total": (data['data']['collection'][1]['total_rate'] * 0.001).toFixed(3),
                            //             "top2_user_from": top2_user_from.toLocaleString(),
                            //             "top2_user_until": top2_user_until.toLocaleString(),
                            //             "top3_user_name": data['data']['collection'][2]['name'],
                            //             "top3_user_total": (data['data']['collection'][2]['total_rate'] * 0.001).toFixed(3),
                            //             "top3_user_from": top3_user_from.toLocaleString(),
                            //             "top3_user_until": top3_user_until.toLocaleString()
                            //         });
                            //         _user_tr_top1.push((data['data']['collection'][0]['total_rate'] * 0.001).toFixed(3));
                            //         _user_tr_top2.push((data['data']['collection'][1]['total_rate'] * 0.001).toFixed(3));
                            //         _user_tr_top3.push((data['data']['collection'][2]['total_rate'] * 0.001).toFixed(3));
                            //         _user_name_top1.push(data['data']['collection'][0]['name']);
                            //         _user_name_top2.push(data['data']['collection'][1]['name']);
                            //         _user_name_top3.push(data['data']['collection'][2]['name']);
                            //         _user_name_label.push(_user_group_label[i] + "(" +
                            //             "1." + data['data']['collection'][0]['name'] + "," +
                            //             "2." + data['data']['collection'][1]['name'] + "," +
                            //             "3." + data['data']['collection'][2]['name'] + ")"
                            //         );
                            //         console.log("그룹내 유저 데이터 끝");
                            //     });
                            // }
                            // _(_user_in_group_tb).sortBy('user_group_tr');

                            // console.log("그룹내 유저 테이블 데이터");
                            // console.log(_user_in_group_tb);

                            var _user_in_group_tr_data = [
                                _user_in_group_tr_top1,
                                _user_in_group_tr_top2,
                                _user_in_group_tr_top3,
                                _user_in_group_tr_top4,
                                _user_in_group_tr_top5
                            ];
                            // console.log("_user_in_group_label");
                            // console.log(_user_in_group_label);
                            // console.log("_user_in_group_tr_data");
                            // console.log(_user_in_group_tr_data);





                            // var _y = [];
                            // _(_user_in_group_tr_data).each(function(user_top, _index){
                            //     // var _temp_y = [];
                            //     _y.push([].push(user_top[0]));
                            //     _y.push([].push(user_top[1]));
                            //     console.log("_y");
                            //     console.log(_y);
                            // });

                            // var _user_in_group_tr_data = [
                            //     _user_in_group_tb._user_inGroup_tr_top1,
                            //     _user_in_group_tb._user_inGroup_tr_top2,
                            //     _user_in_group_tb._user_inGroup_tr_top3,
                            //     _user_in_group_tb._user_inGroup_tr_top4,
                            //     _user_in_group_tb._user_inGroup_tr_top5,
                            //     _user_in_group_tb._user_inGroup_tr_top6,
                            //     _user_in_group_tb._user_inGroup_tr_top7,
                            //     _user_in_group_tb._user_inGroup_tr_top8,
                            //     _user_in_group_tb._user_inGroup_tr_top9
                            // ];
                            var _user_in_group_series = ["TOP 1", "TOP 2", "TOP 3", "TOP 4", "TOP 5"];
                            var _user_in_group_option = {
                                scales: {
                                    xAxes: [{
                                        ticks: {
                                            fontSize: 12,
                                            fontStyle: "bold"
                                        },
                                        scaleLabel: {
                                            display: true,
                                            fontSize: 14,
                                            labelString: '유저 사용량(Mbit/s)',
                                            fontStyle: "bold"
                                        }
                                    }],
                                    yAxes: [{
                                        pointLabelFontSize : 20,
                                        ticks: {
                                            fontSize: 12,
                                            fontStyle: "bold",
                                            // display: false,
                                            // maxlabelwidthpercent: 80,
                                            // stepSize: 2,
                                            autoSkip: false,
                                            userCallback: function(value, index, values) {
                                                // console.log("틱틱틱!!!!!!!!!!!!!!!!");
                                                // console.log(value);
                                                // console.log(values);
                                                var start = value.indexOf('[');
                                                var end = value.indexOf(']');
                                                var v = value.substr(start+1, end-1);
                                                return v;
                                            }
                                        },
                                        scaleLabel: {
                                            display: true,
                                            fontSize: 14,
                                            labelString: '그룹 내 유저(Top1,Top2,Top3,Top4,Top5)',
                                            fontStyle: "bold"
                                        }

                                    }]
                                },
                                tooltips: {
                                    callbacks: {
                                        title: function(tooltipItems, data) {
                                            // console.log('툴팁!!!!!!!!!!!!');
                                            // console.log(data);
                                            return data.labels[tooltipItems[0].index]
                                        }
                                    }
                                }
                            };
                            deferred.resolve({
                                user_group: {
                                    _user_group_label: _user_group_label,
                                    _user_group_data: _user_group_data,
                                    _user_group_series: _user_group_series,
                                    _user_group_option: _user_group_option,
                                    _user_group_colors: _user_group_colors,
                                    _user_group_size: _user_group_size,
                                    _user_group_tb_data: _user_group_tb_data // for table
                                    // _user_group_flow_disc_data: _user_group_flow_disc_data,
                                    // _user_group_flow_disc_series: _user_group_flow_disc_series,
                                    // _user_group_flow_disc_option: _user_group_flow_disc_option,
                                    // _user_group_datasetOverride: _user_group_datasetOverride,

                                },
                                user_in_group: {
                                    _user_in_group_tb: _user_in_group_tb, // for table
                                    _group_name_tb: _group_name_tb, // for table thead
                                    _user_in_group_tr_data: _user_in_group_tr_data,
                                    _user_in_group_label: _user_in_group_label,
                                    _user_in_group_series: _user_in_group_series,
                                    _user_in_group_option: _user_in_group_option,
                                    _user_in_group_colors: _user_group_colors
                                },
                                complete_count: complete_count
                            });
                        });
                    });
                });
            }
            return deferred.promise;
        };
    };
    return UserGroupData;
});