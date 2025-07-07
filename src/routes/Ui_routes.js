import { name } from 'ejs';
import express from 'express';
const router = express.Router();
// const isAuthenticated = (req, res, next) => {
//   if (req.session.user) return next();
//   res.redirect('/login');
// };
const getUser = (req) => {
  if (req.session.user) return req.session.user;
  return null;
};
router.get('/', (req, res) => {
  const user = getUser(req) || null;
  console.log("user", user);
  // Render the home page with SEO metadata
  // You can also pass user data to the template if needed
  // For example, if you want to display the user's name on the home page   
  res.render('index', {
    title: 'Home',
    description: 'This is a sample SEO-friendly home page using Node.js and EJS.',
    user
  });
});

router.get('/blog/:slug', (req, res) => {
  const { slug } = req.params;
  res.render('blog', {
    title: `Blog: ${slug} | SEO Portal`,
    description: `Read about ${slug} in detail.`,
    slug
  });
});
router.get('/login', (req, res) => {
  const locationCookie = req.cookies.userLocation;
  let location = null;

  if (locationCookie) {
    try {
      location = JSON.parse(locationCookie); // { latitude: ..., longitude: ... }
      console.log('User location from cookie:', location);
    } catch (error) {
      console.error('Invalid location cookie:', error.message);
    }
  }
    const { slug } = req.params;
    res.render('login', {
      title: `Blog: ${slug} | SEO Portal`,
      description: `Read about ${slug} in detail.`,
      slug,
      validationError:''
    });
  });
router.post('/login', (req, res) => {
const  slug  = req.body;
console.log("slugfbfggfgfb",slug.tmc,slug.password);
const USERS = [
  { id: 1, tmc: '13675', password: 'Teams@123',name:"Yogendra" }
];
const user = USERS.find(
  u => u.tmc === req.body.tmc && u.password === req.body.password
);

if (user) {
  // Set session
  req.session.user = {
    id: user.id,
    tmc: user.tmc,
    name: user.name
  };
  return res.redirect('/');
}
res.render('login', {
    title: `Login`,
    description: `Read about in detail.`,
    data:slug,
    validationError: 'TMC Not Found',   // example validation message
    someOtherData: 'Additional info here'
});
});

  router.get('/logout', (req, res) => {
    req.session.destroy(err => {
      if (err) console.error(err);
    });
    return res.redirect('/');
  });

export default router;
