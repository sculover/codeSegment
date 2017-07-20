/*
* angular js 限制只能输入数字
*/
app.directive('numberOnly', [function() {
	return {
		restrict: 'A',
		require: '?ngModel',
		link: function(scope, element, attrs, ngModel) {
			if (ngModel) {
				element.on('keyup', function(e) {
					this.value = this.value.replace(/[^\d]/g,'');
				});
				element.on('beforepaste', function(e) {
					clipboardData.setData('text',clipboardData.getData('text').replace(/[^\d]/g,''));
				});
			}
		}
	}
}]);
