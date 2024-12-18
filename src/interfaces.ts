export interface Animal {
    id: number;
    name: string;
    species: string;
    age: number;
}

export interface SpeciesCount {
    species: string;
    _count: number;
}