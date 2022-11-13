// Realiza um GET request
const fetchLocation = async (url) => {
    const response = await fetch(url)
    .then((res) => {
        return res;
    })
    .catch(() => {
        throw new Error('Erro desconhecido!');
    });

    if (response.status >= 400 && response.status < 500) {
        throw new Error(response.error);
    }
    
    if (!response.ok) {
        throw new Error('Erro no servidor!');
    }

    return response.json();
}

export const findByCode = async (value) => {
    const code = value.replace(/\D/g, '');
    const regex =  /^[0-9]{8}$/;

    if (!regex.test(code)) {
        throw new Error("Formato inválido!");
    }

    const url = `https://viacep.com.br/ws/${ code }/json/`;

    return await fetchLocation(url);
}

export const findByStreet = async ({ uf = "SP", city = "", street = "" }) => {
    if (city.length < 3 || street.length < 3) {
        throw new Error("Logradouro precisa conter ao menos 3 letras!");
    }

    const url = `https://viacep.com.br/ws/${ uf }/${ city }/${ street }/json/`;

    return await fetchLocation(url);
}