import * as kontra from "kontra";

function greeter(person: string) {
    return "Hello, " + person;
}

const user = "Frederik User";

document.body.innerHTML = greeter(user);
