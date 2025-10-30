export interface Client {
    id_client: number;
    nom: string;
    prenom: string;
    code: string;
    email: string;
    password: string;
}

export interface DBClient {
    ID_CLIENT: number;
    NOM: string;
    PRENOM: string;
    CODE: string;
    EMAIL: string;
    PASSWORD: string;
}
