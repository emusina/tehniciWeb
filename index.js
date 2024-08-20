const express = require("express");
const fs = require('fs');
const path = require('path');
// const sharp = require('sharp');
// const sass = require('sass');
// const ejs = require('ejs');

app = express();

console.log("Folder proiect", __dirname);
console.log("Cale fisier", __filename);
console.log("Director de lucru", process.cwd());

app.set("view engine", "ejs");

obGlobal={
    obErori: null
}

vect_foldere = ["temp", "backup"];
for(let folder of vect_foldere){
    let caleFolder = path.join(__dirname, folder);
    if(!fs.existsSync(caleFolder)){
        fs.mkdirSync(caleFolder);
    }
}

app.use("/resurse", express.static(__dirname + "/resurse"));

app.get(["/", "/home", "/index"], function(req,res){
    //res.send("Hello!");
   // res.sendFile(path.join(__dirname,"indexSmartySproutHub.html"));
    res.render("pagini/indexSmartySproutHub", {ip: req.ip});
})

app.get("/favicon.ico", function(req, res){
    res.sendFile(pathJoin(__dirname, "resurse/imagini/ico/favicon.ico"));
})

app.get(new RegExp("^\/resurse\/[a-zA-Z0-9_\/-]+\/$"), function(req,res){
    afisareEroare(res, 403);
    // console.log("Oh, nu! Nu ai voie aici!", req.url);
});

app.get("/test", function(req,res){
    res.render("pagini/test");
})

app.get("/suma/:a/:b", function(req,res){
    res.write((parseInt(req.params.a) + parseInt(req.params.b) + ""));
    res.end();
})

app.get("/*.ejs", function(req,res){
    afisareEroare(res, 400);
})

app.get("/*", function(req,res){
    try{
        res.render("/pagini" + req.url, function(err, rezHtml){
            console.log("Eroare:", err);
            console.log("Html:", rezHtml);
            if(err){
                if(err.message.startsWith("Failed to lookup view")){
                    afisareEroare(res, 404);
                    console.log("Nu a fost gasita pagina:", req.url);
                }
            }
            else{
                res.send(rezHtml);
            }
        });
    }
    catch(err1){
        if(err1.message.startsWith("Cannot find module")){
            afisareEroare(res, 404);
            console.log("Nu a fost gasita resursa:", req.url);
            return;
        }
        afisareEroare(res);
    }
})

function initErori(){
    let continut = fs.readFileSync(path.join(__dirname, "resurse/json/erori.json")).toString("utf-8");
    // console.log(continut);
    obGlobal.obErori = JSON.parse(continut);
    for (let eroare of obGlobal.obErori.info_erori){
        eroare.imagine = path.join(obGlobal.obErori.cale_baza, eroare.imagine)
    }
    let err_default = obGlobal.obErori.eroare_default;
    err_default.imagine = path.join(obGlobal.obErori.cale_baza, err_default.imagine);
}

initErori();

function afisareEroare(res, _identificator, _titlu, _text, _imagine){
    let eroare = obGlobal.obErori.info_erori.find(function(elem){
        return elem.identificator == _identificator;
    });
    if(!eroare){
        eroare = obGlobal.obErori.eroare_default;
    }
    res.render("pagini/eroare",
        {
        titlu: _titlu || eroare.titl,
        text: _text || eroare.text,
        imagine: _imagine || eroare.imagine
        }
    );
}

app.listen(8080);

console.log("Serverul a pornit");