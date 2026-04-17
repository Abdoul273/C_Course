
export interface Lesson {
  id: string;
  title: string;
  category: string;
  content: string;
  codeExample?: string;
}

export const CURRICULUM: Lesson[] = [
  {
    id: "intro",
    title: "Introduction au C",
    category: "Bases",
    content: "Le langage C est un langage de programmation impératif et polyvalent. Créé au début des années 1970, il reste l'un des langages les plus utilisés pour les systèmes d'exploitation et les applications bas niveau.",
    codeExample: "#include <stdio.h>\n\nint main() {\n    printf(\"Hello, World!\\n\");\n    return 0;\n}"
  },
  {
    id: "vars",
    title: "Variables et Types",
    category: "Bases",
    content: "C est un langage fortement typé. Les types fondamentaux incluent int (entiers), float/double (décimaux) et char (caractères). On peut modifier leur comportement avec 'unsigned', 'short' ou 'long'.",
    codeExample: `#include <stdio.h>
#include <stdbool.h>

/**
 * Programme illustrant les types de données fondamentaux en C.
 */
int main() {
    int integer = 42;
    unsigned int positiveOnly = 100;
    float pi_approx = 3.14159f;
    char initial = 'C';
    bool is_active = true;

    printf("--- TYPES DE DONNEES ---\\n");
    printf("Entier: %d | Non-signé: %u\\n", integer, positiveOnly);
    printf("Flottant: %.2f | Caractère: %c | Booléen: %s\\n", pi_approx, initial, is_active ? "OUI" : "NON");

    return 0;
}`
  },
  {
    id: "ops",
    title: "Opérateurs Arithmétiques",
    category: "Bases",
    content: "Les opérateurs standards : +, -, *, /, % (modulo). Attention à la division entière ! Si vous divisez deux entiers, le résultat est tronqué vers zéro.",
    codeExample: `#include <stdio.h>

/**
 * Exploration des calculs arithmétiques.
 */
int main() {
    int a = 11, b = 4;
    
    printf("Addition: %d + %d = %d\\n", a, b, a + b);
    printf("Division entière: %d / %d = %d\\n", a, b, a / b);
    printf("Reste (Modulo): %d %% %d = %d\\n", a, b, a % b);
    
    // Casting pour obtenir un résultat précis
    float division_reelle = (float)a / b;
    printf("Division réelle (cast): %.2f\\n", division_reelle);

    return 0;
}`
  },
  {
    id: "logic_ops",
    title: "Opérateurs Logiques",
    category: "Logique",
    content: "Utilisés pour les conditions : && (ET), || (OU), ! (NON). En C, 0 est Faux, tout le reste est Vrai.",
    codeExample: "if (x > 0 && x < 100) {\n    // ...\n}"
  },
  {
    id: "control",
    title: "Structures de Contrôle",
    category: "Logique",
    content: "Le flux est contrôlé par if/else if/else et switch/case. Le switch est idéal pour les menus ou les choix multiples basés sur des constantes.",
    codeExample: `#include <stdio.h>

int main() {
    int score = 85;

    // Structure IF/ELSE
    if (score >= 90) {
        printf("Mention: Excellent\\n");
    } else if (score >= 70) {
        printf("Mention: Bien\\n");
    } else {
        printf("Mention: Passable\\n");
    }

    // Structure SWITCH
    int choix = 2;
    switch(choix) {
        case 1: printf("Action 1\\n"); break;
        case 2: printf("Action 2 sélectionnée\\n"); break;
        default: printf("Inconnu\\n");
    }

    return 0;
}`
  },
  {
    id: "loops",
    title: "Boucles (For, While)",
    category: "Logique",
    content: "Répéter des tâches avec 'for' (connu d'avance), 'while' (conditionnelle) ou 'do-while' (au moins une fois).",
    codeExample: "while (x > 0) {\n    x--;\n}"
  },
  {
    id: "functions",
    title: "Fonctions et Portée",
    category: "Fonctions",
    content: "Modularisez votre code. Une fonction a un prototype, une définition et une portée (locale vs globale).",
    codeExample: "int add(int a, int b); // Prototype\n\nint add(int a, int b) { return a + b; }"
  },
  {
    id: "recursion",
    title: "Récursion",
    category: "Fonctions",
    content: "Une fonction qui s'appelle elle-même. Utile pour les fractales, les parcours d'arbres ou les factorielles.",
    codeExample: "int fact(int n) {\n    if (n <= 1) return 1;\n    return n * fact(n-1);\n}"
  },
  {
    id: "arrays",
    title: "Tableaux (Arrays)",
    category: "Tableaux",
    content: "Collection d'éléments du même type en mémoire contiguë. Les indices commencent à 0.",
    codeExample: "int scores[5] = {10, 20, 30, 40, 50};\nscores[0] = 100;"
  },
  {
    id: "multi_arrays",
    title: "Tableaux Multidimensionnels",
    category: "Tableaux",
    content: "Grilles ou matrices. Stockés ligne par ligne en mémoire.",
    codeExample: "int matrix[2][3] = {{1,2,3}, {4,5,6}};"
  },
  {
    id: "strings",
    title: "Chaînes (Strings)",
    category: "Tableaux",
    content: "Tableaux de 'char' finis par '\\0'. Manipulation via <string.h>.",
    codeExample: "char name[] = \"C-Master\";\nstrcpy(dest, src);"
  },
  {
    id: "pointers",
    title: "Les Pointeurs",
    category: "Pointeurs",
    content: "Un pointeur stocke l'adresse d'une variable. L'opérateur '&' donne l'adresse, tandis que '*' (déréférencement) permet d'accéder à la valeur pointée.",
    codeExample: `#include <stdio.h>

/**
 * Manipulation directe de la mémoire via les pointeurs.
 */
int main() {
    int variable = 100;
    int *ptr = &variable; // ptr contient l'adresse de 'variable'

    printf("Valeur originale: %d\\n", variable);
    printf("Adresse mémoire: %p\\n", (void*)ptr);

    // Modification via le pointeur
    *ptr = 200; 

    printf("Valeur après modification via pointeur: %d\\n", variable);
    
    // Pointeur de pointeur
    int **doublePtr = &ptr;
    printf("Valeur via double pointeur: %d\\n", **doublePtr);

    return 0;
}`
  },
  {
    id: "pointer_arith",
    title: "Arithmétique des Pointeurs",
    category: "Pointeurs",
    content: "Avancer dans la mémoire. l'incrémentation dépend de la taille du type pointé.",
    codeExample: "int arr[3];\nint *p = arr;\np++; // pointe vers arr[1]"
  },
  {
    id: "func_pointers",
    title: "Pointeurs de Fonctions",
    category: "Pointeurs",
    content: "Stocker l'adresse d'une fonction pour l'appeler dynamiquement. Utile pour les callbacks.",
    codeExample: "void (*ptr)(int) = &myFunc;\nptr(10);"
  },
  {
    id: "structs",
    title: "Structures (Structs)",
    category: "Structs & Co",
    content: "Types personnalisés regroupant différentes données. Accès via '.' ou '->' pour les pointeurs.",
    codeExample: "struct Point { int x, y; };\nstruct Point p = {10, 20};"
  },
  {
    id: "typedef",
    title: "Typedef et Enums",
    category: "Structs & Co",
    content: "Simplifier les noms de types et définir des constantes nommées groupées.",
    codeExample: "typedef struct Point Point;\nenum Status { OK, ERR };"
  },
  {
    id: "unions",
    title: "Unions et Bitfields",
    category: "Structs & Co",
    content: "Optimisation mémoire : une union partage le même espace pour plusieurs membres. Les bitfields gèrent les bits individuellement.",
    codeExample: "union Data { int i; float f; };\nstruct Pack { unsigned int b : 1; };"
  },
  {
    id: "malloc",
    title: "Allocation Dynamique",
    category: "Mémoire",
    content: "Gérer le tas (heap) avec malloc, calloc, realloc et free. Crucial pour les structures flexibles.",
    codeExample: "int *p = malloc(sizeof(int) * 10);\nfree(p);"
  },
  {
    id: "bitwise",
    title: "Opérations Binaires",
    category: "Avancé",
    content: "Manipuler les bits directement : &, |, ^, ~, <<, >>.",
    codeExample: "int flags = 1 << 3; // Positionne le 4ème bit"
  },
  {
    id: "preprocessor",
    title: "Macros et Directives",
    category: "Avancé",
    content: "Instructions pour le compilateur avant la compilation réelle.",
    codeExample: "#define MIN(a,b) ((a)<(b)?(a):(b))"
  },
  {
    id: "fileio",
    title: "Manipulation de Fichiers",
    category: "E/S",
    content: "Entrées/Sorties sur disque via FILE*. fopen, fclose, fread, fwrite.",
    codeExample: "FILE *f = fopen(\"data.bin\", \"rb\");"
  },
  {
    id: "headers",
    title: "Headers et Projets",
    category: "Organisation",
    content: "Séparer l'interface (.h) de l'implémentation (.c) pour les grands projets.",
    codeExample: "#ifndef HEADER_H\n#define HEADER_H\n...\n#endif"
  }
];

export const C_KEYWORDS = [
  "auto", "break", "case", "char", "const", "continue", "default", "do",
  "double", "else", "enum", "extern", "float", "for", "goto", "if",
  "int", "long", "register", "return", "short", "signed", "sizeof", "static",
  "struct", "switch", "typedef", "union", "unsigned", "void", "volatile", "while",
  "printf", "scanf", "include", "define", "main", "stdio.h", "stdlib.h", "math.h", "string.h"
];
