// Tempo de expiração do contador
const expiration = {
    years: 0,
    months: 0,
    days: 0,
    hours: 42,
    minutes: 27,
    seconds: 34,
}

const time = document.getElementById('timer');

let timer;

const debounce = (func, delay = 10, immediate = true) => {
    let timeout;

    return function () {
        let context = this, args = arguments;

        let later = function () {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };

        let ready = immediate && !timeout;

        clearTimeout(timeout);
        timeout = setTimeout(later, delay);

        if (ready) func.apply(context, args);
    };
};


const changeTime = (timeStamp) => {
    const now = new Date();

    if (now.getTime() >= timeStamp) {
        time.classList.remove('text-success');
        time.classList.add('text-danger');
        time.innerText = '00:00:00';

        return clearInterval(timer);
    }

    const expirationDate = new Date(timeStamp);
    const distance = expirationDate - now;

    const hours = Math.floor((distance / (1000 * 60 * 60))).toLocaleString('pt-BR', { minimumIntegerDigits: 2 });
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)).toLocaleString('pt-BR', { minimumIntegerDigits: 2 });
    const seconds = Math.floor((distance % (1000 * 60)) / 1000).toLocaleString('pt-BR', { minimumIntegerDigits: 2 });

    time.innerText = `${ hours }:${ minutes }:${ seconds }`;
}


// Configura temporizador de intervalo pra mudar o valor do contador
const setTimer = () => {
    const cookieString = document.cookie;

    const cookies = Object.fromEntries(cookieString.split('; ').map(chunk => {
        const [name, value] = chunk.split('=');

        return [name, value];
    }));

    let timeStamp = cookies.time ? JSON.parse(cookies.time) : null;

    const now = new Date();

    if (!timeStamp) {
        const { years, months, days, hours, minutes, seconds } = expiration;

        const expirationDate = new Date(
            years + now.getFullYear(),
            months + now.getMonth(),
            days + now.getDate(),
            hours + now.getHours(),
            minutes + now.getMinutes(),
            seconds + now.getSeconds()
        );

        timeStamp = expirationDate.getTime();

        document.cookie = `time=${ timeStamp }; expires=${ new Date(expirationDate.getTime()).toUTCString() }`;
    }

    changeTime(timeStamp);
    
    timer = setInterval(() => changeTime(timeStamp), 1000);
}

// Diminui potência do scroll
window.addEventListener('wheel', (event) => {
    if (event.ctrlKey) {
        return;
    }

    event.preventDefault();
    
    if (window.lastScrollTime && new Date().getTime() < window.lastScrollTime + 500) {
        return;
    }

    window.lastScrollTime = new Date().getTime();
    
    document.body.scrollTop += event.deltaY * 5;
}, { passive: false });

// Remove a opacidade da chamada para o cadastro ao rolar para baixo
document.body.addEventListener('scroll', debounce(() => {
    const callToAction = document.querySelector('.call-to-action');

    if (callToAction.clientHeight > document.body.scrollTop) {
        document.body.classList.add('scrolled-down');
    } else {
        document.body.classList.remove('scrolled-down');
    }
}, 100, true));

window.addEventListener('DOMContentLoaded', setTimer);