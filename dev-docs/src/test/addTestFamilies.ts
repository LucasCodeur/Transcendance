
import { db } from "../prisma/db.ts";

// ============================================================
// 1. DONNÉES DE TEST
// ============================================================

interface PersonSeed {
    givenName: string;
    surName: string;
    gender: "M" | "F";
    birthDate: string;
    birthPlace: string;
    nickName: string;
    maidenName: string | null;
    marriedName: string | null;
    deceased: boolean;
    deathDate: string | null;
    deathPlace: string | null;
}

interface TreeSeed {
    name: string;
    people: PersonSeed[];
}

const trees: TreeSeed[] = [
    {
        name: "Famille Dupont",
        people: [
            {
                givenName: "Jean", surName: "Dupont", gender: "M",
                birthDate: "1948-02-12T00:00:00.000Z",
                birthPlace: "Paris, France", nickName: "Jeannot",
                maidenName: null, marriedName: null,
                deceased: true,
                deathDate: "2018-05-20T00:00:00.000Z",
                deathPlace: "Lyon, France"
            },
            {
                givenName: "Marie", surName: "Martin", gender: "F",
                birthDate: "1950-06-18T00:00:00.000Z",
                birthPlace: "Lyon, France", nickName: "Mariette",
                maidenName: "Martin", marriedName: "Dupont",
                deceased: false, deathDate: null, deathPlace: null
            },
            {
                givenName: "Pierre", surName: "Dupont", gender: "M",
                birthDate: "1972-03-14T00:00:00.000Z",
                birthPlace: "Lyon, France", nickName: "Pierrot",
                maidenName: null, marriedName: null,
                deceased: false, deathDate: null, deathPlace: null
            },
            {
                givenName: "Claire", surName: "Dupont", gender: "F",
                birthDate: "1974-08-21T00:00:00.000Z",
                birthPlace: "Lyon, France", nickName: "Clo",
                maidenName: "Dupont", marriedName: "Leroy",
                deceased: false, deathDate: null, deathPlace: null
            },
            {
                givenName: "Thomas", surName: "Dupont", gender: "M",
                birthDate: "1977-11-05T00:00:00.000Z",
                birthPlace: "Grenoble, France", nickName: "Tom",
                maidenName: null, marriedName: null,
                deceased: false, deathDate: null, deathPlace: null
            },
            {
                givenName: "Julie", surName: "Dupont", gender: "F",
                birthDate: "1980-04-09T00:00:00.000Z",
                birthPlace: "Lyon, France", nickName: "Ju",
                maidenName: "Dupont", marriedName: null,
                deceased: false, deathDate: null, deathPlace: null
            },
            {
                givenName: "Sophie", surName: "Bernard", gender: "F",
                birthDate: "1973-12-10T00:00:00.000Z",
                birthPlace: "Dijon, France", nickName: "Soso",
                maidenName: "Bernard", marriedName: "Dupont",
                deceased: false, deathDate: null, deathPlace: null
            },
            {
                givenName: "Antoine", surName: "Moreau", gender: "M",
                birthDate: "1975-07-16T00:00:00.000Z",
                birthPlace: "Annecy, France", nickName: "Tony",
                maidenName: null, marriedName: null,
                deceased: false, deathDate: null, deathPlace: null
            },
            {
                givenName: "Lucas", surName: "Dupont", gender: "M",
                birthDate: "2001-01-25T00:00:00.000Z",
                birthPlace: "Lyon, France", nickName: "Lucky",
                maidenName: null, marriedName: null,
                deceased: false, deathDate: null, deathPlace: null
            },
            {
                givenName: "Emma", surName: "Dupont", gender: "F",
                birthDate: "2004-09-13T00:00:00.000Z",
                birthPlace: "Lyon, France", nickName: "Em",
                maidenName: "Dupont", marriedName: null,
                deceased: false, deathDate: null, deathPlace: null
            }
        ]
    },

    {
        name: "Famille Morel",
        people: [
            {
                givenName: "Paul", surName: "Morel", gender: "M",
                birthDate: "1945-04-11T00:00:00.000Z",
                birthPlace: "Bordeaux, France", nickName: "Paulo",
                maidenName: null, marriedName: null,
                deceased: true,
                deathDate: "2015-10-02T00:00:00.000Z",
                deathPlace: "Bordeaux, France"
            },
            {
                givenName: "Anne", surName: "Laurent", gender: "F",
                birthDate: "1948-09-23T00:00:00.000Z",
                birthPlace: "Toulouse, France", nickName: "Annie",
                maidenName: "Laurent", marriedName: "Morel",
                deceased: false, deathDate: null, deathPlace: null
            },
            {
                givenName: "Marc", surName: "Morel", gender: "M",
                birthDate: "1969-02-17T00:00:00.000Z",
                birthPlace: "Bordeaux, France", nickName: "Marco",
                maidenName: null, marriedName: null,
                deceased: false, deathDate: null, deathPlace: null
            },
            {
                givenName: "Isabelle", surName: "Morel", gender: "F",
                birthDate: "1971-06-29T00:00:00.000Z",
                birthPlace: "Bordeaux, France", nickName: "Isa",
                maidenName: "Morel", marriedName: "Petit",
                deceased: false, deathDate: null, deathPlace: null
            },
            {
                givenName: "Nicolas", surName: "Morel", gender: "M",
                birthDate: "1975-03-08T00:00:00.000Z",
                birthPlace: "Pau, France", nickName: "Nico",
                maidenName: null, marriedName: null,
                deceased: false, deathDate: null, deathPlace: null
            },
            {
                givenName: "Camille", surName: "Morel", gender: "F",
                birthDate: "1978-12-19T00:00:00.000Z",
                birthPlace: "Bordeaux, France", nickName: "Cami",
                maidenName: "Morel", marriedName: null,
                deceased: false, deathDate: null, deathPlace: null
            },
            {
                givenName: "Élodie", surName: "Girard", gender: "F",
                birthDate: "1970-05-14T00:00:00.000Z",
                birthPlace: "Nantes, France", nickName: "Lolo",
                maidenName: "Girard", marriedName: "Morel",
                deceased: false, deathDate: null, deathPlace: null
            },
            {
                givenName: "Julien", surName: "Petit", gender: "M",
                birthDate: "1972-08-30T00:00:00.000Z",
                birthPlace: "Tours, France", nickName: "Juju",
                maidenName: null, marriedName: null,
                deceased: false, deathDate: null, deathPlace: null
            },
            {
                givenName: "Hugo", surName: "Morel", gender: "M",
                birthDate: "1998-11-03T00:00:00.000Z",
                birthPlace: "Bordeaux, France", nickName: "Hug",
                maidenName: null, marriedName: null,
                deceased: false, deathDate: null, deathPlace: null
            },
            {
                givenName: "Léa", surName: "Morel", gender: "F",
                birthDate: "2002-07-22T00:00:00.000Z",
                birthPlace: "Bordeaux, France", nickName: "Lili",
                maidenName: "Morel", marriedName: null,
                deceased: false, deathDate: null, deathPlace: null
            }
        ]
    },

    {
        name: "Famille Bernard",
        people: [
            {
                givenName: "André", surName: "Bernard", gender: "M",
                birthDate: "1942-01-07T00:00:00.000Z",
                birthPlace: "Marseille, France", nickName: "Dédé",
                maidenName: null, marriedName: null,
                deceased: true,
                deathDate: "2012-03-18T00:00:00.000Z",
                deathPlace: "Marseille, France"
            },
            {
                givenName: "Françoise", surName: "Robert", gender: "F",
                birthDate: "1946-10-15T00:00:00.000Z",
                birthPlace: "Avignon, France", nickName: "Fanfan",
                maidenName: "Robert", marriedName: "Bernard",
                deceased: false, deathDate: null, deathPlace: null
            },
            {
                givenName: "Philippe", surName: "Bernard", gender: "M",
                birthDate: "1967-05-20T00:00:00.000Z",
                birthPlace: "Marseille, France", nickName: "Philou",
                maidenName: null, marriedName: null,
                deceased: false, deathDate: null, deathPlace: null
            },
            {
                givenName: "Nathalie", surName: "Bernard", gender: "F",
                birthDate: "1970-02-12T00:00:00.000Z",
                birthPlace: "Marseille, France", nickName: "Nath",
                maidenName: "Bernard", marriedName: "Roux",
                deceased: false, deathDate: null, deathPlace: null
            },
            {
                givenName: "Stéphane", surName: "Bernard", gender: "M",
                birthDate: "1973-09-27T00:00:00.000Z",
                birthPlace: "Nice, France", nickName: "Steph",
                maidenName: null, marriedName: null,
                deceased: false, deathDate: null, deathPlace: null
            },
            {
                givenName: "Céline", surName: "Bernard", gender: "F",
                birthDate: "1976-06-04T00:00:00.000Z",
                birthPlace: "Marseille, France", nickName: "Cé",
                maidenName: "Bernard", marriedName: null,
                deceased: false, deathDate: null, deathPlace: null
            },
            {
                givenName: "Valérie", surName: "Simon", gender: "F",
                birthDate: "1968-12-08T00:00:00.000Z",
                birthPlace: "Aix-en-Provence, France", nickName: "Val",
                maidenName: "Simon", marriedName: "Bernard",
                deceased: false, deathDate: null, deathPlace: null
            },
            {
                givenName: "David", surName: "Roux", gender: "M",
                birthDate: "1971-04-19T00:00:00.000Z",
                birthPlace: "Toulon, France", nickName: "Dave",
                maidenName: null, marriedName: null,
                deceased: false, deathDate: null, deathPlace: null
            },
            {
                givenName: "Mathis", surName: "Bernard", gender: "M",
                birthDate: "1995-08-11T00:00:00.000Z",
                birthPlace: "Marseille, France", nickName: "Mat",
                maidenName: null, marriedName: null,
                deceased: false, deathDate: null, deathPlace: null
            },
            {
                givenName: "Chloé", surName: "Bernard", gender: "F",
                birthDate: "1999-03-26T00:00:00.000Z",
                birthPlace: "Marseille, France", nickName: "Clo",
                maidenName: "Bernard", marriedName: null,
                deceased: false, deathDate: null, deathPlace: null
            }
        ]
    }
];

