var request = require('request');
var cheerio = require('cheerio');
var URL = require('url-parse');

var START_URL = "http://www.novatv.mk";
var SEARCH_WORD = "stemming";
var MAX_PAGES_TO_VISIT = 1000;

var pagesVisited = {};
var numPagesVisited = 0;
var pagesToVisit = ['http://novatv.mk/index.php?navig=8&cat=24&vest=28124'];
var url = new URL(START_URL);
var baseUrl = url.protocol + "//" + url.hostname;

pagesToVisit.push(START_URL);
crawl();

function crawl() {
  if(numPagesVisited >= MAX_PAGES_TO_VISIT) {
    console.log("Reached max limit of number of pages to visit.");
    return;
  }
  var nextPage = pagesToVisit.pop();
  if (nextPage in pagesVisited) {
    // We've already visited this page, so repeat the crawl
    crawl();
  } else {
    // New page we haven't visited
    visitPage(nextPage, crawl);
  }
}

function visitPage(url, callback) {
  // Add page to our set
  pagesVisited[url] = true;
  numPagesVisited++;

  // Make the request
  //console.log("Visiting page " + url);
  request(url, function(error, response, body) {
     // Check status code (200 is HTTP OK)

    if(response === undefined || response.statusCode !== 200) {
      //console.log("Status code: " + response.statusCode);
      callback();
      return;
    }
     // Parse the document body
    var $ = cheerio.load(body);

    if ( $('.youtube-player').attr('src')) {
      console.log("Youtube link:  " + $('.youtube-player').attr('src').replace("embed/", "watch?v="));
    }


    collectInternalLinks($);
    callback();
  });
}

function searchForWord($, word) {
  var bodyText = $('html > body').text().toLowerCase();
  return(bodyText.indexOf(word.toLowerCase()) !== -1);
}

function collectInternalLinks($) {
    var relativeLinks = $("a");
    //console.log("Found " + relativeLinks.length + " relative links on page");
    relativeLinks.each(function() {
      pagesToVisit.push(baseUrl +'/' + $(this).attr('href'));
    });
}
