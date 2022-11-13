import { findByCode } from "./viacep.js";

const form = document.getElementById('form');

const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const phoneInput = document.getElementById('phone');
const codeInput = document.getElementById('code');
const ufInput = document.getElementById('uf');
const cityInput = document.getElementById('city');
const districtInput = document.getElementById('district');
const streetInput = document.getElementById('street');
const numberInput = document.getElementById('number');

const inputs = [
    nameInput,
    emailInput,
    phoneInput,
    codeInput,
    ufInput,
    cityInput,
    districtInput,
    streetInput,
    numberInput,
];

const cleanForm = () => {
    inputs.forEach(input => {
        const parent = input.parentElement;
        const feedback = parent.querySelector('.invalid-feedback');
        
        input.value = '';

        input.classList.remove('is-valid', 'is-invalid');
        feedback.innerText = '...';
    });
}

const validateEmail = (value) => {
    // e-mail.local_part@domain.com.br
    const characters = '[0-9a-z\u00C0-\u00FF]';
    const punctuation = '[0-9a-z\u00C0-\u00FF+-.]';
    const special = '[!#$%&*+-_.]';
    const regex = new RegExp(
        '^' +
        characters + '+' +
        special + '*' +
        characters + '+@' +
        characters + '+' +
        punctuation + '*' +
        characters + '+$',
        'gi'
    );

    if (!value.match(regex)) {
        return false;
    }

    return true;
}

const emailAlreadyExists = (value) => {
    const cookieString = decodeURIComponent(document.cookie);
    const cookies = Object.fromEntries(cookieString.split('; ').map(chunk => {
        const [name, value] = chunk.split('=');

        return [name, value];
    }));

    cookies.email_list = cookies.email_list ? cookies.email_list : '[]';

    const list = JSON.parse(cookies.email_list);

    return list.includes(value);
}

const validateInput = (input) => {
    const parent = input.parentElement;
    const feedback = parent.querySelector('.invalid-feedback');
    const { value } = input;

    feedback.innerText = '';
    input.classList.remove('is-valid');
    input.classList.remove('is-invalid');

    let valid = true;
    let newMessage = '...';

    switch (input) {
        case nameInput:
            valid = value ? true : false;

            newMessage = valid ? '...' : 'Nome inválido!';

            break;
        case emailInput:
            valid = validateEmail(value);

            newMessage = valid ? '...' : 'E-mail inválido!';

            break;
        case phoneInput:
            valid = value ? true : false;

            newMessage = valid ? '...' : 'Telefone inválido!';

            break;
        case codeInput:
            valid = /^[0-9]{8}$/.test(value.replace(/\D/g, ''));

            newMessage = valid ? '...' : 'CEP inválido!';

            break;
        case ufInput:
            valid = /^[A-Z]{2}$/.test(value);

            newMessage = valid ? '...' : 'Estado inválido!';

            break;
        case cityInput:
            valid = value.length > 3;

            newMessage = valid ? '...' : 'Cidade inválida!';

            break;
        case districtInput:
            valid = value.length > 1;

            newMessage = valid ? '...' : 'Bairro inválido!';

            break;
        case streetInput:
            valid = value.length > 3;

            newMessage = valid ? '...' : 'Logradouro inválido!';

            break;
        case numberInput:
            valid = value ? true : false;

            newMessage = valid ? '...' : 'Número inválido!';

            break;
        default:
            valid = true;

            break;
    }

    if (valid) {
        input.classList.add('is-valid');
    } else {
        input.classList.add('is-invalid');        
    }

    feedback.innerText = newMessage;

    return valid;
}

const modal = new bootstrap.Modal('#modal');

const showModal = ({ title = '', message = '' }) => {
    const modalComponent = document.querySelector('#modal');
    const modalTitle = modalComponent.querySelector('.modal-title');
    const modalMessage = modalComponent.querySelector('.modal-body .modal-message');

    modalTitle.innerText = title;
    modalMessage.innerText = message;

    modal.show();
}

// Preenche de uma vez os inputs de endereço
const fillAddress = ({ uf = '', city = '', district = '', street = '' }) => {
    ufInput.value = uf;
    cityInput.value = city;
    districtInput.value = district;
    streetInput.value = street;
}


// Preenche o endereço ao sair do input do CEP
const handleCodeBlur = (input) => {
    const parent = input.parentElement;
    const feedback = parent.querySelector('.invalid-feedback');
    const { value } = input;

    fillAddress({ uf: '...', city: '...', district: '...', street: '...' });

    findByCode(value)
    .then(response => {
        const { uf, localidade: city, bairro: district, logradouro: street } = response;
        
        if (response.erro) {
            throw new Error('CEP inválido!');
        }

        fillAddress({ uf, city, district, street });

        input.classList.remove('is-invalid');
        input.classList.add('is-valid');

        validateInput(ufInput);
        validateInput(cityInput);
        validateInput(districtInput);
        validateInput(streetInput);

        feedback.innerText = "...";
    })
    .catch((e) => {
        fillAddress({ uf: '', city: '', district: '', street: '' });

        input.classList.remove('is-valid');
        input.classList.add('is-invalid');

        feedback.innerText = e.message ? e.message : 'CEP inválido!';
    });
}

// Valida o email ao sair do input
const handleEmailBlur = (input) => {
    const parent = input.parentElement;
    const feedback = parent.querySelector('.invalid-feedback');
    const { value } = input;

    if (emailAlreadyExists(value)) {
        const message = "E-mail já cadastrado!"
        input.classList.add('is-invalid');
        feedback.innerText = message;

        input.value = '';

        showModal({
            title: 'Ops...',
            message
        });

        return;
    }

    validateInput(input);
}

const handleBlur = (event) => {
    const input = event.target;

    switch (input) {
        case nameInput:
        case phoneInput:
        case ufInput:
        case cityInput:
        case districtInput:
        case streetInput:
        case numberInput:
            validateInput(input);

            break;
        case emailInput:
            handleEmailBlur(input);

            break;
        case codeInput:
            handleCodeBlur(input);

            break;
    }
}

const postData = async (url, formData) => {
    const data = new URLSearchParams(formData);

    const response = await fetch(url, { method: 'POST', body: data});

    const decoded = await response.json();

    if (!response.ok) {
        throw new Error(decoded.error);
    }

    return decoded;
}

const handleSubmit = (event) => {
    event.preventDefault();

    let valid = true;

    if (!validateInput(nameInput)) valid = false;
    if (!validateInput(emailInput)) valid = false;
    if (!validateInput(phoneInput)) valid = false;
    if (!validateInput(codeInput)) valid = false;
    if (!validateInput(ufInput)) valid = false;
    if (!validateInput(cityInput)) valid = false;
    if (!validateInput(districtInput)) valid = false;
    if (!validateInput(streetInput)) valid = false;
    if (!validateInput(numberInput)) valid = false;

    if (!valid) return;

    const formData = new FormData(event.target);

    let alert = {
        title: '',
        message: '',
    }

    postData('./index.php', formData)
    .then(response => {
        const { email } = response;

        alert.title = 'Parabéns...';
        alert.message = `E-mail <${ email }> foi cadastrado!`;

        cleanForm();
    })
    .catch((e) => {
        alert.title = 'Erro...';
        alert.message = e.message;
    })
    .finally(() => {
        showModal(alert);
    });
}

form.addEventListener('submit', event => handleSubmit(event));

inputs.forEach(input => input.addEventListener('blur', event => handleBlur(event)));