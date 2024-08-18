function uploadFile() {
    document.getElementById('file').click();
}

function readExcel() {

    try {
    var input = document.getElementById('file');
    var reader = new FileReader();

    reader.onload = function (e) {
        var data = new Uint8Array(e.target.result);
        var workbook = XLSX.read(data, { type: 'array' });
        var sheetName = workbook.SheetNames[0];
        var sheet = workbook.Sheets[sheetName];
        var jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        
        const nameToNumberAnswers = sortJson(jsonData);
        console.log(nameToNumberAnswers);
        
        const final = checkTheMotivation(nameToNumberAnswers);
        console.log(final);   

        createTable(final);
    };

    reader.readAsArrayBuffer(input.files[0]);

    } catch (error) {
        alert(`Упс, что-то пошло не так. Может файл не загрузился? Или: ${error}`)
    }

}

const sortJson = (data) => {

    data.shift();
    data.forEach(arr => arr.shift());
    const nameToAnswers = data.map(arr => [arr[0], arr.slice(1)]);
    const nameToNumberAnswers = nameToAnswers
        .map(arr => [arr[0], arr[1]
                .map(str => str.toString().charAt(0))
                    .map(Number)
            ]);

    return nameToNumberAnswers;
}

const checkTheMotivation = (data) => {
    let motivationList = {};

    data.forEach((ppl, index) => {
        for (let key in answers) {
            let coincid = 0;
            let answersArray = answers[key].answers;
            let nameMotivationTip = answers[key].name; 
            const pplAnswers = ppl[1];
            const pplName = ppl[0];

            answersArray.forEach((el, i) => {
                if (typeof el === "string") {
                    stringToNumberArr(el)
                        .forEach(num => {
                           if (num == pplAnswers[i]) {
                                ++coincid;
                           }
                        })
                } else if (pplAnswers[i] != 0 && pplAnswers[i] == el) {
                     ++coincid;  
                }
            });
    
            if (!motivationList[pplName]) {
                motivationList[pplName] = {}
            }
            if (!motivationList[pplName][key]) {
                motivationList[pplName][key] = {
                    name: nameMotivationTip,
                    coincid: coincid
                }
            }
        }   
    })

    return motivationList;
    
}

const stringToNumberArr = (string) => string.split(", ").map(Number);

const createTable = (data) => {
    document.querySelector('.upload').style = 'display: none';
    document.querySelector('.read').style = 'display: none';

    let tableContainer = document.querySelector('.tableBlock');
    let table = document.createElement('table');
    let headers = ["ФИО", "Инструментальный", "Профессиональный", "Патриотический", "Хозяйский", "Люмпенизированный"];
    let headerRow = document.createElement('tr');

    let button = document.createElement('button');
    button.setAttribute("class", "mainMotive");
    button.innerText = 'Выбрать только основные типы мотиваций';

    headers.forEach(header => {
        let th = document.createElement('th');
        th.textContent = header;
        headerRow.appendChild(th)
    });
    table.appendChild(headerRow)

    for (let name in data) {
        let dataRow = document.createElement('tr')
        let th = document.createElement('td');
        th.textContent = name;
        dataRow.appendChild(th);
        for (let motivation in data[name]) {
            let th = document.createElement('td');
            th.textContent = data[name][motivation].coincid;
            dataRow.appendChild(th);
        }
        
        table.appendChild(dataRow);

    }

    tableContainer.appendChild(button);
    tableContainer.appendChild(table);

    button.onclick = () => {
        tableContainer.removeChild(table)
        tableContainer.removeChild(button)

        let tableContainer2 = document.querySelector('.tableBlock');
        let table2 = document.createElement('table');
        let headers2 = ["ФИО", "Тип мотивации"];
        let headerRow2 = document.createElement('tr');

        headers2.forEach(header => {
            let th2 = document.createElement('th');
            th2.textContent = header;
            headerRow2.appendChild(th2)
        });
        table2.appendChild(headerRow2)

        

        for (let name in data) {
            let dataRow2 = document.createElement('tr')
            let td2 = document.createElement('td');
            td2.textContent = name;
            dataRow2.appendChild(td2);
            let max;

            for (let motivation in data[name]) {
                let dataMotive = data[name][motivation];
                    
                if (!max) {
                    max = dataMotive.coincid;
                    mainMotive = [dataMotive.name];
                }
                if (max < dataMotive.coincid) {
                    max = dataMotive.coincid;
                    mainMotive = [dataMotive.name];
                } else if (max == dataMotive.coincid) {
                    mainMotive.push(dataMotive.name)
                }
            }
            const mainMotiveNoCopies = new Set(mainMotive);
            const finalMotiveArray = Array.from(mainMotiveNoCopies);
            
            let tdCoincid = document.createElement('td');
            tdCoincid.textContent = finalMotiveArray.toString();
            dataRow2.appendChild(tdCoincid);
            
            table2.appendChild(dataRow2);

        }
        tableContainer2.appendChild(table2)
    }
}   
