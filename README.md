# Bitnose
**Bitnose** is a project created to help the propagation and consolidation of the **Bitcoin** as a viable and advantageous payment method.

<details>

<summary>Advantages</summary>

## Efficient

Efficiency is one of the capitalism pillars and **Bitnose** will increase **Bitcoin** efficiency allowing people to know where they can buy a product. 
No more forums, no more slow and boring google searchs. 
With **Bitnose** you just need to type the name of the product that you want and the search engine will do the hard work for you.

## Good for the small entrepreneurs

**Bitnose** will increase the visibility and expose small entrepreneurs that do a good job and accept **Bitcoins**.

## Privacy 

**Bitnose** is a open source, this means that **Bitnose** follows the commandment: "Don't trust. Verify". **Bitnose** won't get your private data.

## Cheap

**Bitcoin** isn't traceable, therefore the taxes are cheaper than buying with fiat money like USD or BRL. 

</details>

<details>

<summary>Community (How it works)</summary>

## How it works

The **Bitnose** accepts any store, but the store need to be on the **Bitnose** database. Also, is necessary to create a function that'll be called
every time that **Bitnose** is doing a search. This function need to return a data following this format:

```Json
{
  "title": "Computer",
  "price": "640.90",
  "imageSrc": "https://somestore.com/computer/AB4554SD/image.png",
  "url": "https://somestore.com",
  "currency": "$"
}
```

