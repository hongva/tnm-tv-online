angular.module('starter')
//Get Category For Menu
.controller('MenuCtrl', function($http, $scope, $sce, $ionicScrollDelegate){
	
	$scope.categories = [];
	
	$http.get("http://ctv8.codingate.net/rest/get_category_index/").then(
		function(returnedData){
			$scope.categories = returnedData.data.categories;
			console.log(returnedData);
         
		}, function(err){
			console.log(err);
	})
})
//Get Posts	
.controller('MainCtrl', function($http, $scope,$filter, $sce, $ionicScrollDelegate,$ionicSlideBoxDelegate,$timeout, $localStorage, $ionicLoading){

	$scope.offset = 0;
	$scope.count_total = 1;
    
	$scope.doRefresh = function(){
		$scope.recent_posts = [];
		$http.get("http://ctv8.codingate.net/rest/get_posts/").then(function(data){
			console.log(data);
			$scope.recent_posts = data.data.posts;
			$scope.count_total = data.data.count_total;
			$scope.recent_posts.forEach(function(element, index, array){
				element.excerpt = element.excerpt.substr(0,110);
				element.excerpt = element.excerpt + "... Read More";
				element.excerpt = $sce.trustAsHtml(element.excerpt);
				if($scope.Favorites.indexOf(element.id) != -1)
					element.isFavorite = true;
				else
					element.isFavorite = false;
			});
			
			$scope.$broadcast('scroll.refreshComplete');

		}, function(err){

		})
	}

	$scope.Favorites = $localStorage.Favorites;
	if(!$scope.Favorites)
		$scope.Favorites = [];

	$scope.recent_posts = [];

	$http.get("http://ctv8.codingate.net/rest/get_posts/").then(function(data){
		console.log(data);
		$scope.recent_posts = data.data.posts;
		$scope.count_total = data.data.count_total;
		$scope.recent_posts.forEach(function(element, index, array){
			element.excerpt = element.excerpt.substr(0,110);
			element.excerpt = element.excerpt + "... Read More";
			element.excerpt = $sce.trustAsHtml(element.excerpt);
			if($scope.Favorites.indexOf(element.id) != -1)
				element.isFavorite = true;
			else
				element.isFavorite = false;
		})
	}, function(err){

	})
 //get data recently post for slideshow
    $scope.recently_posts = [];
	$http.get("http://ctv8.codingate.net/rest/get_recent_posts/").then(function(data){
		console.log(data);
		$scope.recently_posts = data.data.posts;
	}, function(err){

	})


	$scope.canLoadMore = function()
	{
		return true;
	}

	$scope.timer = new Date().getTime();
	$scope.lastTimer = new Date().getTime();

	$scope.loadMore = function(){
		
		$scope.timer = new Date().getTime();
		console.log(new Date($scope.timer - $scope.lastTimer).getTime())
		if(new Date($scope.timer - $scope.lastTimer) > 5000)
		{
			$scope.lastTimer = new Date().getTime();
			$http.get("http://ctv8.codingate.net/rest/get_posts/?offset="+$scope.offset)
			.then(function(data){
				var newPosts = data.data.posts;
				$scope.count_total = data.data.count_total;

				newPosts.forEach(function(element, index, array){
					element.excerpt = element.excerpt.substr(0,110);
					element.excerpt = element.excerpt + "... Read More";
					element.excerpt = $sce.trustAsHtml(element.excerpt);
				})

				$scope.recent_posts.push.apply($scope.recent_posts, newPosts);
				$scope.$broadcast("scroll.infiniteScrollComplete");
				$scope.offset += 10;
		});
		}
		
	};
	
	$scope.searchTextChanged = function(){
		$ionicScrollDelegate.$getByHandle('mainScroll').scrollTop(true);
	}

	$scope.toggleFavorite = function(post){

		post.isFavorite = !post.isFavorite;

		if(post.isFavorite == true)
		{
			$scope.Favorites.push(post.id);
		}
		else
		{
			$scope.Favorites.forEach(function(e, i ,a){
				if(e == post.id){
					$scope.Favorites.splice(i, 1);
					console.log("Spliced index "+ i);
				}
			})
		}

		$localStorage.Favorites = $scope.Favorites;
	}
})
//Get Post Detail
.controller('PostCtrl', function($scope, $http, $stateParams, $sce){
	
	$http.get('http://ctv8.codingate.net/rest/get_post/?id='+ $stateParams.postId).then(
		function(data){
			$scope.post_title = data.data.post.title;
			$scope.post_category = data.data.post.categories[0].title ? data.data.post.categories[0]
				.title : 'No Category';
			$scope.post_content = $sce.trustAsHtml(data.data.post.content);
			$scope.post_date = data.data.post.date;
			$scope.post_authorName = data.data.post.author.first_name + " " + data.data.post.author.last_name;
		      if($scope.post_authorName.trim() == '')
		        $scope.post_authorName = "No Name";
		  //    $scope.post_authorImage = 'http://www.codingate.com/wp-content/uploads/2014/12/hong.jpg';
		      $scope.post_image = data.data.post.thumbnail_images.full.url;
		      $scope.post_commentCount = data.data.post.comment_count;
		      $scope.post_views = data.data.post.custom_fields.post_views_count[0];
		      $scope.post_url = data.data.post.url;
		}, function(err){

		})

	$scope.Share = function(){
		window.plugins.socialsharing.share($scope.post_title, $scope.post_image, $scope.post_url);
	}

})
//Get Category
.controller('CatCtrl', function($http, $scope, $sce, $stateParams){
	
	$scope.doRefresh = function(){
		$http.get('http://ctv8.codingate.net/rest/get_category_posts/?id=' + $stateParams.catId).then(
		function(data){
			$scope.category_posts = data.data.posts;
	        $scope.category_posts.forEach(function(element, index, array){
	          element.excerpt = element.excerpt.substr(0,110);
	          element.excerpt = element.excerpt + '... Read More';
	          element.excerpt = $sce.trustAsHtml(element.excerpt);
	        })
	        $scope.category_title = data.data.category.title;
	        $scope.$broadcast('scroll.refreshComplete');
	        
		}, function(err){

		})
	}

	$scope.doRefresh();

})
//Get Favorite
.controller('FavCtrl', function($http, $scope, $localStorage, $sce){

	$scope.doRefresh = function(){

    $scope.Favorites = $localStorage.Favorites;
    $scope.favorite_posts = [];
    $scope.Favorites.forEach(function(element, index, array){
      $http.get('http://ctv8.codingate.net/rest/get_post/?id='+element)
      .success(function(data){
        $scope.favorite_posts.push(data.post);

        if($scope.favorite_posts.length == $scope.Favorites.length)
        {
          $scope.favorite_posts.forEach(function(post, position, list){
            post.excerpt = post.excerpt.substr(0,110);
            post.excerpt = post.excerpt + '... Read More';
            post.excerpt = $sce.trustAsHtml(post.excerpt);
            
            if($scope.Favorites.indexOf(post.id) != -1)
              post.isFavorite = true;
            else
              post.isFavorite = false;
          })
        }
      })

      .finally(function(){
        $scope.$broadcast('scroll.refreshComplete');
      })
    })

  }

  $scope.doRefresh();

  $scope.toggleFavorite = function(post){
    post.isFavorite = !post.isFavorite;

    if(post.isFavorite)
    {
      $scope.Favorites.push(post.id)
    }
    else
    {
      $scope.Favorites.forEach(function(element, index, array){
        if(element == post.id)
        {
          $scope.Favorites.splice(index, 1);
          console.log("Spliced Item from index " + index);
        }
      })
    }
    $localStorage.Favorites = $scope.Favorites;
  }
})