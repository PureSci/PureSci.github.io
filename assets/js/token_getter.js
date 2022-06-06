let passlabel = document.getElementById("passlabel");
let maillabel = document.getElementById("emaillabel");
var currenttab = "logincontainer";
document.querySelector(".unknowntext").innerHTML = syntaxHighlight(JSON.stringify({
    test: "adasd",
    adsadas: "asdasd",
    asdlsd: {
        adad: ["adasdasd", "w"]
    }
}, null, 4));
async function submitLogin() {
    maillabel.innerHTML = "E-Mail";
    passlabel.innerHTML = "Password";
    if (check()) return;
    let mail = document.getElementById("email").value;
    let pass = document.getElementById("pass").value;
    var m = hcaptcha.render('captcha', {
        sitekey: "f5561ba9-8f1e-40ca-9b5b-a0b3f719ef34",
        theme: 'dark',
        'error-callback': 'onError',
    });
    showContainer("captchacontainer");
    hcaptcha.execute(m, { async: true })
        .then(({ response, key }) => {
            fetch(`https://purescience.herokuapp.com/api/token_getter`, {
                method: "POST",
                headers: {
                    "content-type": "application/json"
                },
                body: JSON.stringify({
                    response: response,
                    mail: mail,
                    pass: pass
                })
            }).then(r => r.json()).then(r => {
                document.getElementById("captcha").innerHTML = "";
                if (r.error) {
                    showContainer("logincontainer");
                    if (r.errors.login) {
                        maillabel.innerHTML = `<span class=\"req\">E-Mail - <span class=\"prob\">${r.errors.login._errors[0].message}</span></span>`;
                    }
                    if (r.errors.password) {
                        passlabel.innerHTML = `<span class=\"req\"Password - <span class=\"prob\">${r.errors.password._errors[0].message}</span></span>`;
                    }
                } else if (r.token) {
                    document.getElementById("token").value = r.token;
                    showContainer("tokencontainer");
                } else if (r.mfa) {
                    document.getElementById("ticket").innerHTML = r.ticket;
                    showContainer("mfacontainer");
                } else if (r.unknown) {
                    document.getElementById("unkowntext").innerHTML = syntaxHighlight(JSON.stringify(r.unknown, null, 4));
                    showContainer("unknowncontainer");
                }
            }).catch(er => {
                document.getElementById("unknowntext").innerHTML = "Theres a problem with the server.<br>Please contact to Pure#8181 over Discord";
                showContainer("unknowncontainer");
            })
        });
}

function check() {
    let r = false;
    let mail = document.getElementById("email").value;
    let pass = document.getElementById("pass").value;
    if (mail.trim() == "") {
        r = true;
        maillabel.innerHTML = "<span class=\"req\">E-Mail - <span class=\"prob\">This field is required</span></span>";
    } else if (!mail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        r = true;
        maillabel.innerHTML = "<span class=\"req\">E-Mail - <span class=\"prob\">Please enter a valid e-mail.</span></span>";
    }
    if (pass.trim() == "") {
        r = true;
        passlabel.innerHTML = "<span class=\"req\">Password - <span class=\"prob\">This field is required</span></span>";
    }
    return r;
}

function showContainer(container) {
    currenttab = container;
    Array.from(document.getElementById("body").children).forEach(x => {
        if (x.id == "nontouch") return;
        x.classList.add("invis");
    });
    document.getElementById(container).classList.remove("invis");
}

function syntaxHighlight(json) {
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        var cls = 'number';
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = 'key';
            } else {
                cls = 'string';
            }
        } else if (/true|false/.test(match)) {
            cls = 'boolean';
        } else if (/null/.test(match)) {
            cls = 'null';
        }
        return '<span class="' + cls + '">' + match + '</span>';
    });
}

function copyToken(el) {
    var token = document.getElementById("token");
    token.select();
    token.setSelectionRange(0, 99999);
    el.innerHTML = "Copied";
    setTimeout(() => {
        el.innerHTML = "Copy"
    }, 3000);
    navigator.clipboard.writeText(token.value);
}

function newAccount() {
    document.getElementById("email").value = "";
    document.getElementById("pass").value = "";
    document.getElementById("ticket").innerHTML = "";
    document.getElementById("mfacode").value = "";
    document.getElementById("unknowntext").innerHTML = "";
    document.getElementById("token").value = "";
    showContainer("logincontainer");
}

function submitMFA() {
    var ticket = document.getElementById("ticket").innerHTML;
    document.getElementById("mfalabel").innerHTML = "Enter Discord Auth/Backup Code";
    fetch("https://purescience.herokuapp.com/api/token_getter", {
        method: "POST",
        headers: {
            "content-type": "application/json"
        },
        body: JSON.stringify({
            ticket: ticket,
            code: document.getElementById("mfacode").value
        })
    }).then(r => r.json()).then(r => {
        if (r.message) return document.getElementById("mfalabel").innerHTML = `<span class=\"req\">Enter Discord Auth/Backup Code - <span class=\"prob\">${r.message}</span></span>`;
        if (r.token) {
            document.getElementById("token").value = r.token;
            showContainer("tokencontainer");
        } else if (r.unknown) {
            document.getElementById("unkowntext").innerHTML = syntaxHighlight(JSON.stringify(r.unknown, null, 4));
            showContainer("unknowncontainer");
        }
    }).catch(er => {
        document.getElementById("unknowntext").innerHTML = "Theres a problem with the server.<br>Please contact to Pure#8181 over Discord";
        showContainer("unknowncontainer");
    });
}
window.addEventListener("keypress", event => {
    if (event.key == "Enter") {
        if (currenttab == "logincontainer") {
            submitLogin()
        } else if (currenttab == "mfacontainer") {
            submitMFA()
        } else if (currenttab == "unknowncontainer" || currenttab == "tokencontainer") {
            newAccount();
        }
    }
})