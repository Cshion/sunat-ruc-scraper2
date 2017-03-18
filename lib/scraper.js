"use strict";
var request = require("request");
var cheerio = require("cheerio");
var async   = require("async");
var jszip   = require("jszip");


var opts = {
	jar      : true ,
	timeout  : 10000 ,
	encoding : null ,
	headers  : {
		'User-Agent' : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.94 Safari/537.36'
	}
};

request = request.defaults(opts);

function Scraper() {
}


function getBasicInformation(html , callback) {
	try {
		var $             = cheerio.load(html);
		var table         = $("table").first().children("tr");
		var contribuyente = {};
		
		var rzhtml = table.first().children().eq(1).html();
		
		if ( !rzhtml ) {
			return callback(null , contribuyente);
		}
		
		var initData = rzhtml.split("-").map(function (wat) {
			return wat.trim();
		});
		
		contribuyente.ruc                = initData[ 0 ];
		contribuyente.razon_social       = initData[ 1 ];
		contribuyente.tipo_contribuyente = table.eq(1).children().eq(1).text().trim();
		contribuyente.nombre_comercial   = table.eq(2).children().eq(1).text().trim();
		contribuyente.fecha_inscripcion  = table.eq(3).children().eq(1).text().trim();
		//TODO : fecha inicio actividades
		contribuyente.condicion            = table.eq(4).children().eq(1).text().trim();
		contribuyente.estado               = table.eq(5).children().eq(1).text().trim();
		contribuyente.direccion_referencia = table.eq(6).children().eq(1).text().split("-").map(function (splited) {
			return splited.trim();
		}).join("-");
		
		return callback(null , contribuyente , html);
	} catch ( e ) {
		return callback(e);
	}
	
}

function getExtendedInformation(html , callback) {
	try {
		var $     = cheerio.load(html);
		var table = $("table").first().children("tr");
		var data  = {};
		
		data.sistema_emision             = table.eq(7).children().eq(1).text().trim();
		data.comercio_exterior           = table.eq(7).children().eq(3).text().trim();
		data.sistema_contabilidad        = table.eq(8).children().eq(1).text().trim();
		data.actividades_economicas      = table.eq(9).children().eq(1).children().eq(0).children().map(function () {
			return $(this).text().trim();
		}).get();
		data.comprobantes_autorizados    = table.eq(10).children().eq(1).children().eq(0).children().map(function () {
			return $(this).text().trim();
		}).get();
		data.sistema_emision_electronica = table.eq(11).children().eq(1).text().trim();
		data.fecha_emisor_electronico    = table.eq(12).children().eq(1).text().trim();
		data.comprobantes_electronicos   = table.eq(13).children().eq(1).text().trim();
		data.afiliacion_ple              = table.eq(14).children().eq(1).text().trim();
		data.padrones                    = table.eq(15).children().eq(1).children().eq(0).text().trim();
		return callback(null , data , html);
	} catch ( e ) {
		return callback(e);
	}
}

function getCaptcha(base , cb) {
	var URL         = "/captcha";
	var CAPTCHA_URL = base + URL;
	request.post(CAPTCHA_URL , { form : { "accion" : "random" } } , function (err , response , body) {
		if ( err ) {
			return cb(err);
		} else {
			return cb(null , body.toString());
		}
	});
}


function getHtmlPage(ruc , cb) {
	var BASE    = "http://e-consultaruc.sunat.gob.pe/cl-ti-itmrconsruc";
	var RUC_URL = BASE + "/jcrS00Alias";
	getCaptcha(BASE , function (err , captcha) {
		request.post(RUC_URL , {
			form : {
				"nroRuc" : ruc ,
				"accion" : "consPorRuc" ,
				"numRnd" : captcha
			}
		} , function (err , response , body) {
			if ( err ) {
				return cb(err);
			} else {
				return cb(null , body.toString());
			}
		});
	});

}

function parseZip(link , callback) {
	request.get(link , function (err , res , body) {
		if ( err ) {
			return callback(err);
		}

		var zip = new jszip();
		zip.loadAsync(body)
			.then(function (data) {
				data = data.file(/^.*\.txt$/)[ 0 ];
				data.async("string").then(function success(content) {
					return callback(null , content);
				} , function error(e) {
					return callback(e);
				});
			} , function (err) {
				return callback(err);
			})
	});
}


