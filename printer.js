const printer = require('printer');
const pdf_printer = require('pdf-to-printer');
const fs = require('fs');
const mustache = require('mustache');
const puppeteer = require('puppeteer');
const moment = require('moment');
const path = require('path');
const iconv = require('iconv-lite');

const errorHandler = require('./utils/errorHandler');

module.exports.get = async (req, res) => {
    try {

        const printers = printer.getPrinters();
        res.status(200).json(printers)

    } catch (e) {
        errorHandler(res, e)
    }
}

module.exports.findOne = async (req, res) => {
    try {
        
        const printers = printer.getPrinters();
        const candidate = printers.find( (printer) => printer.name === req.params.name )
        if (candidate) {
            res.status(200).json(true)
        } else {
            res.status(500).json(false)
        }
        
    } catch (e) {
        errorHandler(res, e)
    }
}


module.exports.order = async (req, res) => {

    try {

        let code = 201
        let response = true

        const order = req.body.order
        order.start = moment(order.start).format("HH:mm");
        order.shift = moment(`${order.shift}T00:00:00`).format("DD/MM/YY")

        const filename = moment().format().replace(/:/g, '-');

        const template = fs.readFileSync('./public/template.html', 'utf8');
        const html = mustache.render(template, { order });


        const HTMLPath = path.join('public', 'html', `${filename}.html`);
        fs.writeFileSync(HTMLPath, html);

        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        // await page.setContent(html);
        await page.goto(`http://localhost:3000/html/${filename}.html`, { waitUntil: 'networkidle0' });
        // Установите параметры страницы в миллиметрах: 80 x 297 мм
        await page.setViewport({
            width: Math.round(+req.body.printer.width * 2.83465), // 226.77 пунктов
            height: Math.round(+req.body.printer.height * 2.83465), // 841.89 пунктов
        });

        const pdfOptions = {
            width: `${req.body.printer.width}mm`,
            height: `${req.body.printer.height}mm`,
            printBackground: true,
        };

        // Получите PDF-документ в виде буфера
        const pdfBuffer = await page.pdf(pdfOptions);

        const PDFPath = path.join('public', 'pdf', `${filename}.pdf`);
        fs.writeFileSync(PDFPath, pdfBuffer);


        // Печать PDF
        pdf_printer.print(PDFPath, {
            printer: req.body.printer.name,
            success: function (jobID) {
                console.log("Успешно отправлено на печать. Job ID: " + jobID);
            },
            error: function (err) {
                console.log(err);
                code = 500
                response = false
            }
        });

        await browser.close();

        setTimeout(() => {
            RemoveFiles(HTMLPath, PDFPath)
        }, 1500);

        res.status(code).json(response)

    } catch (err) {
        errorHandler(res, err)
    }

}

module.exports.task = async (req, res) => {
    try {

        let code = 201
        let response = true

        const encodedData = iconv.encode(req.body.text, 'windows-1251');

        printer.printDirect({
            data: encodedData,
            printer: req.body.printer,
            type: 'TEXT',
            success: function (jobID) {
                console.log('Текст отправлен на печать. Job ID:', jobID);
            },
            error: function (err) {
                console.error('Ошибка при печати:', err);
                code = 500
                response = false
            },
        });

        res.status(code).json(response)

    } catch (err) {
        errorHandler(res, err)
    }
}


function RemoveFiles(HTMLPath, PDFPath) {
    try {
        fs.unlinkSync(HTMLPath);
        console.log('Файл успешно удален:', HTMLPath);
        fs.unlinkSync(PDFPath);
        console.log('Файл успешно удален:', PDFPath);
    } catch (err) {
        console.error('Ошибка при удалении файла:', err);
    }
}