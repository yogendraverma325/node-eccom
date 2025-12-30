export const isLogin = (req, res, next) => {
	if (req.session && req.session.user) {
		return next(); // user logged in hai
	}

	// ❌ login nahi hai
	req.flash('message', JSON.stringify({
		type: 'error',
		text: 'Please login to continue'
	}));

	return res.redirect('/user/login');
};
