var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var rest = require('restler');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if (!fs.existsSync(instr)) {
        console.log("%s does not exist. Exiting.", instr);
        process.exit(1);
    }
    return instr;
};

var cheerioHtmlString = function(htmlstring) {
    return cheerio.load(htmlstring);
}

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlString = function(htmlstring, checksfile) {
    $ = cheerioHtmlString(htmlstring);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for (var ii in checks) {
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    return out;
};

var checkAndOutput = function(htmlstring, checkfile) {
    var checkJson = checkHtmlString(htmlstring, checkfile);
    var outJson = JSON.stringify(checkJson, null, 4);
    console.log(outJson); 
};

var clone = function(fn) {
    return fn.bind({});
};

if (require.main == module) {
    program
        .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
        .option('-f, --file <html_fle>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
        .option('-u, --url <url>', 'Url to check')
        .parse(process.argv);

    if (program.file != null) {
        checkAndOutput(fs.readFileSync(program.file), program.checks);
    }
    else if (program.url != null) {
        rest.get(program.url).on('complete', function(result, response) {
            checkAndOutput(result, program.checks);
        });
    }
} else {
    exports.checkHtmlFile = checkHtmlFile;
}
