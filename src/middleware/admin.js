export const isAdmin = (req, res, next) => {
    // Check karein ki user logged in hai aur uska is_admin true hai
    if (req.session && req.session.user && req.session.user.is_admin) {
        return next(); // Agar admin hai toh aage badhne dein
    } else {
		req.flash('message', JSON.stringify({
		type: 'error',
		text: 'Please login to continue'
	}));
        // Agar admin nahi hai toh error dein ya login par redirect karein
        // res.status(403).send("Unauthorized: Only admins can access this area.");
        res.redirect('/'); // Ya phir home page par bhej dein
    }
};