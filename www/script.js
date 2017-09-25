var myApp = angular.module('MyApp', ['onsen', 'ui.router', 'ngAnimate']);

// 遷移処理
myApp.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {

		$stateProvider
			.state('search', {
				url: '/search',
				templateUrl: 'search.html'
			})
			
	}]);

// 検索画面用コントローラ
myApp.controller('SearchController', ['$scope', '$state', '$rootScope', 'JsonCountryService', function($scope, $state, $rootScope, JsonCountryService) {
		
		$scope.searchCountry = function() {
			// まず、ローディングを回す
			$rootScope.isLoading = true;
			
			// Jsonデータ取得
			JsonCountryService.run($scope.searchText).then(
				function(resultList) {
					// 結果リストが取れたら、スコープに設定
					$scope.message = resultList.length + "件見つかりました。";
					$scope.list = resultList;
					
					// ローディング終了
					$rootScope.isLoading = false;
				}, function(response) {
					$scope.message = "検索結果がありませんでした。";
					$scope.list = null;
    				
					// ローディング終了
					$rootScope.isLoading = false;
				}
			);
		}
	
	}]);

// ローディングタグ
myApp.directive('myLoader', function() {
		return {
			restrict : 'E',
			replace: true,
			templateUrl: "loader.html"
		};
	});	
	
	
// 画面遷移タイミング処理
myApp.run(['$rootScope', '$transitions', '$state', function($rootScope, $transitions, $state){
	$transitions.onSuccess({to:'*'}, function(trans){
		// ページ読み込み成功
		
		// ローディングフラグOFF
		$rootScope.isLoading = false;
	});
	
}]);
		

// JSON読込サービス
myApp.service('JsonCountryService', ['$q', '$timeout', '$http', '$filter', function($q, $timeout, $http, $filter){
     this.run = function (searchText) {
     	console.log("JsonCountryService searchText="+ searchText);
       	
		var deferred = $q.defer();
     	
		$timeout(function(){
			$http({
				method: 'GET',
				url: 'country.json'
			}).then(function successCallback(response) {	
				// 成功した場合			
				console.log("JsonCountryService success");
		
				var resultList;
				if (searchText && searchText.length > 0) {
					// 検索文字列が指定されている場合、リストの中から該当値のものだけ取得する
					// 検索範囲は絞りこまない
					// 完全一致ではなく、部分一致とする
					resultList = $filter("filter")(response.data.list, searchText, false);					
				}
				else {
					// 検索文字列が指定されていない場合、全データを返す
					resultList = response.data.list;
				}
				
				// 検索結果を返す
				deferred.resolve(resultList);

			}, function errorCallback(response) {
				// 失敗した場合
				var msg = "JsonCountryService json取得失敗: "+ response.status;
				
				console.error(msg);
				console.log("response.data"+ response.data);
				console.log("response.headers"+ response.headers);
				console.log("response.config"+ response.config);
				console.log("response.statusText"+ response.statusText);
				console.log("response.xhrStatus"+ response.xhrStatus);
				
				deferred.reject(msg);
			});
		});
		
		return deferred.promise;
    };

}]);
        		