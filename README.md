Country Explorer

A web app for travellers to look up, filter and sort every country in the world. It loads live data from the REST Countries API and shows each country as a card with its flag, capital, region and population.

Features :
Search by country name or capital
Filter by region and sort by name, population or area
Coloured region badges and a live "Showing X of 254" counter
Error handling: if the API is down, offline or the key is wrong, the page shows a message and a Try again button; empty searches and missing flags are handled too
Run it locally
Clone the repo:
bash
git clone https://github.com/Shawn-aku/Country-explorer.git
cd Country-explorer
Create config.js next to index.html with your key (provided in my submission comment, or get a free one at https://restcountries.com/sign-up):
javascript
const API_KEY = "your_key";
On the REST Countries API Keys page, add 127.0.0.1 and localhost to the key's CORS allowed origins.
Open index.html with Live Server in VS Code, or run python3 -m http.server 8000 and visit http://localhost:8000.

config.js is in .gitignore, so the key is never pushed to GitHub.

API

REST Countries v5: https://restcountries.com/docs/countries

Watch the 2-minute demo here: 

The key is sent in an Authorization: Bearer header. The API returns 100 countries per request, so the app loops through pages (offset 0, 100, 200) until meta.more is false, and asks only for the fields it needs with response_fields.

Deployment and load balancer
Server	Role	Address
web-01	nginx	35.178.181.126
web-02	nginx	18.135.99.237
lb-01	HAProxy	35.178.245.78

On each web server I installed git, cloned this repo, copied index.html, style.css and app.js to /var/www/html/, and created config.js by hand with echo 'const API_KEY = "your_key";' | sudo tee /var/www/html/config.js. The server hostnames and IPs are also added to the key's CORS allowed origins.

lb-01 runs HAProxy with a roundrobin backend containing both web servers. To check that requests alternate, I used the X-Served-By header that each server adds:

bash
curl -sI http://35.178.245.78 | grep -i x-served-by

It switched between 7248-web-01 and 7248-web-02. The app is available at http://35.178.245.78.

Challenges
The old API was shut down. My first version used REST Countries v3.1, which returned a deprecation error. I migrated to v5, which needs a key and has a different response shape.
CORS. The browser blocked requests until I added allowed origins to my key.
Protecting the key. I used config.js plus .gitignore and created the file by hand on each server. A frontend-only app cannot fully hide a key, so a small backend proxy would be the proper fix.
Paging. There are 254 countries but only 100 per request, so I wrote a loop to fetch every page.
Missing flags. Some territories have no flag image, so I added a fallback box instead of a broken image.
Credits
Country data: REST Countries
Server setup builds on my earlier ALU Web Infrastructure project (nginx, HAProxy, DNS and SSL)
I used Claude to review my work and help with my readme.
