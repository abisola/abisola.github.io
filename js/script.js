
var thisweekfeed = "https://spreadsheets.google.com/feeds/list/1pFCjnpg3dESVAAaZ3mqr0IHwjzU2-a7Ubd-yala1azs/od6/public/basic?alt=json";
var nextweekfeed = "https://spreadsheets.google.com/feeds/list/1pFCjnpg3dESVAAaZ3mqr0IHwjzU2-a7Ubd-yala1azs/oxuxkoi/public/basic?alt=json";
var numbersfeed = "https://spreadsheets.google.com/feeds/list/1pFCjnpg3dESVAAaZ3mqr0IHwjzU2-a7Ubd-yala1azs/opd6j2h/public/basic?alt=json";
//
//https://spreadsheets.google.com/feeds/worksheets/1pFCjnpg3dESVAAaZ3mqr0IHwjzU2-a7Ubd-yala1azs/private/full


var _week;
var pause = 16000;
var motion = 1500;

var items = $('.scrolling-item');
var count = items.length;
var i = 0;

var weekdays = new Array(7);
weekdays[0] = "Sun";
weekdays[1] = "Mon";
weekdays[2] = "Tue";
weekdays[3] = "Wed";
weekdays[4] = "Thu";
weekdays[5] = "Fri";
weekdays[6] = "Sat";

var debugmode = false;
var debug_item = 3;

// onLoad
$(function() {
  // Handler for .ready() called.
  console.log("this is it!! ");

  $('.scrolling-item').hide().eq(0).show();


  var template = $('#template').html();
  // Mustache.parse(template);   // optional, speeds up future uses
  //This week's assessments
  $.getJSON(thisweekfeed,function(data){

    var entry = data.feed.entry;
    _week = "this week";
    var assessments = makeProperJSON(entry, _week);
    console.log(JSON.stringify(assessments));

    var rendered = Mustache.render(template, assessments);

    // console.log(rendered);
    $("#thisweek-list").html(rendered);
  });

  //Next week's assessments
  $.getJSON(nextweekfeed,function(data){

    var entry = data.feed.entry;
    _week = "next week";
    var assessments = makeProperJSON(entry, _week);
    console.log(JSON.stringify(assessments));

    var rendered = Mustache.render(template, assessments);

    // console.log(rendered);
    $("#nextweek-list").html(rendered);
  });

  //other interesting data...
  //TODO this is BAD!!
  $.getJSON(numbersfeed, function(data){

    var entry = data.feed.entry;
    var numbers = [];
    $(entry).each(function(op){
      var _title = this.title.$t;
      var _content = 0;
      try {
        _content = this.content.$t.split(": ")[1];
      } catch (e) {
        console.log("unable to get data.. "+e);
      }

      numbers.push(_content);
    });

    //for incomplete numbers...
    $("#incomplete-panel h2").text(numbers[0]);

    // console.log(rendered);
    // $("#nextweek-list").html(rendered);
  });


  // scroll(10000);
  if (!debugmode) {
    setTimeout(transition,pause);
  } else {
    $('.scrolling-item').hide().eq(3).show();
  }
});

function transition(){
    // items.eq(i).animate({opacity:'toggle'});
    items.eq(i).slideUp("slow");

    if(++i>=count){
        i=0;
    }

    // items.eq(i).animate({opacity:'toggle'});
    items.eq(i).slideDown("slow");

    setTimeout(transition, pause);
}

function scroll(delay) {
  $( ".scrolling-item" ).each(function(index) {
      setDelay(index, delay, this);
  });
}

//every 10 seconds make the change...
function setDelay(i, delay, item) {
  setTimeout(function(){
    console.log(i + " -- " +new Date().getSeconds());
    $(".scrolling-item").addClass("hidden");
    $(item).removeClass("hidden");
  }, delay*i);
}

/**
* Helper functions to make things more useful.
* In this case, the JSON object that comes back is not real proper so we want to
* transform it into something that can be used by mustache-like renderer
*/

function makeProperJSON(entry, _week){
  var assessments = [];
  $(entry).each(function(op){

    var _title = this.title.$t;
    var _content = this.content.$t;
    console.log(_title + ": " + _content);
        //     _content.split(", ")[0].split(": ")[1]

    var stage = splitter(_content, 0);
    var manager = splitter(_content, 1);
    var date = splitter(_content, 2);
    var time = splitter(_content, 3);

    var _splitday = date.split("/");

    var _day = new Date(_splitday[2]+"-"+_splitday[1]+"-"+_splitday[0]);

    var day = weekdays[_day.getDay()] + " " + time;

    var location = splitter(_content, 4);
    var department = splitter(_content, 5);

    var assessment = {
      "title": _title,
      "stage": stage,
      "manager": manager,
      "date": day,
      "location": location,
      "department": department
    };
    assessments.push(assessment);
  });

  var jsonobj = {"assessments": assessments, "current-week": _week};

  return jsonobj;
}

function splitter(text, index) {
  try {
    var _res = text.split(", ")[index].split(": ")[1];
    return _res;
  } catch (e) {
    console.log("error splitting... "+e);
    return "N/A";
  }
}
