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
    const favicon = _getFavicon($, url);
    const link = _getLink(url);

    return { title, description, image, url: link, domain, favicon };
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
  // first try to get image from meta data
  const metaDataImage = data("meta[property='og:image']").attr("content");

  //! meta data image
  if (metaDataImage) {
    console.log("meta data image");
    return _validatedImageUrl(metaDataImage, url);
  }

  //! first image
  // if failed, try to get first image from the page
  else {
    const firstImage = data("img").first().attr("src");

    if (firstImage && firstImage.startsWith("http")) {
      // if first image is not found OR first image is not a valid url. return favicon
      // in most cases if first image is not a valid url, then it's not appropriate image we need
      console.log("first image");
      return firstImage;
    }

    //! favicon
    // if failed, try to get favicon icon
    else {
      const favicon = _getFavicon(data, url);

      if (favicon) {
        return _validatedImageUrl(favicon, url);
      }
    }
  }

  // return empty if everything failed
  return null;
}

function _getFavicon(data, url) {
  favicon =
    data("link[rel='shortcut icon']").first().attr("href") ||
    data("link[rel='icon']").first().attr("href");

  if (favicon) {
    return _validatedImageUrl(favicon, url);
  } else {
    return `https://www.google.com/s2/favicons?domain=${url}`;
  }
}

// check if image is relative url
function _validatedImageUrl(imageUrl, domain) {
  if (imageUrl.startsWith("http")) {
    return imageUrl;
  } else {
    return domain + imageUrl;
  }
}

function _getLink(url) {
  if (url.startsWith("http")) {
    return url;
  } else {
    return "http://" + url;
  }
}

module.exports = scraper;
