const printer = require('printer');
const pdf_printer = require('pdf-to-printer');
const fs = require('fs');
const mustache = require('mustache');
const puppeteer = require('puppeteer');
const moment = require('moment');
const path = require('path');
const iconv = require('iconv-lite');

const errorHandler = require('./utils/errorHandler');


module.exports.order = async (req, res) => {

    try {

        let code = 201
        let response = true

        const order = [
            { name: 'Ранчо', cost: 10, quantity: 2, total_cost: 20 },
            { name: 'Пиво', cost: 20, quantity: 1, total_cost: 20 },
            { name: 'Соус', cost: 5, quantity: 3, total_cost: 15 }
        ];

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
            width: Math.round(80 * 2.83465), // 226.77 пунктов
            height: Math.round(297 * 2.83465), // 841.89 пунктов
        });

        const pdfOptions = {
            width: '80mm',
            height: '297mm',
            printBackground: true,
        };

        // Получите PDF-документ в виде буфера
        const pdfBuffer = await page.pdf(pdfOptions);

        const PDFPath = path.join('public', 'pdf', `${filename}.pdf`);
        fs.writeFileSync(PDFPath, pdfBuffer);


        // Печать PDF
        pdf_printer.print(PDFPath, {
            printer: '80mm Series Printer',
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
            printer: '80mm Series Printer',
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