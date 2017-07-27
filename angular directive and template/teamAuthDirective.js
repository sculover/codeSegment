app.directive("teamAuthDirective", [function() {
	return {
		restrict: 'AE',
		template: '<button class="{{class}}" ng-click="showTeamAuth()">发起认证1</button>',
		replace: true,
		scope: {
			"class": "@customerClass",
			"org_id": '@orgId'
		},
		controller: "teamAuthDirectiveController"
	}
}]);
app.controller("teamAuthDirectiveController", ['$scope', '$modal', '$rootScope', 'RestApi', function($scope, $modal, $rootScope, RestApi) {
	console.log($scope.org_id);

	$scope.authAddressIdsExt = [];
	$scope.authAddressDataExt = [];
	$scope.realAddressIds = [];
	// 团队详情数据
	$scope.orgAuthShowInfo  = {};
	var detailTapi = 'crm_crm-organizations';
	// 获取团队基础数据方法
	function getBasicData() {
		var p = new Promise(function(resolve, reject) {
			var data = {
				'org_id' : $scope.org_id,
			}
			RestApi.run(detailTapi).view(data, function(response){
				if (response.statuscode == CODE_SUCCESS) {
					$scope.orgAuthShowInfo = response.data;
					$scope.orgAuthShowInfo.num = 1;
					//默认显示已有地址信息
					if(JSON.stringify($scope.orgAuthShowInfo.work_addr) != "{}") {
						$scope.addressData = [{
							'n':$scope.orgAuthShowInfo.nation_id ? '中国' : '',
							'id':$scope.orgAuthShowInfo.nation_id ? $scope.orgAuthShowInfo.nation_id : null,
						},{
							'n':$scope.orgAuthShowInfo.work_addr.province_name,
							'id':$scope.orgAuthShowInfo.province_id ? $scope.orgAuthShowInfo.province_id : null,
						},{
							'n':$scope.orgAuthShowInfo.work_addr.city_name && $scope.orgAuthShowInfo.work_addr.city_name != $scope.orgAuthShowInfo.work_addr.province_name ?
								$scope.orgAuthShowInfo.work_addr.city_name : '',
							'id':$scope.orgAuthShowInfo.city_id ? $scope.orgAuthShowInfo.city_id : null,
						},{
							'n':$scope.orgAuthShowInfo.work_addr.district_name,
							'id':$scope.orgAuthShowInfo.district_id ? $scope.orgAuthShowInfo.district_id : null,
						}];
						$scope.realAddressIds.push({
							'nation_id' : $scope.addressData[0] ? $scope.addressData[0].id : null,
							'province_id' : $scope.addressData[1] ? $scope.addressData[1].id : null,
							'city_id' : $scope.addressData[2] ? $scope.addressData[2].id : null,
							'district_id' : $scope.addressData[3] ? $scope.addressData[3].id : null,
						});
					}
					//默认显示已有覆盖地域
					if(JSON.stringify($scope.orgAuthShowInfo.cover_area_addrs) != "{}") {
						$scope.authAddressIdsExt = [];
						$scope.authAddressDataExt = [];
						$scope.authAddressIdsExt = $scope.orgAuthShowInfo.cover_area_addrs.id_arr;
						var len = $scope.orgAuthShowInfo.cover_area_addrs.id_name_arr;
						for(var i = 0; i < len.length; i++) {
							$scope.authAddressDataExt.push (
								(len[i].nation_name ? (len[i].nation_name ):"") 
								+ (len[i].province_name ? ("-" + len[i].province_name):"")
								+ (len[i].city_name && len[i].city_name != len[i].province_name ? ("-" + len[i].city_name):"")
								+ (len[i].district_name ? ("-" + len[i].district_name):"")
							);
						}
						$scope.authAddressIds = $scope.authAddressIdsExt;
						$scope.authAddressData = $scope.authAddressDataExt;
					}
					resolve();
				} else {
					reject(response);
				}
			});
		});
		return p;
	}
	// 获取机构类型数据
	function getOrgType() {
		var p = new Promise(function(resolve, reject) {
			var tapi = 'orgauth_orgs_basic-info';//获取机构筛选类型
			RestApi.run(tapi).list("", function(response) {
				if (response.statuscode == CODE_SUCCESS) {
					$scope.mechanismTypeDatas = response.data
					resolve();
				} else {
					reject(response);
				}
			})
		});
		return p
	}
	// 发起认证弹窗
	$scope.showTeamAuth = function() {
		Promise.all([getBasicData(), getOrgType()])
		.then(function() {
			var teanAuthModel = $modal.open({
				templateUrl: "rest/org/org-institution/team_auth_modal.html",
				controller: "TeamAuthModalInstanceCtrl",
				resolve: {
					items: function() {
						return {
							"orgAuthShowInfo": $scope.orgAuthShowInfo,
							"addressData": $scope.addressData,
							"mechanismTypeDatas": $scope.mechanismTypeDatas
						}
					}
				}
			});
		})
		.catch(function(e) {
			var msg = e.message ? e.message : "操作失败";
			$rootScope.showAlertModal(msg);
		})
	}

	//地域多选
	$scope.$on("target-select-address-mutiple", function (event, data, returnArr, item) {
		$scope.authAddressData = $scope.authAddressDataExt && $scope.authAddressDataExt.length>0 ? ($scope.authAddressDataExt.concat(data)):data;
		var ids = [];
		for(var i=0;i<returnArr.length;i++){
			if(returnArr[i]==99||returnArr[i]==86){
				ids.push({
					'nation_id' : returnArr[i],
				})
			}else{
				ids.push({
					'nation_id' : returnArr[i].split("-")[0],
					'province_id' : returnArr[i].split("-")[1],
					'city_id' : returnArr[i].split("-")[2],
					'district_id' : returnArr[i].split("-")[3],
				})
			}
		}
		$scope.authAddressIds = $scope.authAddressIdsExt && $scope.authAddressIdsExt.length>0 ? ($scope.authAddressIdsExt.concat(ids)):ids;
	});
	//删除地域
	$scope.delArea = function(name,index,num) {
		var item = index;
		$scope.authAddressData.splice(item,1);
		$scope.authAddressIds.splice(item,1);
		$scope.$broadcast('delete-select-address',item);
	}
	
}]);

app.controller("TeamAuthModalInstanceCtrl", ['$scope', 'items', '$modalInstance', function($scope, items, $modalInstance) {
	// 初始化数据
	if (items) {
		for (var key in items) {
			$scope[key] = items[key];
		}
	}
	console.log($scope);
	// 关闭弹窗
	$scope.cancel = function() {
		$modalInstance.dismiss('cancel');
	}
}]);