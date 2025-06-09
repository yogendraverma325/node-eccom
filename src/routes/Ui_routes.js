import express from 'express';
const router = express.Router();

router.get('/', (req, res) => {
    res.render('index', {
        title: 'Home | SEO Portal',
        description: 'This is a sample SEO-friendly home page using Node.js and EJS.'
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
    const { slug } = req.params;
    res.render('login', {
      title: `Blog: ${slug} | SEO Portal`,
      description: `Read about ${slug} in detail.`,
      slug
    });
  });
router.post('/login', (req, res) => {
const  slug  = req.body;
console.log("slugfbfggfgfb",slug)
res.render('login', {
    title: `Blog: | SEO Portal`,
    description: `Read about in detail.`,
    data:slug,
    validationError: 'TMC Not Found',   // example validation message
    someOtherData: 'Additional info here'
});
});
  router.get('/signup', (req, res) => {
    const { slug } = req.params;
    res.render('register', {
      title: `Blog: ${slug} | SEO Portal`,
      description: `Read about ${slug} in detail.`,
      slug
    });
  });

export default router;