The function will have the following parameters: ```search_query```, ```search_page```, ```puppeteer```, ```SearchResult``` and ```countries```. 
The parameters ```search_query```, ```search_page``` and ```countries``` represents the search made by the user, the actual page and the countries
selected before the search, respectively. The parameters ```puppeteer``` and ```SearchResult``` are constant. The first is the 
[Puppeteer](https://pptr.dev/), which is used to get the data directly from the origin url, thus avoiding the CORS restriction since the requests will
all be done from the same origin. And finally, the ```SearchResult``` is a ES6 class, the function needs to return an array of ```SeachResult``` objects.
The functions need to be written using Javascript, and the reason is that **Bitnose** uses [JSONfn](https://www.npmjs.com/package/jsonfn) package to
serialize the functions. Because functions will be parsed and called using ```eval()```, the code need to be Javascript. Down below a example:

```Javascript

const browser = await puppeteer.launch();
const page = await browser.newPage();
await page.setViewport({ width: 1920, height: 1080, isMobile: false });
let searchWord = search_query; // Passed as parameter
let actualPage = search_page;  // Passed as parameter
await page.goto(`https://somesite.io/api/v2/items/us?keywords=${searchWord}&page=${actualPage}`);
const data = await page.evaluate(() => {
  const json = document.body.innerText;
  const items = JSON.parse(json).items;
  return items.map(item => {
    return {
      title: item.name,
      price: item["fiat_price"],
      imageSrc: item.images.medium,
      url: `https://purse.io/product/US/${item.asin}`
     };
   });
});

await browser.close();

return data;

```

The addition of a new store to the **Bitnose** need to be requested and will be accepted or denied by the moderators.
  
### Routes


#### ```/store/:identifier```:
  Returns the store with this identifier

#### ```/store/new```
  Add a new store. The request body should follow the template of the example bellow:
  ```json
  {
    "name": "Qualidoc",
    "url": "https://www.qualidoc.com.br/",
    "description": "Farmacia digital",
    "countries": ["Brazil"],
    "categories": ["Pharmacy"]
  }
  ```
#### ```/store/update/search/function```
  Updates the store search function. Only this method can be used to add search function, if you try to add with the previous route it won't work. The request body should be as follows:
  ```json
  {
    "identifier": "642aa25e5ff2695ace9df98f",
    "searchFunction": "_NuFrRa_async () => {const browser = await puppeteer.launch();\n        const page = await browser.newPage();\n        await page.setViewport({ width: 1920, height: 1080, isMobile: false });\n        let searchWord = search_query;\n        let actualPage = search_page;\n        await page.goto(`https://www.lojabit.com/buscar?q=${searchWord}&pagina=${actualPage}`, { waitUntil: 'networkidle0' });\n        const finalResults = await page.evaluate(() => {\n            const items = [...document.querySelectorAll(\".listagem-item\")]\n                .filter(item => !item.classList.contains(\"indisponivel\"));\n            return items.map(item => {\n                return {\n                    title: item.querySelector(\".nome-produto\").textContent,\n                    price: parseFloat(item\n                        .querySelector(\".preco-promocional\")\n                        .textContent\n                        .replaceAll(/[.,]/g, (str) => str == '.' ? ',' : '.')\n                        .replace(\"R$\", \"\")),\n                    imageSrc: item.querySelector(\".imagem-principal\").src,\n                    url: item.querySelector(\"a\").href,\n                    currency: \"R$\"\n                }\n            });\n        });\n        for (let item of finalResults) {\n            item = new SearchResult(item);\n        }\n\n        await browser.close();\n        return finalResults;}"
  }
  ```
  As stated earlier, the ```searchFunction``` should be result of the function [```JSONfn.stringify()```](http://www.eslinstructor.net/jsonfn/). Other important thing is that the function don't need to includes the arguments because all of them will be added in the server side. The server will add the 
```'use strict'``` statement too.
  
#### ```/search/content?search_query=some%20query&page=1```
  Return a JSON with the specified search_query and page. The page by default is 1. The JSON will follow the template bellow:
  ```json
  {
    "results": [
        [
            {
                "title": "Keeps Minoxidil for Men Topical Hair Loss Aerosol Minoxidil Foam 5%, Hair Growth Treatment - Slows Hair Loss & Promotes Hair Regrowth - 3 Month Supply (3 x 2.11oz Bottles) - For Thicker, Longer Hair",
                "price": 49.99,
                "imageSrc": "https://m.media-amazon.com/images/I/71eMIpUj-OL._AC_UL400_.jpg",
                "url": "https://purse.io/product/US/B099J7MY37",
                "currency": "$"
            },
            {
                "title": "Head & Shoulders Scalp X 5% Minoxidil Hair Regrowth Treatment for Women, Topical Foam, 6 Month Supply, White, 2.11 Fl Oz, Pack of 3",
                "price": 42.52,
                "imageSrc": "https://m.media-amazon.com/images/I/81NZaJJR4FL._AC_UL400_.jpg",
                "url": "https://purse.io/product/US/B09BG8ZFKK",
                "currency": "$"
            },
            {
                "title": "5% Minoxidil for Men and Women Lotion - 1 Month - Hair Growth Serum with Biotin, Caffeine and Niacinamide - Hair Regrowth Treatment For Stronger, Thicker Longer Hair - Stops Hair Thinning",
                "price": 18.95,
                "imageSrc": "https://m.media-amazon.com/images/I/71e+i0763GL._AC_UL400_.jpg",
                "url": "https://purse.io/product/US/B09Q5PHFQM",
                "currency": "$"
            },
            {
                "title": "Regoxidine Men's 5% Minoxidil Foam (3-Month Supply) - Helps Restore Vertex Hair Loss & Thinning Hair - Extra Strength Foam Supports Hair Regrowth in Unscented Topical Aerosol Treatment",
                "price": 39.95,
                "imageSrc": "https://m.media-amazon.com/images/I/71Brk3+0fvL._AC_UL400_.jpg",
                "url": "https://purse.io/product/US/B085B7FDV5",
                "currency": "$"
            },
            {
                "title": "6 Months Kirkland Minoxidil 5% Extra Strength Hair Loss Regrowth Treatment Men, 12 Fl Oz (Pack of 6)",
                "price": 28.45,
                "imageSrc": "https://m.media-amazon.com/images/I/714WwGNZXYL._AC_UL400_.jpg",
                "url": "https://purse.io/product/US/B008BMOEGA",
                "currency": "$"
            }
        ]
    ]
  }
  ```
  #### Two important things:
  
  The limit of results per page is 20 <br />
  <br />
  It will return a two-dimensional array (matrix). This will probably change in the next version but for now this is the behaviour. 
  Is important to know that it can return multiple arrays, but the total of elements is always 20. 
  
  ### Environment Variables
  
  **Bitnose** uses 3 environment variables: 
  > PORT=6013 <br />
  > SITE_TIMEOUT_MILLISECONDS=50000 <br />
  > SESSION_TIMEOUT_MILLISECONDS=420000 <br />
  > MONGO_SERVER=mongodb://localhost:27017/bitnose <br />
  
  The ```PORT``` configures the server running port. 
  The ```SITE_TIMEOUT_MILLISECONDS``` configures the timeout for each site request. 
  The ```SESSION_TIMEOUT_MILLISECONDS``` configures the timeout for each search session.
  The ```MONGO_SERVER``` configures the database url.
  
  ### Search Sessions
  
  The search system is based on search sessions. When a user do a search, the system will generate a new session. This session will store all the
  results of each page in the database. This is usefull because the user experience is more fluid. When a page is loaded it will be displayed 
  until the session expires. 
  
  ### Try **Bitnose**
  
  To run **Bitnose** is very simple. You just need to have Node and NPM installed. A simple ```npm install``` will install all the dependencies. 
  The file "stores_mongodb_sample.json" contains a sample with some stores already added. Just import it on your MongoDB database and try out. 
  </details>
  
  
  

