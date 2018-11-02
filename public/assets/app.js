// Grab the articles as a json
$.getJSON("/articles", function(data) {
	// For each one
	for (var i = 0; i < data.length; i++) {
	  // Display the apropos information on the page
	  var card = $('<div>');
	  card.addClass("card mt-2 mb-2");
	  card.attr("data-id", data[i]._id);
	  var cardBody = $('<div>');
	  cardBody.addClass("card-body");
	  
	  var cardTitle = $('<h5>');
	  cardTitle.addClass("card-title");
	  cardTitle.text(data[i].title);
  
	  var cardSubtitle = $('<h6>');
	  cardSubtitle.addClass("card-subtitle mb-2 card-link");
	  cardSubtitle.html(`<a href="${data[i].link}" target="__blank">Link to Article</a>`)
  
  
	  var cardText = $('<p>');
	  cardText.addClass("card-text");
	  cardText.text(data[i].summary);
	  
	  card.append(
		cardBody.append(
		  cardTitle, cardSubtitle, cardText
		)
	  );
  
	  $("#articles").append(card);
	}
  });
  
  
  // Whenever someone clicks a p tag
  $(document).on("click", ".card", function() {
	// Empty the notes from the note section
	$("#comments").empty();
	// Save the id from the p tag
	var thisId = $(this).attr("data-id");
  
	// Now make an ajax call for the Article
	$.ajax({
	  method: "GET",
	  url: "/articles/" + thisId
	})
	  // With that done, add the note information to the page
	  .then(function(data) {
		console.log(data);
		// The title of the article
		$("#comments").append("<h5>" + data.title + "</h5>");
		// An input to enter a new title
		$("#comments").append("<h6>Enter Name</h6>");
		$("#comments").append("<input id='commentname' class='form-control mt-2' name='commentname' >");
		// A textarea to add a new comment body
		$("#comments").append("<h6>Enter Comment</h6>");
		$("#comments").append("<textarea id='bodyinput' class='form-control mt-2'name='body'></textarea>");
		// A button to submit a new comment, with the id of the article saved to it
		$("#comments").append("<button data-id='" + data._id + "' class='btn btn-success mt-2' id='savecomment'>Save Comment</button>");
  
		// If there's a comment in the article
		if (data.comment) {
		  // Place the name of the note in the title input
		  $("#commentname").val(data.comment.name);
		  // Place the body of the note in the body textarea
		  $("#bodyinput").val(data.comment.body);
		}
	  });
  });
  
  // When you click the savenote button
  $(document).on("click", "#savecomment", function() {
	// Grab the id associated with the article from the submit button
	var thisId = $(this).attr("data-id");
  
	// Run a POST request to change the note, using what's entered in the inputs
	$.ajax({
	  method: "POST",
	  url: "/articles/" + thisId,
	  data: {
		// Value taken from title input
		name: $("#commentname").val(),
		// Value taken from note textarea
		body: $("#bodyinput").val()
	  }
	})
	  // With that done
	  .then(function(data) {
		// Log the response
		console.log(data);
		// Empty the notes section
		$("#comments").empty();
	  });
  
	// Also, remove the values entered in the input and textarea for note entry
	$("#commentname").val("");
	$("#bodyinput").val("");
  });
  