// Dependencies
var express = require("express");
var mongojs = require("mongojs");
// Require request and cheerio. This makes the scraping possible
var request = require("request");
var cheerio = require("cheerio");

/*
    cheerio takes the html from the request and let's you use jQuery like syntax to access particular text inside of it
*/

// Initialize Express
var app = express();

// Set up a static folder (public) for our web app
app.use(express.static("public"));

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Database configuration
var databaseUrl = "hwscraper";
var collections = ["scrapedData"];

// Hook mongojs configuration to the db variable
var db = mongojs(databaseUrl, collections);

// This makes sure that any errors are logged if mongodb runs into an issue
db.on("error", function(error) {
    console.log("Database Error:", error);
});

// Retrieve data from the db
app.get("/all", function(req, res) {
    // Find all results from the scrapedData collection in the db
    db.scrapedData.find({}, function(error, found) {
        // Throw any errors to the console
        if (error) {
            console.log(error);
        }
        // If there are no errors, send the data to the browser as json
        else {
            res.json(found);
        }
    });
});

app.get('/comments/:id', function(req, res){
    db.scrapedData.findOne(
        {
            // Using the id in the url
            _id: mongojs.ObjectId(req.params.id)
        },
        function(error, found) {
            // log any errors
            if (error) {
                console.log(error);
                res.send(error);
            }
            else {
                // Otherwise, send the note to the browser
                // This will fire off the success function of the ajax request
                console.log(found);
                // res.send(found);
            }
        }
    );
    res.render('../views/pages/comments');
    // db.scrapedData.find({}, function(error, found) {
    //     // Throw any errors to the console
    //     if (error) {
    //         console.log(error);
    //     }
    //     // If there are no errors, send the data to the browser as json
    //     else {
    //         res.json(found);
    //     }
    // });
});

app.post("/submit/:id", function(req, res) {
    console.log(req.body);
    db.scrapedData.update(
        {_id: mongojs.ObjectID(req.params.id)},
        {$push : {
                comments : {
                name: req.body.name,
                comment: req.body.comment
                }
            } 
        },
        function(err, results) {
            if (err) {
                // Log the error if one is encountered during the query
                console.log(err);
            }
            else {
                res.redirect('/');
            }
        });
    
});

// Scrape data from one site and place it into the mongodb db
app.get("/scrape", function(req, res) {
    // Make a request for the news section of `ycombinator`
    request("https://www.nytimes.com/topic/subject/exercise", function(error, response, html) {
        // Load the html body from request into cheerio
        var $ = cheerio.load(html);
        // For each element with a "story-body" class
        $(".story-body").each(function(i, element) {
            // Save the text and href of each link enclosed in the current element
            var title = $(element).find('div > a > div.story-meta > h2').text().trim();
            var link = $(element).children("a").attr("href");
            var summary = $(element).find('div > a > div.story-meta > p.summary').text().trim(); 
            var author = $(element).find('div > a > div.story-meta > p.byline').text().trim();
            var articleImg = $(element).find('div > a > div.wide-thumb > img').attr("src"); 

            // If this found element had both a title and a link
            
            // Insert the data in the scrapedData db
            db.scrapedData.insert({
                title: title,
                link: link,
                summary: summary,
                author: author,
                articleImg: articleImg
            },
            function(err, inserted) {
                if (err) {
                    // Log the error if one is encountered during the query
                    console.log(err);
                }
                else {
                    // Otherwise, log the inserted data
                    console.log(inserted);
                }
            });
        });
    });

    // Send a "Scrape Complete" message to the browser
    res.send("Scrape Complete");
});


// Listen on port 3000
app.listen(3000, function() {
    console.log("App running on port 3000!");
});

