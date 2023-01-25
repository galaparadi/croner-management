const axios = require('axios').default;
const cheerio = require('cheerio');
const http = require('http');
const https = require('https');

const extractInformation = ($anime) => {
    const information = $anime('.leftside > h2').get(1);
    return $anime(information)
        .nextUntil('br')
        .map(function (i, el) { return $anime(this).text() })
        .toArray()
        .map(item => [item.split(/\r?\n/)[1].trim().replace(":", "").toLowerCase(), item.split(/\r?\n/)[2].trim()])
        .reduce((acc, curr) => { acc[curr[0]] = curr[1]; return acc; }, {})
}

const searchAnime = async (query) => {
    const searchRes = await axios.get(`https://myanimelist.net/search/all?q=${query}`);
    const $search = cheerio.load(searchRes.data);
    const animeObjects = $search('article .information > .title > a:nth-child(1)').toArray().map(function (elem) {
        return {
            id: $search(elem).attr('href').split('/')[4],
            title: $search(elem).text(),
            href: $search(elem).attr('href'),
            picture: $search(elem).parent().parent().parent().children('.thumb').children('a').children('img').attr('data-src').split('/100x140')[1],
        }
    });

    return animeObjects
}

const airingAnime = async (year) => {
    const param = new URLSearchParams();
    param.set('cat', '0');
    param.set('type', '1');
    param.set('score', '0');
    param.set('status', '1');
    param.set('p', '0');
    param.set('r', '0');
    param.set('sm', '1');
    param.set('sd', '1');
    param.set('sy', '2023');
    param.set('em', '12');
    param.set('ed', '31');
    param.set('ey', '2023');
    param.set('c', ['a', 'b', 'c', 'f']);
    param.set('o', ['3', '3', '2', '1']);
    const animeRes = await axios.get(`https://myanimelist.net/anime.php`,
        {
            // proxy: {
            //     protocol: 'http',
            //     host: '192.168.1.13',
            //     port: '80'
            // },
            // httpAgent: new http.Agent({ keepAlive: true }),
            // httpsAgent: new https.Agent({ keepAlive: true }),
            // headers: {
            //     'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
            //     'sec-ch-ua': '"Not?A_Brand";v="8", "Chromium";v="108", "Google Chrome";v="108"',
            //     'sec-ch-ua-mobile': "?0",
            //     'sec-ch-ua-platform': "Windows",
            //     'Sec-Fetch-Dest': "document",
            //     'Sec-Fetch-Mode': "navigate",
            //     'Sec-Fetch-Site': "none",
            //     'Sec-Fetch-User': "?1",
            //     'Upgrade-Insecure-Requests': "1",
            // },
            params: param,
        }
    );
    const $anime = cheerio.load(animeRes.data);
    const result = $anime('#content > div.js-categories-seasonal.js-block-list.list > table > tbody > tr')
        .map(function (i, el) { return $anime(this) }).toArray().map($tr => {
            return {
                title: $anime("td:nth-child(2) strong", $tr).text(),
                link: $anime("td:nth-child(2) a", $tr).attr("href"),
                id: $anime("td:nth-child(2) a", $tr).attr("href")?.split('/')[4],
                thumbUrl: $anime("td:nth-child(1) img", $tr).attr("data-src")
            };
        });
    result.shift();
    return result;
    // data structure
    // {
    //     title: 'Madtoy Chatty',
    //     link: 'https://myanimelist.net/anime/52463/Madtoy_Chatty',
    //     id: '52463',
    //     thumbUrl: 'https://cdn.myanimelist.net/r/50x70/images/anime/1292/125603.jpg?s=61095a518ca6625698deafd7092fea4c'
    //   }

}

const anime = async (id) => {
    const animeRes = await axios.get(`https://myanimelist.net/anime/${id}`);
    const $anime = cheerio.load(animeRes.data);
    const $leftMenu = $anime('#content > table > tbody > tr > td:nth-child(1)');
    const $rightMenu = $anime('#content > table > tbody > tr > td:nth-child(2)');
    const posterHref = $leftMenu.find('img').attr('data-src');
    const info = extractInformation($anime);

    const episodes = info.episodes;
    const premiered = info.premiered;
    const title = $anime('.title-name').text();
    const description = $rightMenu.find('p[itemprop="description"]').text();
    const airing = info.status;

    return { posterHref, title, description, airing, episodes, premiered }
    //TODO: change airing to boolean
}

module.exports = { searchAnime, anime, airingAnime }
