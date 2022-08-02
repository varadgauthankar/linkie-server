const cheerio = require("cheerio");
const axios = require("axios").default;

async function scraper(url) {
  // request data
  const data = await axios.get(_validatedUrl(url));

  // if successful, parse data
  if (data.status === 200) {
    $ = cheerio.load(data.data);

    const title = _getTitle($);
    const description = _getDescription($);
    const image = _getImage($, url);
    const domain = new URL(_validatedUrl(url)).hostname.replace("www.", ""); // get domain from url

    return { title, description, image, url, domain };
  } else {
    throw new Error("Could not fetch data");
  }
}

// adds http to url if not present
function _validatedUrl(url) {
  var url;
  if (!url.startsWith("http")) {
    url = `http://${url}`;
  }

  return url;
}

function _getTitle(data) {
  // return title from meta data, if not found return title from html
  return (
    data("meta[property='og:title']").attr("content") ||
    data("title").text() ||
    ""
  );
}

function _getDescription(data) {
  // check meta property - description and name - description
  return (
    $("meta[property='og:description']").attr("content") ||
    $("meta[name='description']").attr("content") ||
    ""
  );
}

function _getImage(data, url) {
  // get image from meta data
  const metaDataImage = data("meta[property='og:image']").attr("content");

  // if meta data not found, get the first image tag
  if (metaDataImage == undefined) {
    const firstImage = data("img").first().attr("src");

    // if first image is not found OR first image is not a valid url. return favicon
    // in most cases if first image is not a valid url, then it's not appropriate image we need
    if (firstImage == undefined || !firstImage.startsWith("http")) {
      const favicon =
        data("link[rel='shortcut icon']").first().attr("href") ||
        data("link[rel='icon']").first().attr("href");

      // most favicon are relative url, so we need to add the domain to it
      if (!favicon.startsWith("http")) {
        return url + favicon;
      }

      return favicon;
    }

    return firstImage;
  }

  // else return meta data
  return metaDataImage;
}

module.exports = scraper;
