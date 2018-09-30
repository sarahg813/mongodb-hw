function displayArticles(articles) {
    // First, empty the table
    $(".articlesDiv").empty();
    
    // Then, for each entry of that json...
    articles.forEach(function(article) {
        var card = $('<div>').addClass("card flex-md-row mb-4 shadow-sm h-md-250");
        var cardBody = $('<div>').addClass("card-body d-flex flex-column align-items-start");
        var h3 = $('<h3>').addClass("card-body d-flex flex-column align-items-start");
        var articleLink = $('<a>').addClass("text-dark").attr('href', article.link).text(article.title);

        h3.append(articleLink);
        var mutedDiv = $('<div>').addClass("mb-1 text-muted").text(article.author);
        var p = $('<p>').addClass("card-text mb-auto").text(article.summary);

        var form = $('<form>').attr({
            method:"POST", 
            action:"/submit/" + article._id
        });                             
        var nameLabel = $('<label>').attr('for', 'nameInput').text("Name");
        var nameInput = $('<input>').addClass("form-control").attr({ id:"nameInput", name:"name" }); 

        var commentLabel = $('<label>').attr('for', 'postComment').text("Post Your Comment");
        var commentInput = $('<input>').addClass("form-control").attr({ id:"postComment", name:"comment", rows: 2 }); 
        var submitBtn = $('<button>').addClass("btn btn-outline-info").attr('type', 'submit').text("Submit");
        submitBtn.attr('data-id', article._id);

        form.append(nameLabel, nameInput, commentLabel, commentInput, submitBtn);

        var commentDiv = $('<div>').addClass("commentsDiv");

        cardBody.append(h3, mutedDiv, p, form, commentDiv);

        var articleImg = $('<img>').addClass("card-img-right flex-auto d-none d-lg-block").attr('src', article.articleImg);
        
        card.append(cardBody, articleImg);
        
        $(".articlesDiv").append(card);

 
        if (article.comments) {
            article.comments.forEach(function(post) {
                var postDiv = $('<div>').addClass("postDiv");
                var commentP = $('<p>').addClass("commentTxt").text(post.comment);
                var commentAuthor = $('<p>').addClass("commentAuthor").text(post.name);

                postDiv.append(commentP, commentAuthor);
                $('.commentsDiv').append(postDiv);
            });
        }
    });

}

function displayComments(comments) {
    $(".commentsDiv").empty();
    
    // Then, for each entry of that json...
    comments.forEach(function(comment) {
        // var commentDiv = $('<div>').addClass("commentDiv");
        var ob = comment.comments;
        if (ob) {
            ob.forEach(function(post) {
                var commentP = $('<p>').addClass("commentTxt").text(post.comment);
                var commentAuthor = $('<p>').addClass("commentAuthor").text(post.name);
                $('.commentsDiv').append(commentP, commentAuthor);
            });
        }
        
    }); 
    
}

// First thing: ask the back end for json with all articles
$.getJSON("/all", function(data) {
    // Call our function to generate a table body
    displayArticles(data);
});

