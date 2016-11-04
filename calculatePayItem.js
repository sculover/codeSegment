function generateBill (item) {
	//合同付款结点
	item.payNode = [];
	//账单付款节点信息
	item.modifiedPayItem = [];
	//合同总金额 - 需要在后面计算的时候用到
	item.total_fee_modified = 0;
	//押金
	item.deposit_value = 0;
	//生成付款节点的工位人数价格等条件
	var conditionArrLength = item.conditionArr.length;

	if (!(conditionArrLength > 0)) {
		showAlert("请添加付款条件");
		return;
	}

	//根据条件获取合同的开始时间和结束时间
	var conStartTime, conEndTime, conStartTimeObj, conEndTimeObj;
	//保证金数组
	item.depositList = [];

	for (var i = 0; i < conditionArrLength; i++) {
		var tempObj = item.conditionArr[i];
		conStartTime = conStartTime < tempObj.start_time ? conStartTime : tempObj.start_time;
		conEndTime = conEndTime > tempObj.end_time ? conEndTime : tempObj.end_time;
		//计算总金额
		//计算月份和天数
		var timeObj = getMonthAndDayInfo(new Date(tempObj.start_time), new Date(tempObj.end_time));
		var tempValue = calculateValue(timeObj, tempObj.bill_people_num, tempObj.bill_site_average_price);
		item.total_fee_modified += tempValue;
		item.depositList.push({
			start_time : tempObj.start_time,
			end_time : tempObj.end_time,
			value : tempObj.bill_standard_deposit_value * tempObj.bill_people_num * tempObj.bill_deposit_statistics
			});
		
	}
	// console.log(item.total_fee_modified); return;

	// 生成付款节点数组
	conStartTimeObj = new Date(conStartTime);
	conEndTimeObj = new Date(conEndTime);
	// 支付方式 month
	var pay_method = item.conditionArr[0].bill_pay_statistics;
	item.payNode = [];
	var hasMoreDate = true;
	var temp_end_date_string, temp_end_date, temp_start_date;
	var temp_start_date_string = conStartTime;
	while (hasMoreDate) {
		temp_end_date_string = currentDateAddMonth(temp_start_date_string, pay_method);
		if (new Date(temp_end_date_string).getTime() <= conEndTimeObj.getTime()) {
			item.payNode.push({
				'start_time' : temp_start_date_string,
				'end_time' : temp_end_date_string,
				'value' : 0
			});
			if (new Date(temp_end_date_string).getTime() == conEndTimeObj.getTime()) {
				hasMoreDate = false;
			}
			temp_end_date = new Date(temp_end_date_string);
			temp_end_date.setDate(temp_end_date.getDate() + 1);
			temp_start_date_string = formatYMD(temp_end_date.getFullYear(), temp_end_date.getMonth() + 1, temp_end_date.getDate());
		} else {
			hasMoreDate = false;
			item.payNode.push({
				'start_time' : temp_start_date_string,
				'end_time' : conEndTime,
				'value' : 0
			});
		}
	}
	// console.log(item.payNode); return;
	
	//计算每个付款结点的应付
	var payNodeLen = item.payNode.length;
	if (conditionArrLength && payNodeLen) {
		var timeObj = {};
		for (var i = 0; i < conditionArrLength; i++) {
			var tempObj = item.conditionArr[i];
			var tempObjStartTimeObj = new Date(tempObj.start_time);
			var tempObjEndTimeObj = new Date(tempObj.end_time);
			for (var j = 0; j < payNodeLen; j++) {
				var tempValue = 0;
				var tempPayNode = item.payNode[j];
				var temPayNodeStartObj = new Date(tempPayNode.start_time);
				var temPayNodeEndObj = new Date(tempPayNode.end_time);
				if (!(temPayNodeStartObj.getTime() > tempObjEndTimeObj.getTime() || temPayNodeEndObj.getTime() < tempObjStartTimeObj.getTime())) {
					//找出结点和当前条目开始的最大值和结束的最小值计算即可
					//S1S2E1E2  S2S1E1E2 S2S1E2E1 S1S2E2E1
					var _start = temPayNodeStartObj.getTime() >= tempObjStartTimeObj.getTime() ? temPayNodeStartObj : tempObjStartTimeObj;
					var _end = temPayNodeEndObj.getTime() >= tempObjEndTimeObj.getTime() ? tempObjEndTimeObj : temPayNodeEndObj;
					timeObj = getMonthAndDayInfo(_start, _end);
					tempValue = calculateValue(timeObj, tempObj.bill_people_num, tempObj.bill_site_average_price);
					tempPayNode.value += tempValue;
				}
				
			}
		}
	}
	// console.log(item.payNode);return;
	item.modifiedPayItem = [];
	var tempValue = 0;
	for (var i = 0; i < payNodeLen; i++) {
		var temp = item.payNode[i];
		if (i < (payNodeLen - 1)) {
			item.modifiedPayItem.push({
				'start_time' : temp.start_time,
				'end_time' : temp.end_time, 
				'value' : temp.value.toFixed(2)
			});
			tempValue = parseFloat(temp.value.toFixed(2)) + parseFloat(tempValue);
		}
		if (i == (payNodeLen - 1)) {
			item.modifiedPayItem.push({
				'start_time' : temp.start_time,
				'end_time' : temp.end_time, 
				'value' : (parseFloat(item.total_fee_modified.toFixed(2)) - parseFloat(tempValue)).toFixed(2)
			});
		}
	}

	//添加保证金 item.modifiedPayItem 为没有保证金的数组
	var payItemLen = item.modifiedPayItem.length;
	if (payItemLen) {
		for (var i = 0; i < payItemLen; i++) {
			var tempObj = item.modifiedPayItem[i];
			var depLen = item.depositList.length;
			if (depLen) {
				for (var j = 0; j < depLen; j++) {
					var tempDeposit = item.depositList[j];
					if (new Date(tempDeposit.start_time.replace(/-/g, '/')).getTime() <= new Date(tempObj.end_time.replace(/-/g, '/')).getTime() && new Date(tempDeposit.start_time.replace(/-/g, '/')).getTime() >= new Date(tempObj.start_time.replace(/-/g, '/')).getTime()) {
						tempObj.value = (parseFloat(tempDeposit.value) + parseFloat(tempObj.value)).toFixed(2);
					}
				}
			}
		}
	}
	//组装合同付款条目
	if (item.modifiedPayItem && item.modifiedPayItem.length > 0) {
		item.modifiedPayItem = generatePayItem(item.modifiedPayItem);
	}
}

