var back = Math.floor(Math.random() * 5);
var element = document.getElementById('body');
var lock = false;
var icon = '';

if(back == 0) {
    element.classList.add("background1");
}else if(back == 1) {
    element.classList.add("background2");
}else if(back == 2) {
    element.classList.add("background3");
}else if(back == 3) {
    element.classList.add("background4");
}else if(back == 4) {
    element.classList.add("background5");
}
function connectToServer() {

    document.getElementById("btn-odjava").disabled = false;
    var nadimak = document.getElementById('nadimak').value;

    var n = nadimak.includes('@');
    if(n == true) {
        document.getElementById('greska').innerHTML = `Nepodržani znak @ je u nadimku! <img src="/assets/images/details/greska.png" class="greska">`;
        nadimak = '';
    }
    var greska = document.getElementById('greska');
    greska.style.display = "none";
    if(nadimak != '' && lock) {
        document.getElementById('username').innerHTML = nadimak;
        document.getElementById('icon').src = icon;
        document.getElementById('pos').innerHTML = nadimak;
        console.log(nadimak);
        sessionStorage.setItem('nadimak', nadimak);
        document.getElementById('nadimak').value = '';
        document.getElementById('avatar-form').style.display = 'none';

        //socket = new WebSocket('ws://localhost:8091/');
        socket = new WebSocket('ws://192.168.1.21:8091/');

        socket.onopen = function(event) {
            console.log('connection open');

            socket.send(JSON.stringify({
                type: 'server',
                connect: true
            }));

            var message = {
                type: 'client',
                avatar: icon,
                name: nadimak,
                text: ' se prijavio u chat :)',
                prijava: true
            };       
            
            socket.send(JSON.stringify(message));
            document.getElementById('chat-container').style.display = "block";
            $('#message').summernote();
        }

        socket.onerror = function(event) {
            console.log('Error: ' + JSON.stringify(event));
        }

        socket.onmessage = function (event) {
            var message = JSON.parse(event.data);
            if (message.type == 'client') {
                addMessage(message);
            }
        }

        socket.onclose = function(event) {
            console.log('Closed connection');
        }

        window.addEventListener('beforeunload', function() {

            var message = {
                type: 'client',
                avatar: icon,
                name: sessionStorage.getItem('nadimak'),
                text: ' se odjavio iz chata :(',
                odjava: true
            };       

            socket.send(JSON.stringify(message));
            document.getElementById('chat-container').style.display = 'none';
            document.getElementById('avatar-form').style.display = 'block';
            socket.close();
        });

    }else {
        var a = 0; 
        document.getElementById('greska').innerHTML = `Nije upisan nadimak ili odabran avatar! <img src="/assets/images/details/greska.png" class="greska">`;
        greska.style.display = "block";
        // alert('Nije upisnao korisničko ime ili odabran avatar!');
    }
    
}

function addMessage(message) {
    var messageicon = '';
    if(message.private == true) {
        if(message.name.toLowerCase() == sessionStorage.getItem('nadimak').toLowerCase()) {
            addingMessage(message);
        } else {
            message.client.forEach(element => {
                if(element.toLowerCase() == sessionStorage.getItem('nadimak').toLowerCase()) {
                    addingMessage(message);
                }
            })
        }
        
    }else {
        var vrijeme = new Date();
        var mjesec = Number(vrijeme.getMonth())+1;
        var vrijeme = vrijeme.getDate()+'.'+ mjesec +'.'+vrijeme.getFullYear()+'.         '+vrijeme.getHours()+':'+vrijeme.getMinutes();
        var tr = document.createElement('tr');
        if (message.prijava) {
            messageicon = 'assets/images/details/prijava.png';
            tr.classList.add('table-success');
        } else if (message.odjava) {
            messageicon = 'assets/images/details/odjava.png';
            tr.classList.add('table-danger');
        } else if (message.name != sessionStorage.getItem('nadimak')) {
            tr.classList.add('table-info');
        }
        var td = tr.appendChild(document.createElement('td'));
        td.innerHTML = `<img src="${message.avatar}" class="user-avatar-mini"><b>${message.name}:</b> <img src="${messageicon}" class="private"><div class="fix">${message.text}</div> </br> <div class="date">${vrijeme}</div>`;
        document.getElementById('chatTable').appendChild(tr);
    }
    window.scrollTo(0,document.body.scrollHeight);
}

function sendToChat() {
    var private = document.getElementById('private').value;
    private = private.split('@');
    if(private != '') {
        var message = {
            type: 'client',
            avatar: icon,
            name: sessionStorage.getItem('nadimak'),
            text: document.getElementById('message').value,
            private: true,
            client: private
        };
    }else {
        var message = {
            type: 'client',
            avatar: icon,
            name: sessionStorage.getItem('nadimak'),
            text: document.getElementById('message').value
        };
    }
    var chatGreska = document.getElementById('greska2');
    if(message.text != '') {
        chatGreska.style.display = "none";
        fetch('assets/data/emoji.json').then(response => {
            response.json().then(data => {
                data.emojis.forEach(element => {
                        // var re = new RegExp("/\b"+element.chars+"\/", 'g');
                        // message.text = message.text.replace(re, `<img src="${element.src}" style="width: 24px;">`);
                        message.text = message.text.replace(element.chars, `<img src="${element.src}" style="width: 24px;">`);
                });
    
                socket.send(JSON.stringify(message));
                document.getElementById('message').value = '';
                $('#message').summernote('code', '');       
            });
        });
    }else {
        chatGreska.style.display = "block";
    }
}

function convertEmoji(text) {

    fetch('assets/data/emoji.json').then(response => {
        console.log(response);
        response.json().then(data => {
            console.log(data);
            
            data.emojis.forEach(element => {
                console.log(element);
                text = text.replace(/element.chars/g, `<img src="${element.src}" style="width: 24px;">`);
            });

        });
    });
}


function odjava()  {
    location.reload();
}

function selectAvatar() {
    lock = true;
    if (event.target.src) {
        icon = event.target.src;
    } else {
        icon = event.target.firstElementChild.src;
    }
}

function upload() {
    icon = document.getElementById('upload').value;
    document.getElementById('preview').src = icon;
}

function addingMessage(message) {
    var vrijeme = new Date();
    var mjesec = Number(vrijeme.getMonth()) + 1;
    var vrijeme = vrijeme.getDate() + '.' + mjesec + '.' + vrijeme.getFullYear() + '.         ' + vrijeme.getHours() + ':' + vrijeme.getMinutes();
    var tr = document.createElement('tr');
    tr.classList.add('table-warning');
    var td = tr.appendChild(document.createElement('td'));
    var messageicon = 'assets/images/details/lock.png';
    td.innerHTML = `<img src="${message.avatar}" class="user-avatar-mini"><b>${message.name} > ${message.client}:</b> <img src="${messageicon}" class="private"><div class="fix">${message.text}</div> </br> <div class="date">${vrijeme}</div>`;
    document.getElementById('chatTable').appendChild(tr);
}