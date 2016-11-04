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