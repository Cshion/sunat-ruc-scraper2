#Sunat ruc scraper2
## Installation
```
npm install sunat-ruc-scraper2
```
## Usage
```
var scraper = require("sunat-ruc-scraper2");

scraper.getInformation("20131312955" , function ( err , data ) {
	if ( err ) {
		console.error(err);
	}else{
		//glhf
	}
});
```

## Features

* scraper.getInformation(ruc,cb) => basic information
* scraper.getExtendedInformation(ruc,cb) => extended information
* Get history (TODO)

## Requirements

* Nodejs >= 0.12

## Test

```
npm test
```



