const { spawn } = require("child_process");
const config = require("../config.json")

exports.WkHtmlToPdfCLI = class {
    static convertHtmlToPdf(inputFile, outputFile, livre) {
        return new Promise((resolve, reject) => {
            const options = [
                "--encoding", "utf8",
                "--dpi", "300",
                "--disable-smart-shrinking"
            ];
            if (livre) {
                if (livre.format)
                    options.push("--page-size", livre.format);
                options.push("--margin-top", livre.options["margin-top"]);
                options.push("--margin-bottom", livre.options["margin-bottom"]);
                options.push("--margin-left", livre.options["margin-left"]);
                options.push("--margin-right", livre.options["margin-right"]);
                if (livre.couverture)
                    options.push("page", livre.couverture.src);
                if (livre.options.toc == "debut")
                    options.push("toc");
                options.push("page", inputFile);
                if (livre.footer)
                    options.push("--footer-html", livre.footer.src);
                if (livre.options.toc == "fin")
                    options.push("toc");
                options.push(outputFile);
            }
            else {
                options.push("--margin-top", "1.5cm");
                options.push("--margin-bottom", "1cm");
                options.push("--margin-left", "1.5cm");
                options.push("--margin-right", "1.5cm");
                options.push("--page-size", "A5");
                options.push(inputFile, outputFile);
            }

            const command = spawn(config.wkhtmltopdf, options);

            command.stdout.on("data", (data) => {
                console.log(`WkHtmlToPdfCLI - log : ${data}`);
            });

            command.stderr.on("data", (data) => {
                console.error(`WkHtmlToPdfCLI - err : ${data}`);
            });

            command.on("close", (code) => {
                console.log(`WkHtmlToPdfCLI - Fin de la commande avec le code : ${code}`);
                resolve();
            });
        });
    }
};