function organize(data) {
	let organized = {
		'applied': [],
		'hackerrank': [],
		'phone': [],
		'onsite': [],
		'rejected': []
	};
	
	let ongoing = data.filter(app => app.status == True);
	let rejected = data.filter(app => app.status != True);
	
	ongoing.forEach(function(app) {
		organized['applied'].push(app);
		switch (app.stage) {
			case 'hackerrank':
				organized['hackerrank'].push(app);
				break;
			case 'phone':
				organized['phone'].push(app);
				break;
			case 'onsite':
				organized['onsite'].push(app);
				break;
		};
	});
	
	rejected.forEach(function(app) {
		organized['rejected'].push(app);
	})
	
	return organized;
}

module.exports = {
	organize
}
