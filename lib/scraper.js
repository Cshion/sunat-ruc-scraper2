"use strict";
var request     = require("request");
var cheerio     = require("cheerio");
var RUC_URL     = 'http://www.sunat.gob.pe/cl-ti-itmrconsruc/jcrS00Alias';
var CAPTCHA_URL = "http://www.sunat.gob.pe/cl-ti-itmrconsruc/captcha";

var opts = {
	jar : true ,
	headers : {
		'User-Agent' : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.94 Safari/537.36'
	}
};

request = request.defaults(opts);

function Scraper() {
}

function parseDom( html , callback ) {
	try {
		var $             = cheerio.load(html);
		var table         = $("table").first().children("tr")
		var contribuyente = {};

		var rzhtml = table.first().children().eq(1).html();

		if ( !rzhtml ) {
			return callback(null , contribuyente);
		}

		var initData = rzhtml.split("-").map(function ( wat ) {
			return wat.trim();
		});
		
		contribuyente.ruc                  = initData[ 0 ];
		contribuyente.razon_social         = initData[ 1 ];
		contribuyente.tipo_contribuyente   = table.eq(1).children().eq(1).text().trim();
		contribuyente.nombre_comercial     = table.eq(2).children().eq(1).text().trim();
		contribuyente.fecha_inscripcion    = table.eq(3).children().eq(1).text().trim();
		contribuyente.condicion            = table.eq(4).children().eq(1).text().trim();
		contribuyente.estado               = table.eq(5).children().eq(1).text().trim();
		contribuyente.direccion_referencia = table.eq(6).children().eq(1).text().split("-").map(function ( splited ) {
			return splited.trim();
		}).join("-");

		return callback(null , contribuyente);
	} catch ( e ) {
		return callback(e);
	}
	
}


Scraper.prototype.getInformation = function ( ruc , cb ) {
	request.post(CAPTCHA_URL , { form : { "accion" : "random" } } , function ( err , response , body ) {
		if ( err ) {
			return cb(err);
		} else {
			var captcha = body.toString();
			request.post(RUC_URL , {
				form : {
					"nroRuc" : ruc ,
					"accion" : "consPorRuc" ,
					"numRnd" : captcha
				}
			} , function ( err , response , body ) {
				if ( err ) {
					return cb(err);
				} else {
					parseDom(body , function ( err , data ) {
						if ( err ) {
							return cb(err);
						} else {
							return cb(null , data);
						}
					})
					
				}
			});
		}
	});
};

//TODO : MORE INFORMATION
/*
 Scraper.prototype.getHistory = function(ruc,cb){..}
 */

module.exports = new Scrapper();