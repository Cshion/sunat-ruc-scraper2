#Sunat ruc scraper2
## Descripcion
* Este proyecto no usa ningun OCR,por lo cual es mas eficiente al momento del scrapping
* Depende del estado de la pagina web de SUNAT,se devolvera un error asi que depende del caso de uso se tendra que pensar en alguna otra solucion de contingencia

## Instalacion
```
npm install sunat-ruc-scraper2
```
## Uso
```
var scraper = require("sunat-ruc-scraper2");

scraper.getInformation("20131312955" , function ( err , data ) {
	if ( err ) {
		console.error(err);
	}else{
		//glhf
	}
});


scraper.getInformation([ "20131312955" , "20601156530" ] , function ( err , data ) {
	if ( err ) {
		console.error(err);
	}else{
		//glhf
	}
});
```

## Funcionalidades

* scraper.getInformation(ruc,cb) => basic information
* scraper.getExtendedInformation(ruc,cb) => extended information
* Get history (TODO)

## Requisitos

* Nodejs >= 0.12

## Test

```
npm test
```



