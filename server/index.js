const express = require("express");
const fetch = require("node-fetch");
const PORT = process.env.PORT || 5000;
var app = express();
var bodyParser = require('body-parser');
var cors = require('cors');
const corsOptions = {
    origin: '*',
    credentials: true,
    optionSuccessStatus: 200,
}
app.use(cors(corsOptions))
app.use(bodyParser.json());
app.get("/", (req, res) => {
    res.redirect("https://puresci.github.io");
});
app.post("/api/token_getter", async (req, res) => {
    var fingerprint = (await fetch("https://discord.com/api/v8/experiments").then(r => r.json())).fingerprint;
    var getcookie = await fetch("https://discord.com/login").then(r => r.headers.get('set-cookie'));
    var dfc = getcookie.split(";")[0].split("=");
    var sdc = getcookie.split(";")[6].split(",")[1].split("=")[1];
    if (req.body.ticket) {
        var token = await fetch("https://discord.com/api/v9/auth/mfa/totp", {
            method: "POST",
            "headers": headers(dfc, sdc, fingerprint),
            "body": JSON.stringify({
                code: req.body.code,
                gift_code_sku_id: null,
                login_source: null,
                ticket: req.body.ticket
            })
        }).then(r => r.json());
        if (token.token) res.send({
            token: token.token
        }); else if (token.message) res.send({
            message: token.message
        }); else res.send({
            unknown: token
        });
    } else {
        var token = await fetch("https://discord.com/api/v9/auth/login", {
            method: "POST",
            "headers": headers(dfc, sdc, fingerprint),
            "body": JSON.stringify({
                captcha_key: req.body.response,
                gift_code_sku_id: null,
                login: req.body.mail,
                login_source: null,
                password: req.body.pass,
                undelete: false
            })
        }).then(r => r.json());
        if (token.errors) res.send({
            error: true,
            errors: token.errors
        });
        else if (token.token) res.send({
            token: token.token
        });
        else if (token.mfa) res.send({
            mfa: true,
            ticket: token.ticket
        }); else res.send({
            unknown: token
        });
    }
})


app.listen(PORT, () => {
    console.log("Listening to port " + PORT);
});

function headers(dfc, sdc, fingerprint) {
    return {
        "accept": "*/*",
        "accept-encoding": "gzip, deflate, br",
        "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
        "content-length": "2100",
        "content-type": "application/json",
        "cookie": `__dcfduid=${dfc}; __sdcfduid=${sdc}; _gcl_au=1.1.33345081.1647643031; _ga=GA1.2.291092015.1647643031; _gid=GA1.2.222777380.1647643031; OptanonConsent=isIABGlobal=false&datestamp=Fri+Mar+18+2022+18%3A53%3A43+GMT-0400+(%E5%8C%97%E7%BE%8E%E4%B8%9C%E9%83%A8%E5%A4%8F%E4%BB%A4%E6%97%B6%E9%97%B4)&version=6.17.0&hosts=&landingPath=https%3A%2F%2Fdiscord.com%2F&groups=C0001%3A1%2CC0002%3A1%2CC0003%3A1; __cf_bm=.fksdoBlzBs1zuhiY0rYFqFhDkstwwQJultZ756_yrw-1647645226-0-AaluVZQHZhOL5X4GXWxqEIC5Rp3/gkhKORy7WXjZpp5N/a4ovPxRX6KUxD/zpjZ/YFHBokF82hLwBtxtwetYhp/TSrGowLS7sC4nnLNy2WWMpZSA7Fv1tMISsR6qBZdPvg==; locale=en-US`,
        "origin": "https://discord.com",
        "referer": "https://discord.com/login",
        "sec-ch-ua": "Not A;Brand\";v=\"99\", \"Chromium\";v=\"99\", \"Google Chrome\";v=\"99",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "macOS",
        "sec-fetch-des": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.74 Safari/537.36",
        "x-discord-locale": "en-US",
        "x-fingerprint": fingerprint,
        "x-super-properties": "eyJvcyI6Ik1hYyBPUyBYIiwiYnJvd3NlciI6IkNocm9tZSIsImRldmljZSI6IiIsInN5c3RlbV9sb2NhbGUiOiJ6aC1DTiIsImJyb3dzZXJfdXNlcl9hZ2VudCI6Ik1vemlsbGEvNS4wIChNYWNpbnRvc2g7IEludGVsIE1hYyBPUyBYIDEwXzE1XzcpIEFwcGxlV2ViS2l0LzUzNy4zNiAoS0hUTUwsIGxpa2UgR2Vja28pIENocm9tZS85OS4wLjQ4NDQuNzQgU2FmYXJpLzUzNy4zNiIsImJyb3dzZXJfdmVyc2lvbiI6Ijk5LjAuNDg0NC43NCIsIm9zX3ZlcnNpb24iOiIxMC4xNS43IiwicmVmZXJyZXIiOiIiLCJyZWZlcnJpbmdfZG9tYWluIjoiIiwicmVmZXJyZXJfY3VycmVudCI6IiIsInJlZmVycmluZ19kb21haW5fY3VycmVudCI6IiIsInJlbGVhc2VfY2hhbm5lbCI6InN0YWJsZSIsImNsaWVudF9idWlsZF9udW1iZXIiOjExOTc2MSwiY2xpZW50X2V2ZW50X3NvdXJjZSI6bnVsbH0=",
    }
}