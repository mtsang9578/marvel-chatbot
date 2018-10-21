
$('.send').on('click', function () {
    console.log("i was clicked");
    let text = $('message-box').val();
    console.log("the text length" + text.length);
    if(text.length > 0) {
        $('#chatlog').append(`
        <div class="row speech-row">
         <div class="speech-bubble rounded self">${text}</div>
    </div>`
    );
    }


});
