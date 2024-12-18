import { Animal, SpeciesCount } from './interfaces.ts';

const API_URL = 'http://localhost:3000';

const errorMessage = document.getElementById("errorMessage") as HTMLDivElement;
const form = document.getElementById("form") as HTMLFormElement;
const animalList = document.getElementById("animalList") as HTMLElement;
const speciesList = document.getElementById("speciesList") as HTMLElement;
const alertTemplate = document.getElementById("alertTemplate") as HTMLTemplateElement;

function GetAnimals(): Promise<Animal[]> {
    const request: RequestInfo = new Request(API_URL + '/animals', { method: 'GET' });
    return fetch(request)
        .then(res => res.json())
        .then(res => res as Animal[]);
}

function GetAnimalsBySpecies(): Promise<SpeciesCount[]> {
    const request: RequestInfo = new Request(API_URL + '/animals/bySpecies', { method: 'GET' });
    return fetch(request)
        .then(res => res.json())
        .then(res => res as SpeciesCount[]);
}

function Alert(message: string) {
    const alert = alertTemplate.content.cloneNode(true) as HTMLElement;
    const messageBox = alert.querySelector('#message') as HTMLSpanElement;

    messageBox.textContent = message;
    document.body.appendChild(alert);

    setTimeout(() => {
        const alert = document.querySelector('.alert') as HTMLElement;
        alert.remove();
    }, 3000);
}

function Upload(x: SubmitEvent) {
    x.preventDefault();
    const form = x.target as HTMLFormElement;
    const formData = new FormData(form);

    const name: string = formData.get("name") as string;
    const species: string = formData.get("species") as string;
    const age: number = Number(formData.get("age") as string);

    const request: RequestInfo = new Request(API_URL + '/animals', {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, species, age })
    });

    return fetch(request)
        .then(res => res.json())
        .then((data: { error?: boolean; message?: string | string[] }) => {
            if (data.error) {
                errorMessage.innerHTML = "";
                if (Array.isArray(data.message)) {
                    data.message.forEach((element: string) => {
                        const p = document.createElement("p");
                        p.textContent = element;
                        errorMessage.appendChild(p);
                        errorMessage.appendChild(document.createElement("br"));
                    });
                } else if (typeof data.message === "string") {
                    const p = document.createElement("p");
                    p.textContent = data.message;
                    errorMessage.appendChild(p);
                }
            } else {
                Main();
                form.reset();
            }
        })
}

function Delete(id: number) {
    const request: RequestInfo = new Request(API_URL + '/animals/' + id, { method: 'DELETE' });
    return fetch(request)
        .then(res => res);
}

function Main() {
    GetAnimals().then((x) => {
        animalList.innerHTML = "";
        x.forEach(element => {
            const tr = document.createElement("tr");
            const nameTd = document.createElement("td");
            const speciesTd = document.createElement("td");
            const ageTd = document.createElement("td");
            const actionTd = document.createElement("td");
            const btn = document.createElement("button");

            btn.className = "btn btn-error";
            btn.textContent = "Törlés";
            btn.onclick = () => {
                Delete(element.id).then(x => {
                    x.json()
                        .then((y) => {
                            if (y.error) Alert(y.message);
                        })
                    Main();
                });
            };

            nameTd.textContent = element.name;
            speciesTd.textContent = element.species;
            ageTd.textContent = element.age.toString();
            actionTd.appendChild(btn);

            tr.appendChild(nameTd);
            tr.appendChild(speciesTd);
            tr.appendChild(ageTd);
            tr.appendChild(actionTd);
            animalList.appendChild(tr);
        });
    });

    GetAnimalsBySpecies().then((x) => {
        speciesList.innerHTML = "";
        x.forEach(element => {
            const tr = document.createElement("tr");
            const speciesTd = document.createElement("td");
            const countTd = document.createElement("td");

            speciesTd.textContent = element.species;
            countTd.textContent = element._count.toString();

            tr.appendChild(speciesTd);
            tr.appendChild(countTd);
            speciesList.appendChild(tr);
        });
    });

    form.onsubmit = Upload;
}

Main();
