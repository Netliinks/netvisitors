interface AppConfig {
    baseUrl: string
    clientId: string
    clientSecret: string
    consultaUser: string
}

interface Window {
    APP_CONFIG: AppConfig
}

window.APP_CONFIG = { baseUrl: 'https://backend4.netliinks.com:443/', clientId: 'c3c0353462', clientSecret: '2fc9f1be5d7b0d18f25be642b3af1e5b', consultaUser: 'consulta'
}
