//合同付款条件根据付款结点计算每一个结点的应付
//原代码
/*if (temPayNodeStartObj.getTime() <= tempObjStartTimeObj.getTime() && temPayNodeEndObj.getTime() >= tempObjStartTimeObj.getTime()) {
	if (temPayNodeEndObj.getTime() >= tempObjEndTimeObj.getTime()) {
		timeObj = getMonthAndDayInfo(tempObjStartTimeObj, tempObjEndTimeObj);
		tempValue = calculateValue(timeObj, tempObj.bill_people_num, tempObj.bill_site_average_price);
		tempPayNode.value += tempValue;
	} else {
		timeObj = getMonthAndDayInfo(tempObjStartTimeObj, temPayNodeEndObj);
		tempValue = calculateValue(timeObj, tempObj.bill_people_num, tempObj.bill_site_average_price);
		tempPayNode.value += tempValue;
	}
} else if (temPayNodeStartObj.getTime() >= tempObjStartTimeObj.getTime() && temPayNodeEndObj.getTime() <= tempObjEndTimeObj.getTime()) {
	timeObj = getMonthAndDayInfo(temPayNodeStartObj, temPayNodeEndObj);
	tempValue = calculateValue(timeObj, tempObj.bill_people_num, tempObj.bill_site_average_price);
	tempPayNode.value += tempValue;
} else if (temPayNodeStartObj.getTime() <= tempObjEndTimeObj.getTime() && temPayNodeEndObj.getTime() >= tempObjEndTimeObj.getTime()) {
	if (temPayNodeStartObj.getTime() <= tempObjStartTimeObj.getTime()) {
		timeObj = getMonthAndDayInfo(tempObjStartTimeObj, tempObjEndTimeObj);
		tempValue = calculateValue(timeObj, tempObj.bill_people_num, tempObj.bill_site_average_price);
		tempPayNode.value += tempValue;
	}else {
		timeObj = getMonthAndDayInfo(temPayNodeStartObj, tempObjEndTimeObj);
		tempValue = calculateValue(timeObj, tempObj.bill_people_num, tempObj.bill_site_average_price);
		tempPayNode.value += tempValue;
	}
	
} else {
	timeObj = getMonthAndDayInfo(tempObjStartTimeObj, tempObjEndTimeObj);
	tempValue = calculateValue(timeObj, tempObj.bill_people_num, tempObj.bill_site_average_price);
	tempPayNode.value += tempValue;
}*/
//现代码
//找出结点和当前条目开始的最大值和结束的最小值计算即可
//S1S2E1E2  S2S1E1E2 S2S1E2E1 S1S2E2E1
var _start = temPayNodeStartObj.getTime() >= tempObjStartTimeObj.getTime() ? temPayNodeStartObj : tempObjStartTimeObj;
var _end = temPayNodeEndObj.getTime() >= tempObjEndTimeObj.getTime() ? tempObjEndTimeObj : temPayNodeEndObj;
timeObj = getMonthAndDayInfo(_start, _end);
tempValue = calculateValue(timeObj, tempObj.bill_people_num, tempObj.bill_site_average_price);
tempPayNode.value += tempValue;

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