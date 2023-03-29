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

**Bitcoin** isn't traceable, therefore the taxes are cheaper than buying with nationalized coins like USD or BRL. 
BTC is the future and **Bitnose** will help us to reach the top of the summit

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

The function will have access to two variables: The ```search_query``` and ```search_page```. 
The function will also have access to [Puppeteer](https://pptr.dev/), which will be used to get the data directly from origin. 
The functions need to be written using Javascript, and the reason is that **Bitnose** uses [JSONfn](https://www.npmjs.com/package/jsonfn) package to
serialize the functions. Because functions will be parsed and called using ```eval()``` the code need to be Javascript. Down below a example:

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

</details>

The addition of a new store to the **Bitnose** need to be requested and will be accepted or denied by the moderators.