// ============================================================
// 2. CONSTRUCTION DES ARBRES ET DES RELATIONS
// ============================================================

async function seed() {
    console.log("Début du remplissage de la base...");

    try {
        const result = await db.transaction(async (tx) => {
            let totalPersons = 0;
            let totalPartnerships = 0;
            let totalPartnerLinks = 0;
            let totalChildLinks = 0;

            for (let treeIndex = 0; treeIndex < trees.length; treeIndex++) {
                const treeSeed = trees[treeIndex];

                console.log(`Création de ${treeSeed.name}...`);

                // ------------------------------------------------
                // ARBRE
                // ------------------------------------------------

                const tree = await tx.orm.genealogy.Tree.create({
                    name: treeSeed.name
                });

                // ------------------------------------------------
                // PERSONNES
                // ------------------------------------------------

                const persons = [];

                for (let i = 0; i < treeSeed.people.length; i++) {
                    const personSeed = treeSeed.people[i];

                    const gedcomId =
                        `@T${treeIndex + 1}I${i + 1}@`;

                    const person = await tx.orm.genealogy.Person.create({
                        gedcomId,
                        gender: personSeed.gender,

                        fullName:
                            `${personSeed.givenName} ${personSeed.surName}`,

                        givenName: personSeed.givenName,
                        surName: personSeed.surName,

                        nickName: personSeed.nickName,
                        maidenName: personSeed.maidenName,
                        marriedName: personSeed.marriedName,

                        birthDate: personSeed.birthDate,
                        birthPlace: personSeed.birthPlace,
                        birthAdress:
                            `${personSeed.birthPlace}`,

                        deceased: personSeed.deceased,
                        deathDate: personSeed.deathDate,
                        deathPlace: personSeed.deathPlace,

                        treeId: tree.id
                    });

                    persons.push(person);
                    totalPersons++;
                }

                // ------------------------------------------------
                // DÉFINITION DES TROIS UNIONS
                //
                // Index 0 et 1 : grands-parents
                // Index 2 à 5 : leurs enfants
                // Index 6 et 7 : conjoints de deux enfants
                // Index 8 et 9 : petits-enfants
                // ------------------------------------------------

                const familyDefinitions = [
                    {
                        partners: [0, 1],
                        children: [2, 3, 4, 5]
                    },
                    {
                        partners: [2, 6],
                        children: [8]
                    },
                    {
                        partners: [3, 7],
                        children: [9]
                    }
                ];

                // ------------------------------------------------
                // UNIONS ET LIENS
                // ------------------------------------------------

                for (const family of familyDefinitions) {
                    const partnership =
                        await tx.orm.genealogy.Partnership.create({
                            treeId: tree.id
                        });

                    totalPartnerships++;

                    // Liens des partenaires
                    for (const [personIndex, otherIndex] of [
                        [family.partners[0], family.partners[1]],
                        [family.partners[1], family.partners[0]]
                    ]) {
                        await tx.orm.genealogy.PartnerLink.create({
                            personId: persons[personIndex].id,
                            partnershipId: partnership.id,
                            type: "MARRIAGE"
                        });

                        totalPartnerLinks++;
                    }

                    // Liens des enfants
                    for (const childIndex of family.children) {
                        await tx.orm.genealogy.ChildLink.create({
                            personId: persons[childIndex].id,
                            partnershipId: partnership.id
                        });

                        totalChildLinks++;
                    }
                }

                console.log(
                    `Arbre ${treeSeed.name} : 10 personnes et 3 unions créées.`
                );
            }

            return {
                trees: trees.length,
                persons: totalPersons,
                partnerships: totalPartnerships,
                partnerLinks: totalPartnerLinks,
                childLinks: totalChildLinks
            };
        });

        console.log("\n================================");
        console.log("REMPLISSAGE TERMINÉ");
        console.log("================================");
        console.log(`Arbres : ${result.trees}`);
        console.log(`Personnes : ${result.persons}`);
        console.log(`Unions : ${result.partnerships}`);
        console.log(`Liens partenaires : ${result.partnerLinks}`);
        console.log(`Liens enfants : ${result.childLinks}`);
        console.log("================================");

    } catch (error) {
        console.error("Erreur pendant le remplissage :", error);
        process.exitCode = 1;

    } finally {
        await db.close();
        console.log("Connexion à la base fermée.");
    }
}

// ============================================================
// 3. EXÉCUTION
// ============================================================

void seed();

