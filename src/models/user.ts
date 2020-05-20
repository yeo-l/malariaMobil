export interface IUser {
    url: string;
    username: string;
    password: string;
    domain: string;
}
export class User {
     url: string;
     username: string;
     password: string;
     authdata?: string;
     domain: string;
}

