# nba-logos

Small util to generate a composite image of all historical NBA team logos.

Depends on data [NBA Graph](https://github.com/TGOlson/nba-graph), which is my larger project to scrape all historical NBA data from www.basketball-reference.com

### development

Install

```
npm install
```

Build

```
npm run build

// or

npm run watch
```

Run commands

```
node ./dist/index.js {--convert-raw-data,--build-combined-image,-build-team-images}
```
