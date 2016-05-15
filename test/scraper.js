var expect  = require("chai").expect;
var scraper = require("../lib");

describe("Sunat Ruc Scraper" , function () {
	it("Get personal information from valid ruc" , function (cb) {
		scraper.getInformation("20131312955" , function (error , data) {
			expect(data).to.be.not.empty;
			expect(data).to.be.object;
			expect(data.ruc).to.be.not.empty;
			expect(data.razon_social).to.be.not.empty;
			return cb();
		});
	});

	it("Get empty information from not valid ruc" , function (cb) {
		scraper.getInformation("201313129551" , function (error , data) {
			expect(data).to.be.empty;
			return cb();
		});
	});
});