function parseHtmlZip(html , callback) {
	try {
		var $    = cheerio.load(html);
		var link = $("td.bg>a").first().attr("href");
		return callback(null , link);
	} catch ( e ) {
		return callback(e);
	}
}

function parseCsv(csv , callback) {
	csv         = csv.replace(/\r/g , "");
	var data    = csv.split("\n").map(function (line) {
		return line.split("|");
	});
	var columns = [
		"ruc" ,
		"razon_social" ,
		"tipo_contribuyente" ,
		"profesion" ,
		"nombre_comercial" ,
		"condicion" ,
		"estado" ,
		"fecha_inscripcion" ,
		"inicio_actividades" ,
		"departamento" ,
		"provincia" ,
		"distrito" ,
		"direccion_referencia" ,
		"telefono" ,
		"fax" ,
		"comercio_exterior" ,
		"principal_CIIU" ,
		"secundario1_CIIU" ,
		"secundario2_CIIU" ,
		"nuevo_rus" ,
		"buen_contribuyente" ,
		"agente_retencion" ,
		"agente_percepcion_vtaint" ,
		"agente_percepcion_comliq" ,
		""
	];
	var result  = [];
	data        = data.splice(1);
	data.forEach(function (line) {
		if ( line ) {
			var r = {};
			if ( line.length > 0 ) {
				line.forEach(function (l , index) {
					if ( l && l.length > 0 ) {
						r[ columns[ index ] ] = l.trim();
					}
				});
				if ( Object.keys(r).length > 0 ) {
					result.push(r);
				}
			}
		}
	});
	return callback(null , result);
}

function getZipPage(rucs , cb) {
	var BASE    = "http://e-consultaruc.sunat.gob.pe/cl-ti-itmrconsmulruc";
	var RUC_URL = BASE + "/jrmS00Alias";


	async.waterfall([
		async.constant(BASE) ,
		getCaptcha ,
		function (captcha , next) {
			var req_url = RUC_URL + "?accion=consManual&textRuc=&numRnd=" + captcha + "&" + rucs.map(function (r) {
					return "selRuc=" + r;
				}).join("&");

			request.post(req_url , function (err , response , body) {
				if ( err ) {
					return next(err);
				} else {
					return next(null , body);
				}
			});
		} ,
		parseHtmlZip ,
		parseZip
	] , function (err , result) {
		if ( err ) {
			return cb(err)
		} else {
			return cb(null , result);
		}
	});

}

Scraper.prototype.getInformation = function (ruc , cb) {
	if ( Array.isArray(ruc) ) {

		if ( ruc.length < 1 ) {
			return cb(null , []);
		}

		getZipPage(ruc , function (err , data) {
			if ( err ) {
				return cb(err);
			} else {
				parseCsv(data , function (err , res) {
					if ( err ) {
						return cb(err);
					} else {
						return cb(null , res);
					}
				});
			}
		});
	} else {
		getHtmlPage(ruc , function (err , body) {
			if ( err ) {
				return cb(err);
			}

			getBasicInformation(body , function (err , data) {
				if ( err ) {
					return cb(err);
				} else {
					return cb(null , data , body);
				}
			});
		});
	}
};

Scraper.prototype.getAllInformation = function (ruc , cb) {

	this.getInformation(ruc , function (err , basicInformation , body) {
		if ( err ) {
			return cb(err);
		} else {
			if ( Array.isArray(ruc) ) {
				return cb(null , basicInformation);
			} else {
				if ( !Object.keys(basicInformation).length ) {
					return cb(null , basicInformation);
				}

				getExtendedInformation(body , function (err , extendedInformation) {
					if ( err ) {
						return cb(err);
					} else {
						return cb(null , Object.assign(basicInformation , extendedInformation) , body);
					}
				});
			}
		}
	});

};


//TODO : MORE INFORMATION
/*
 Scraper.prototype.getHistory = function(ruc,cb){..}
 */

module.exports = new Scraper();