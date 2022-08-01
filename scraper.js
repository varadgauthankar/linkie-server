const cheerio = require("cheerio");
const axios = require("axios").default;

async function scraper(url) {
  // request data
  const data = await axios.get(url);

  // if successful, parse data
  if (data.status == 200) {
    $ = cheerio.load(data.data);

    const title = _getTitle($);
    const description = _getDescription($);
    const image = _getImage($);
    const domain = new URL(url).hostname.replace("www.", ""); // get domain from url

    return { title, description, image, url, domain };
  } else {
    throw Error("Error: Could not fetch data");
  }
}

function _getTitle(data) {
  // priority for meta data
  const metaTitle = data("meta[property='og:title']").attr("content");

  // if meta data not found, return title
  if (metaTitle == undefined) {
    const title = data("title").text();
    return title;
  }

  // else return meta data
  return metaTitle;
}

function _getDescription(data) {
  // get description from meta data
  const metaDataDesc = $("meta[property='og:description']").attr("content");

  // if meta data not found, return empty string
  if (metaDataDesc == undefined) {
    return "";
  }

  // else return meta data
  return metaDataDesc;
}

function _getImage(data) {
  // get image from meta data
  const metaDataImage = data("meta[property='og:image']").attr("content");

  // if meta data not found, get the first image from
  if (metaDataImage == undefined) {
    const firstImage = data("img").first().attr("src");
    return firstImage;
  }

  // else return meta data
  return metaDataImage;
}

module.exports = scraper;
