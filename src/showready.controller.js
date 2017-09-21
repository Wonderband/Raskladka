(function() {
angular.module('Raskladka')
.controller('ShowReadyController', ShowReadyController)


ShowReadyController.$inject = ['NewTripService'];
function ShowReadyController( NewTripService) {
	var showCtrl = this;
	
	showCtrl.admin = NewTripService.admin;
	showCtrl.members = NewTripService.getReady();
	showCtrl.totalExpenses = 0;
	showCtrl.members.forEach( function(member) {
		showCtrl.totalExpenses += member.totalCost;
	});


	showCtrl.checkBalances = function() {
		var sum = 0;
		showCtrl.members.forEach(function(member) {
			sum += member.balance || 0;
		})
		return sum;
	}

	showCtrl.rememberExpenses = function() {
		NewTripService.rememberExpenses(showCtrl.members);
	};

	showCtrl.reCalculate = function(member) {

		showCtrl.totalExpenses -=member.totalCost;
		member.totalCost = 0;
		member.equipment.forEach(function(equip) {
			member.totalCost += (equip.cost || 0);
		});
		member.food.forEach(function(meal) {
			member.totalCost += (meal.cost || 0);
		});
		member.trainFood.forEach(function(meal) {
			member.totalCost += (meal.cost || 0);
		});

		member.totalCost += (member.addCost || 0);
		showCtrl.totalExpenses += member.totalCost;

		showCtrl.members.forEach(function(member, index) {
			member.balance = member.totalCost - showCtrl.totalExpenses / showCtrl.members.length;
		});
		var mealChecked = [];
		showCtrl.members.forEach(function(member, index) {
			member.noEat.forEach(function(meal) {
				if (mealChecked.indexOf(meal) != -1) return;
				var countRejectors = 1;				
				var rejectorsNumbers = [index];
				var costOfRejected = 0;
				showCtrl.members.forEach(function(otherMember, otherIndex) {
					if ((otherMember.noEat.indexOf(meal) != -1) && (index != otherIndex)) {
						countRejectors++;
						rejectorsNumbers.push(otherIndex);						
					};					
					var rejectedMeal = otherMember.food.find(function(otherMeal) {
						return (otherMeal.name == meal)
					});
					if (rejectedMeal) costOfRejected = rejectedMeal.cost;
					rejectedMeal = otherMember.trainFood.find(function(trainMeal) {
						return (trainMeal.name == meal)
					});
					if (rejectedMeal) costOfRejected += rejectedMeal.cost;					
				}) 
				if (countRejectors < showCtrl.members.length) {
				
					showCtrl.members.forEach(function(checkMember, checkIndex) {
						if (rejectorsNumbers.indexOf(checkIndex) == -1)
							checkMember.balance -= (costOfRejected / showCtrl.members.length) * countRejectors / 
						(showCtrl.members.length - countRejectors);
						else
							checkMember.balance += costOfRejected / showCtrl.members.length;
					});	
				};
				mealChecked.push(meal);		
			});
		});	
		
	}

	showCtrl.saveReady = function() {
		
		NewTripService.saveToServer();
		
	}

	showCtrl.saveExpenses = function(member, index) {
		
		NewTripService.saveMemberData(member, index);
	}

	showCtrl.members.forEach(function(member) {
		showCtrl.reCalculate(member);
	});
}


})();