//根据开始时间和结束时间获得月数和 开始的天数 结束的天数
function getMonthAndDayInfo (start, end) {
	var total_month = total_days_1 = month_days_1 = total_days_2 = month_days_2 = 0;
	if ((start.getFullYear() == end.getFullYear()) && (start.getMonth() == end.getMonth())) {
		if (start.getDate() == 1 && end.getDate() == daysInMonth(end.getFullYear(), end.getMonth() + 1 )) {
			total_month = 1;
			total_days_1 = 0;
		} else {
			total_month = 0;
			total_days_1 = end.getDate() - start.getDate() + 1;
			// month_days_1 = daysInMonth(end.getFullYear(), end.getMonth() + 1 );
			month_days_1 = 30;
		}
	} else {
		var yearInterval = end.getFullYear() - start.getFullYear();
		var monthInterval = 0;
		if (start.getDate() == 1 && end.getDate() == daysInMonth(end.getFullYear(), end.getMonth() + 1)) {
			total_month = end.getMonth() - start.getMonth() + 1 + 12*yearInterval;
		} else {
			if (end.getDate() == (start.getDate()-1)) {
				monthInterval = end.getMonth() - start.getMonth();
				total_month = yearInterval * 12 + monthInterval;
				total_days_1 = 0;
			} else if (end.getDate() < (start.getDate()-1)){
				monthInterval = end.getMonth() - start.getMonth();
				total_month = yearInterval * 12 + monthInterval - 1;
				// month_days_1 = daysInMonth(start.getFullYear(), start.getMonth() + 1);
				month_days_1 = 30;
				total_days_1 = month_days_1 - start.getDate() + 1;
				// month_days_2 = daysInMonth(end.getFullYear(), end.getMonth() + 1 );
				month_days_2 = 30;
				// total_days_2 = end.getDate();
				total_days_2 = 30;
			} else {
				monthInterval = end.getMonth() - start.getMonth();
				total_month = yearInterval * 12 + monthInterval;
				// month_days_2 = daysInMonth(end.getFullYear(), end.getMonth() + 1);
				month_days_2 = 30;
				// total_days_2 = end.getDate() - (start.getDate() - 1);
				total_days_2 = 30 - (start.getDate() - 1);
			}
		}
	}

	return {'total_month' : total_month, 'total_days_1' : total_days_1, 'month_days_1' : month_days_1, 'total_days_2' : total_days_2, 'month_days_2' : month_days_2};
}

//根据时间计算价格
function calculateValue (timeObj, item_person_number, seat_average_price) {
	var temp_pay_value = 0;
	temp_pay_value = timeObj.total_month * seat_average_price * item_person_number;
	if (timeObj.total_days_1) {
		// temp_pay_value += (seat_average_price/timeObj.month_days_1) * timeObj.total_days_1 * item_person_number;
		temp_pay_value += (seat_average_price/30) * timeObj.total_days_1 * item_person_number;
	}
	if (timeObj.total_days_2) {
		// temp_pay_value += (seat_average_price/timeObj.month_days_2) * timeObj.total_days_2 * item_person_number;
		temp_pay_value += (seat_average_price/30) * timeObj.total_days_2 * item_person_number;
	}
	return temp_pay_value;
}

//根据月份获得天数
function daysInMonth (year,month) {
	return new Date(year, month, 0).getDate();
}

//生成付款结点 标准||修改
function generatePayItem (arr, str) {
	var tempArr = [];
	var len =  arr.length;
	for (var i = 0 ; i < len; i++) {
		var charge_content = "第" + (i + 1) + " 次付款";
		if (i == 0) {
			charge_content = "首付款";
		}
		if (i == len - 1 && len > 1) {
			charge_content = "尾款";
		}
		arr[i].charge_content = charge_content;
		var tempItem = arr[i];
		tempArr.push({
			'charge_content' : charge_content,
			'start_time' : tempItem.start_date,
			'end_time' : tempItem.end_date,
			'price' : parseFloat(tempItem.value).toFixed(2),
			'all_price' : parseFloat(tempItem.value).toFixed(2)
		});
	}
	return tempArr
}