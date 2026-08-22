import express from 'express';
import session from 'express-session';
import path from 'node:path';
import { fileURLToPath } from 'url';
import { appendToFile, readAllFiles, readFile, updateFile, deleteArticleFile } from './files.js';

const app = express();

// Defining the port
const PORT = 3000;
const HOST = 'localhost';

// Getting filename and dirname on ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.listen(PORT, HOST, () => {
    console.log(`Server running and listening on http://${HOST}:${PORT}`);
});

// Petition handling middleware 
app.use(express.json());
app.use(express.urlencoded({extended: true}))
app.use(express.static(path.join(__dirname, '../Frontend')));

// Session middleware
app.use(session({
    secret: 'secretpass123', 
    resave: false,                           
    saveUninitialized: false,                
    cookie: { maxAge: 3600000 }              
}));

// Setting up the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../Frontend'));

// From the root base, it gets redirected to the home page
app.get('/', (req, res) => {
    res.redirect('/home');
});

// Renders the home page
app.get('/home', async (req, res) => {
    try {

        // Everytime it goes to home, the session goes back to public
        req.session.isAdmin = false;

        // Gets all the current articles
        const allArticles = await readAllFiles();
        res.render('articleList', { articles: allArticles } );

    } catch (err) {
        console.error("Error trying to load main page ", err);
        res.status(500).send('Server error');
    }
});

// Renders New Article page
app.get('/add-article', async (req, res) => {
    res.render('newArticle');
});

// Listens for form handling requests and redirects to the article display
app.post('/handle-new-article', async (req, res) => {

    const title = req.body.article_title;
    const publishingDate = req.body.publishing_date;
    const content = req.body.article_content;

    // Handles the request by creating the redirection ID and saving its body
    const newID = await appendToFile(title, publishingDate, content)

    console.log(`Your article is ${title}, published in ${publishingDate} with the next content: ${content}`);

    res.redirect(`/article/${newID}`);
});

// Displays an article
app.get('/article/:id', async (req, res) => {
    
    try {
        // Extracts the article id
        const articleID = req.params.id;
        let redirVariable = 'public';
        if (req.session.isAdmin) { redirVariable = 'admin'; }
    
        // Reads the file
        const fileData = await readFile(articleID);
        const article = JSON.parse(fileData);
        console.log(article);

        res.render('showArticle', {data: article, redirVariable});
        
    } catch (err) {
        console.error("Error: ", err);
        res.status(404).send('Articulo no encontrado')
    }

});

// Allows access to the admin panel
app.post('/login', async (req, res) => {
        const user = req.body.username; 
        const password = req.body.password;

        if (user === "admin" && password === "secretpass123") {
            req.session.isAdmin = true; // Its a customizable property of the req.session
            res.redirect('/admin');
        } else {
            res.status(401).send("Incorrect user or password.");
        }
});

// Redirects to the article panel for admins
app.get('/admin', async (req, res) => {

    if (!req.session.isAdmin) { return res.status(401).send("Unauthorized access."); }

    try {
        // Gets all the current articles
        const allArticles = await readAllFiles();
        res.render('articleListAdmin', { articles: allArticles } )
    } catch (err) {
        console.error("Error: ", err);
        res.status(500).send('There was a mistake trying to logging in.');
    }
});

// Listens for edit buttons clicked
app.get('/edit-article/:id', async (req, res) => {
    try {
        const articleID = req.params.id;

        const articleRaw = await readFile(articleID);
        const article = JSON.parse(articleRaw);
        console.log("Article Body: ", article)
        res.render('editArticle', { article: article });
        
    } catch (err) {
        res.status(401).send("Error");
    }
});

// Updates an article
app.post('/update-article/:id', async (req, res) => {

    const id = req.params.id;
    const title = req.body.article_title;
    const publishingDate = req.body.publishing_date;
    const content = req.body.article_content;

    await updateFile(id, title, publishingDate, content);
    res.redirect(`/article/${id}`);

});

// Deletes an article
app.get('/delete-article/:id', async (req, res) => {

    if (!req.session.isAdmin) { return res.status(401).send("Unauthorized access."); }

    try {
        const articleId = req.params.id;
        await deleteArticleFile(articleId); 
        res.redirect('/admin');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error trying to remove.');
    }
});