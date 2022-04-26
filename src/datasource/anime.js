const axios = require('axios').default;
const cheerio = require('cheerio');

const animeSearch = async (query) => {
    const searchRes = await axios.get(`https://livechart.me/search?q=${query}`);
    const $search = cheerio.load(searchRes.data);
    const linkAnime = $search('.anime-list > li:nth-child(1) a').attr('href');
    const animeRes = await axios.get(`https://livechart.me${linkAnime}`);
    const $anime = cheerio.load(animeRes.data);
    const posterHref = $anime('.anime-poster > noscript').text().split('src="').pop().split('" srcset').shift();
    const title = $anime('.row > .column:nth-child(2) > h4').text();
    const description = $anime('.row > .column:nth-child(2) .expandable-text-body').text();
    const airing = !!$anime('.countdown-bar').text();
    const currentEpisode = $anime('.countdown-bar .info-bar-label').text().split('EP').pop() || $anime('.anime-meta-bar .info-bar-cell:nth-child(3) .info-bar-cell-value').text();
    const streams = $anime('#streams-list > li a').map(
        (i, elem) => { return { href: elem.attribs.href, name: elem.parent.attribs.title } }
    ).toArray();
    return { posterHref, title, description, airing, currentEpisode, streams }
}

const anime = async (id) => {
    const animeRes = await axios.get(`https://livechart.me/anime/${id}`);
    const $anime = cheerio.load(animeRes.data);
    const posterHref = $anime('.anime-poster > noscript').text().split('src="').pop().split('" srcset').shift();
    const title = $anime('.row > .column:nth-child(2) > h4').text();
    const description = $anime('.row > .column:nth-child(2) .expandable-text-body').text();
    const airing = !!$anime('.countdown-bar').text();
    const currentEpisode = $anime('.countdown-bar .info-bar-label').text().split('EP').pop() || $anime('.anime-meta-bar .info-bar-cell:nth-child(3) .info-bar-cell-value').text();
    const streams = $anime('#streams-list > li a').map(
        (i, elem) => { return { href: elem.attribs.href, name: elem.parent.attribs.title } }
    ).toArray();
    return { posterHref, title, description, airing, currentEpisode, streams }
}

module.exports = { animeSearch, anime }
