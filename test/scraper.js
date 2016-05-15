var expect  = require("chai").expect;
var scraper = require("../lib");

describe("Sunat Ruc Scraper" , function () {
	it("Get personal information from valid ruc" , function (cb) {
		scraper.getInformation("20131312955" , function (error , data) {
			if(error){
				throw error;
			}
			expect(data).to.be.not.empty;
			expect(data).to.be.object;
			expect(data.ruc).to.be.not.empty;
			expect(data.razon_social).to.be.not.empty;
			return cb();
		});
	});

	it("Get empty information from not valid ruc" , function (cb) {
		scraper.getInformation("201313129551" , function (error , data) {
			if(error){
				throw error;
			}
			expect(data).to.be.empty;
			return cb();
		});
	});

	it("Get extended information from valid ruc" , function (cb) {
		scraper.getAllInformation("20131312955" , function (error , data , body) {
			if(error){
				throw error;
			}
			expect(data).to.be.not.empty;
			expect(data).to.be.object;
			expect(data.sistema_emision).to.be.not.empty;
			expect(data.comercio_exterior).to.be.not.empty;
			return cb();
		})
	});

	it("Get empty extended information from not valid ruc" , function (cb) {
		scraper.getAllInformation("201313129551" , function (error , data , body) {
			if(error){
				throw error;
			}
			expect(data).to.be.empty;
			return cb();
		})
	});

});