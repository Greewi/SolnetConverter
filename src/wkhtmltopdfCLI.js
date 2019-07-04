const { spawn } = require("child_process");
const config = require("../config.json")

exports.WkHtmlToPdfCLI = class {
    static convertHtmlToPdf(inputFile, footerFile, outputFile, page) {
        return new Promise((resolve, reject) => {
            const options = [
                "--encoding", "utf8",
                "--dpi", "300",
                "--disable-smart-shrinking"
            ];
            if (page) {
                options.push("--page-size", page.format);
                options.push("--margin-top", page["margin-top"]);
                options.push("--margin-bottom", page["margin-bottom"]);
                options.push("--margin-left", page["margin-left"]);
                options.push("--margin-right", page["margin-right"]);
            }
            else {
                options.push("--margin-top", "1.5cm");
                options.push("--margin-bottom", "1cm");
                options.push("--margin-left", "1.5cm");
                options.push("--margin-right", "1.5cm");
                options.push("--page-size", "A5");
            }
            //options.push("toc");
            options.push("page", inputFile);
            if (footerFile)
                options.push("--footer-html", footerFile);
            options.push(outputFile);

            const command = spawn(config.wkhtmltopdf, options);

            command.stdout.on("data", (data) => {
                // console.log(`WkHtmlToPdfCLI - log : ${data}`);
            });

            command.stderr.on("data", (data) => {
                //console.error(`WkHtmlToPdfCLI - err : ${data}`);
            });

            command.on("close", (code) => {
                console.log(`WkHtmlToPdfCLI - Fin de la commande avec le code : ${code}`);
                resolve();
            });
        });
    }
};